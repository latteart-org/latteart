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
  <v-list-item @click="exportData" :disabled="isDisabled">
    <v-list-item-title>{{
      $store.getters.message("import-export-dialog.test-result-export-title")
    }}</v-list-item-title>
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
import { OperationHistoryState } from "@/store/operationHistory";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "download-link-dialog": DownloadLinkDialog,
  },
})
export default class TestResultFileExportButton extends Vue {
  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private downloadLinkDialogOpened = false;
  private downloadLinkDialogTitle = "";
  private downloadLinkDialogMessage = "";
  private downloadLinkDialogAlertMessage = "";
  private downloadLinkDialogLinkUrl = "";

  private isExportingData = false;

  private get isDisabled(): boolean {
    return (
      this.isCapturing ||
      this.isReplaying ||
      this.isResuming ||
      this.sequence === 0 ||
      this.isExportingData
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

  private exportData() {
    (async () => {
      this.isExportingData = true;
      const testResultId = this.$store.state.operationHistory.testResultInfo.id;

      try {
        this.$store.dispatch("openProgressDialog", {
          message: this.$store.getters.message(
            "import-export-dialog.creating-export-data"
          ),
        });
        const exportDataPath = await this.$store
          .dispatch("operationHistory/exportData", { testResultId })
          .catch((error) => {
            console.error(error);
          });
        this.$store.dispatch("closeProgressDialog");
        this.downloadLinkDialogTitle =
          this.$store.getters.message("common.confirm");
        this.downloadLinkDialogMessage = this.$store.getters.message(
          "import-export-dialog.create-export-data-succeeded"
        );
        this.downloadLinkDialogAlertMessage = "";
        this.downloadLinkDialogLinkUrl = `${this.currentRepositoryUrl}/${exportDataPath}`;
        this.downloadLinkDialogOpened = true;
      } catch (error) {
        this.$store.dispatch("closeProgressDialog");
        if (error instanceof Error) {
          this.errorMessage = error.message;
          this.errorMessageDialogOpened = true;
        } else {
          throw error;
        }
      } finally {
        this.isExportingData = false;
      }
    })();
  }

  private get currentRepositoryUrl(): string {
    return this.$store.state.repositoryService.serviceUrl;
  }
}
</script>
