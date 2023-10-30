<!--
 Copyright 2023 NTT Corporation.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->

<template>
  <v-app>
    <error-handler>
      <div style="height: 100vh">
        <history-display
          :rawHistory="history"
          :message="messageProvider"
          :screenDefinitionConfig="screenDefinitionConfig"
        ></history-display>
      </div>
    </error-handler>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ScreenDefinitionSetting } from "../../lib/common/settings/Settings";
import {
  MessageProvider,
  OperationWithNotes,
} from "@/lib/operationHistory/types";
import HistoryDisplay from "@/components/pages/history/HistoryDisplay.vue";
import { createI18n } from "@/locale/i18n";
import VueI18n from "vue-i18n";
import ErrorHandler from "../../ErrorHandler.vue";
import { parseHistoryLog } from "@/lib/common/util";
import { OperationHistoryState } from "@/store/operationHistory";

@Component({
  components: {
    "error-handler": ErrorHandler,
    "history-display": HistoryDisplay,
  },
})
export default class App extends Vue {
  private i18n: VueI18n | null = null;

  private created() {
    (async () => {
      this.$store.commit("setProjectSettings", { settings: this.settings });

      this.i18n = createI18n(this.settings.locale);

      this.$store.commit("operationHistory/resetHistory", {
        historyItems: parseHistoryLog((this as any).$historyLogs[0].history),
      });

      const testResultInfos = (this as any).$historyLogs.map((history: any) => {
        return {
          id: history.testResultId,
          name: history.testResultName,
        };
      });
      this.$store.commit("operationHistory/setStoringTestResultInfos", {
        testResultInfos: testResultInfos,
      });
      this.$store.commit("operationHistory/setTestResultInfo", {
        repositoryUrl: "",
        id: testResultInfos[0].id,
        name: testResultInfos[0].name,
        parentTestResultId: "",
      });

      await this.$store.dispatch(
        "operationHistory/updateModelsFromSequenceView",
        { testResultId: (this as any).$historyLogs[0].testResultId }
      );
      await this.$store.dispatch("operationHistory/updateModelsFromGraphView", {
        testResultIds: [],
      });

      this.$store.commit("operationHistory/setCanUpdateModels", {
        setCanUpdateModels: false,
      });
    })();
  }

  private get history(): OperationWithNotes[] {
    return (this.$store.state.operationHistory as OperationHistoryState)
      .history;
  }

  private get settings() {
    return (this as any).$settings;
  }

  private get screenDefinitionConfig(): ScreenDefinitionSetting {
    return this.settings.config.screenDefinition;
  }

  private get messageProvider(): MessageProvider {
    if (!this.i18n) {
      return (message: string, args?: any) => {
        return "";
      };
    }
    const i18n = this.i18n;
    return (message: string, args?: any) => {
      return i18n.t(message, args).toString();
    };
  }
}
</script>
