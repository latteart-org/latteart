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
  <v-list-item
    @click="scriptGenerationOptionDialogIsOpened = true"
    :disabled="isDisabled"
  >
    <v-list-item-title>{{
      $store.getters.message("history-view.generate-testscript")
    }}</v-list-item-title>
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
  </v-list-item>
</template>

<script lang="ts">
import DownloadLinkDialog from "@/components/pages/common/DownloadLinkDialog.vue";
import ErrorMessageDialog from "@/components/pages/common/ErrorMessageDialog.vue";
import ScriptGenerationOptionDialog from "@/components/pages/common/ScriptGenerationOptionDialog.vue";
import { Component, Vue } from "vue-property-decorator";
import { OperationHistoryState } from "@/store/operationHistory";

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
    return (
      this.isCapturing ||
      this.isReplaying ||
      this.isResuming ||
      this.sequence === 0 ||
      this.isGeneratingTestScripts
    );
  }

  private get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  private get isReplaying(): boolean {
    return this.$store.state.captureControl.isReplaying;
  }

  private get isResuming(): boolean {
    return this.$store.state.captureControl.isResuming;
  }

  private get sequence() {
    const history = (
      this.$store.state.operationHistory as OperationHistoryState
    ).history;

    return history.at(-1)?.operation.sequence ?? 0;
  }

  private get currentRepositoryUrl(): string {
    return this.$store.state.repositoryService.serviceUrl;
  }

  private generateTestScript(option: {
    testScript: {
      isSimple: boolean;
    };
    testData: {
      useDataDriven: boolean;
      maxGeneration: number;
    };
    buttonDefinitions: {
      tagname: string;
      attribute?: { name: string; value: string };
    }[];
  }) {
    (async () => {
      this.isGeneratingTestScripts = true;

      try {
        this.$store.dispatch("openProgressDialog", {
          message: this.$store.getters.message(
            "manage-header.generating-test-script"
          ),
        });
        const testScriptInfo = await this.$store.dispatch(
          "operationHistory/generateTestScripts",
          {
            option,
          }
        );
        this.$store.dispatch("closeProgressDialog");
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
        this.$store.dispatch("closeProgressDialog");
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
