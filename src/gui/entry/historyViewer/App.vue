<!--
 Copyright 2022 NTT Corporation.

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
        <v-layout fill-height>
          <history-display
            :rawHistory="testResult.history"
            :coverageSources="testResult.coverageSources"
            :windowHandles="windowHandles"
            :message="messageProvider"
            :screenDefinitionConfig="screenDefinitionConfig"
          ></history-display>
        </v-layout>
      </div>
    </error-handler>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ScreenDefinition } from "../../lib/common/settings/Settings";
import {
  MessageProvider,
  OperationWithNotes,
  CoverageSource,
  InputElementInfo,
} from "../../../gui/lib/operationHistory/types";
import { Note } from "../../../gui/lib/operationHistory/Note";
import { Operation } from "../../../gui/lib/operationHistory/Operation";
import HistoryDisplay from "@/vue/pages/operationHistory/organisms/HistoryDisplay.vue";
import { createI18n } from "@/locale/i18n";
import VueI18n from "vue-i18n";
import ErrorHandler from "../../ErrorHandler.vue";

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
      this.$store.commit("setSettings", { settings: this.settings });
      this.$store.dispatch("operationHistory/setSettings", {
        settings: this.settings,
      });

      this.i18n = createI18n(this.settings.locale);

      const { history, coverageSources } = this.testResult;

      this.$store.commit("operationHistory/resetAllCoverageSources", {
        coverageSources,
      });
      this.$store.commit("operationHistory/resetHistory", {
        historyItems: history,
      });

      await this.$store.dispatch("operationHistory/updateScreenHistory");
    })();
  }

  private get windowHandles() {
    return this.testResult.history
      .map((operationWithNotes) => {
        return operationWithNotes.operation.windowHandle;
      })
      .filter((windowHandle, index, array) => {
        return array.indexOf(windowHandle) === index;
      })
      .map((windowHandle, index) => {
        return {
          text: `window${index + 1}`,
          value: windowHandle,
          available: false,
        };
      });
  }

  private get testResult(): {
    history: OperationWithNotes[];
    coverageSources: CoverageSource[];
  } {
    return {
      history: ((this as any).$historyLog.history as any[]).map((item) => {
        return {
          operation: Operation.createFromOtherOperation({
            other: item.operation,
            overrideParams: {
              imageFilePath: item.operation.imageFileUrl,
              keywordSet: new Set(item.operation.keywordTexts),
            },
          }),
          bugs:
            item.bugs?.map((bug: any) =>
              Note.createFromOtherNote({
                other: bug,
                overrideParams: {
                  imageFilePath: bug.imageFileUrl,
                },
              })
            ) ?? [],
          notices:
            item.notices?.map((notice: any) =>
              Note.createFromOtherNote({
                other: notice,
                overrideParams: {
                  imageFilePath: notice.imageFileUrl,
                },
              })
            ) ?? [],
          intention: item.intention
            ? Note.createFromOtherNote({ other: item.intention })
            : null,
        };
      }),
      coverageSources: (this as any).$historyLog.coverageSources,
    };
  }

  private get settings() {
    return (this as any).$settings;
  }

  private get screenDefinitionConfig(): ScreenDefinition {
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
