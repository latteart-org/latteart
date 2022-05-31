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
      id="exportButton"
      color="grey darken-3"
      @click="exportData"
      :loading="isExportingData"
      :disabled="sequence === 0 || isExportingData"
      :title="$store.getters.message('manage-header.export-option')"
      ><v-icon>file_download</v-icon></v-btn
    >

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
import DownloadLinkDialog from "@/vue/pages/common/DownloadLinkDialog.vue";
import ErrorMessageDialog from "@/vue/pages/common/ErrorMessageDialog.vue";
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

  private get sequence() {
    const history = this.$store.getters["operationHistory/getHistory"]();
    if (history.length === 0) {
      return 0;
    }
    return history[history.length - 1].operation.sequence;
  }

  private exportData() {
    (async () => {
      this.isExportingData = true;
      const testResultId = this.$store.state.operationHistory.testResultInfo.id;

      try {
        const exportDataPath = await this.$store
          .dispatch("operationHistory/exportData", { testResultId })
          .catch((error) => {
            console.error(error);
          });
        this.downloadLinkDialogTitle =
          this.$store.getters.message("common.confirm");
        this.downloadLinkDialogMessage = this.$store.getters.message(
          "import-export-dialog.create-export-data-succeeded"
        );
        this.downloadLinkDialogAlertMessage = "";
        this.downloadLinkDialogLinkUrl = `${this.currentRepositoryUrl}/${exportDataPath}`;
        this.downloadLinkDialogOpened = true;
      } catch (error) {
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
    return this.$store.state.repositoryContainer.serviceUrl;
  }
}
</script>
