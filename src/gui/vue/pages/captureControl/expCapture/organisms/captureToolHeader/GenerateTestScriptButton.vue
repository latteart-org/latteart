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
  <div>
    <v-btn
      icon
      flat
      large
      color="grey darken-3"
      @click="scriptGenerationOptionDialogIsOpened = true"
      :loading="isGeneratingTestScripts"
      :disabled="isDisabled"
      :title="$store.getters.message('history-view.generate-testscript')"
      ><v-icon>description</v-icon></v-btn
    >

    <script-generation-option-dialog
      :opened="scriptGenerationOptionDialogIsOpened"
      @execute="generateTestScript"
      @close="scriptGenerationOptionDialogIsOpened = false"
    >
    </script-generation-option-dialog>

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />

    <download-link-dialog
      :opened="downloadLinkDialogOpened"
      :title="downloadLinkDialogTitle"
      :message="downloadLinkDialogMessage"
      :alertMessage="downloadLinkDialogAlertMessage"
      :linkUrl="downloadLinkDialogLinkUrl"
      @close="downloadLinkDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import {
  OperationHistory,
  OperationWithNotes,
} from "@/lib/operationHistory/types";
import DownloadLinkDialog from "@/vue/pages/common/DownloadLinkDialog.vue";
import ErrorMessageDialog from "@/vue/pages/common/ErrorMessageDialog.vue";
import ScriptGenerationOptionDialog from "@/vue/pages/common/ScriptGenerationOptionDialog.vue";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "script-generation-option-dialog": ScriptGenerationOptionDialog,
    "download-link-dialog": DownloadLinkDialog,
  },
})
export default class GenerateTestScriptButton extends Vue {
  private scriptGenerationOptionDialogIsOpened = false;
  private isGeneratingTestScripts = false;

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private downloadLinkDialogOpened = false;
  private downloadLinkDialogTitle = "";
  private downloadLinkDialogMessage = "";
  private downloadLinkDialogAlertMessage = "";
  private downloadLinkDialogLinkUrl = "";

  private get isDisabled(): boolean {
    return this.sequence === 0 || this.isGeneratingTestScripts;
  }

  private get sequence() {
    const history = this.$store.getters["operationHistory/getHistory"]();
    if (history.length === 0) {
      return 0;
    }
    return history[history.length - 1].operation.sequence;
  }

  private get history(): OperationHistory {
    return this.$store.getters[
      "operationHistory/getHistory"
    ]() as OperationWithNotes[];
  }

  private get currentRepositoryUrl(): string {
    return this.$store.state.repositoryContainer.serviceUrl;
  }

  private generateTestScript(option: {
    testScript: {
      isSimple: boolean;
    };
    testData: {
      useDataDriven: boolean;
      maxGeneration: number;
    };
  }) {
    (async () => {
      this.isGeneratingTestScripts = true;
      const testResultId = this.$store.state.operationHistory.testResultInfo.id;

      const initialUrl = this.$store.state.captureControl.url;
      try {
        const testScriptInfo = await this.$store.dispatch(
          "operationHistory/generateTestScripts",
          {
            testResultId,
            sources: [
              {
                initialUrl,
                history: this.history.map(({ operation }) => operation),
              },
            ],
            option,
          }
        );
        this.downloadLinkDialogTitle =
          this.$store.getters.message("common.confirm");
        this.downloadLinkDialogMessage = this.$store.getters.message(
          "history-view.generate-testscript-succeeded"
        );
        if (testScriptInfo.invalidOperationTypeExists) {
          this.downloadLinkDialogAlertMessage = this.$store.getters.message(
            "history-view.generate-alert-info"
          );
        } else {
          this.downloadLinkDialogAlertMessage = "";
        }
        this.downloadLinkDialogLinkUrl = `${this.currentRepositoryUrl}/${testScriptInfo.outputUrl}`;
        this.scriptGenerationOptionDialogIsOpened = false;
        this.downloadLinkDialogOpened = true;
      } catch (error) {
        this.scriptGenerationOptionDialogIsOpened = false;

        if (error instanceof Error) {
          this.errorMessage = error.message;
          this.errorMessageDialogOpened = true;
        } else {
          throw error;
        }
      } finally {
        this.isGeneratingTestScripts = false;
      }
    })();
  }
}
</script>
