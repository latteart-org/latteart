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
            :windows="windows"
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
import { ScreenDefinitionSetting } from "../../lib/common/settings/Settings";
import {
  MessageProvider,
  OperationWithNotes,
} from "@/lib/operationHistory/types";
import { NoteForGUI } from "../../lib/operationHistory/NoteForGUI";
import { OperationForGUI } from "../../lib/operationHistory/OperationForGUI";
import HistoryDisplay from "@/components/pages/operationHistory/organisms/HistoryDisplay.vue";
import ScreenDefFactory from "@/lib/operationHistory/ScreenDefFactory";
import { createI18n } from "@/locale/i18n";
import VueI18n from "vue-i18n";
import ErrorHandler from "../../ErrorHandler.vue";
import { CoverageSource } from "latteart-client";
import { OperationHistoryState } from "@/store/operationHistory";
import { extractWindowHandles } from "@/lib/common/windowHandle";

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

      const { history, coverageSources } = this.testResult;

      this.$store.commit("operationHistory/resetAllCoverageSources", {
        coverageSources,
      });
      this.$store.commit("operationHistory/resetHistory", {
        historyItems: history,
      });
      this.$store.commit(
        "operationHistory/setWindows",
        {
          windowHandles: extractWindowHandles(history),
        },
        { root: true }
      );

      await this.$store.dispatch("operationHistory/updateScreenHistory");
    })();
  }

  private get windows() {
    return (this.$store.state.operationHistory as OperationHistoryState)
      .windows;
  }

  private get testResult(): {
    history: OperationWithNotes[];
    coverageSources: CoverageSource[];
  } {
    const screenDefFactory = new ScreenDefFactory(
      this.settings.config.screenDefinition
    );

    return {
      history: ((this as any).$historyLog.history as any[]).map((item) => {
        const { title, url, keywordSet } = item.operation;

        return {
          operation: OperationForGUI.createFromOtherOperation({
            other: item.operation,
            overrideParams: {
              screenDef: screenDefFactory.createFrom(title, url, keywordSet),
              imageFilePath: item.operation.imageFileUrl,
              keywordSet: new Set(
                (
                  item.operation.keywordTexts as (
                    | string
                    | { tagname: string; value: string }
                  )[]
                )?.map((keywordText) => {
                  return typeof keywordText === "string"
                    ? keywordText
                    : keywordText.value;
                }) ?? []
              ),
            },
          }),
          bugs:
            item.bugs?.map((bug: any) =>
              NoteForGUI.createFromOtherNote({
                other: bug,
                overrideParams: {
                  imageFilePath: bug.imageFileUrl,
                },
              })
            ) ?? [],
          notices:
            item.notices?.map((notice: any) =>
              NoteForGUI.createFromOtherNote({
                other: notice,
                overrideParams: {
                  imageFilePath: notice.imageFileUrl,
                },
              })
            ) ?? [],
          intention: item.intention
            ? NoteForGUI.createFromOtherNote({ other: item.intention })
            : null,
        };
      }),
      coverageSources: (this as any).$historyLog.coverageSources,
    };
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
