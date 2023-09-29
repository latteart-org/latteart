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
  <v-card flat class="pa-2">
    <v-card-title>{{
      $store.getters.message("optional-features.snapshot-output.title")
    }}</v-card-title>

    <v-card-actions>
      <v-btn
        :disabled="disabled"
        :dark="!disabled"
        color="primary"
        @click="outputSnapshot"
        >{{
          $store.getters.message(
            "optional-features.snapshot-output.execute-button"
          )
        }}</v-btn
      >
    </v-card-actions>

    <download-link-dialog
      :opened="downloadLinkDialogOpened"
      :title="downloadLinkDialogTitle"
      :message="downloadLinkDialogMessage"
      :alertMessage="downloadLinkDialogAlertMessage"
      :linkUrl="downloadLinkDialogLinkUrl"
      :downloadMessage="$store.getters.message('common.download-link')"
      @close="downloadLinkDialogOpened = false"
    />
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </v-card>
</template>

<script lang="ts">
import DownloadLinkDialog from "@/components/pages/common/DownloadLinkDialog.vue";
import ErrorMessageDialog from "@/components/pages/common/ErrorMessageDialog.vue";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    "download-link-dialog": DownloadLinkDialog,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class SnapshotOutputLauncher extends Vue {
  private downloadLinkDialogOpened = false;
  private downloadLinkDialogTitle = "";
  private downloadLinkDialogMessage = "";
  private downloadLinkDialogAlertMessage = "";
  private downloadLinkDialogLinkUrl = "";
  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private outputSnapshot() {
    (async () => {
      this.$store.dispatch("openProgressDialog", {
        message: this.$store.getters.message("manage-header.creating-snapshot"),
      });

      try {
        const snapshotUrl = await this.$store.dispatch(
          "testManagement/writeSnapshot"
        );

        this.downloadLinkDialogOpened = true;
        this.downloadLinkDialogTitle = this.$store.getters.message(
          "manage-header.output-html"
        );
        this.downloadLinkDialogMessage = this.$store.getters.message(
          "manage.print-html-succeeded"
        );
        this.downloadLinkDialogAlertMessage = "";
        this.downloadLinkDialogLinkUrl = `${this.currentRepositoryUrl}/${snapshotUrl}`;
      } catch (error) {
        if (error instanceof Error) {
          this.errorMessage = error.message;
          this.errorMessageDialogOpened = true;
        } else {
          throw error;
        }
      } finally {
        this.$store.dispatch("closeProgressDialog");
      }
    })();
  }

  private get currentRepositoryUrl() {
    return this.$store.state.repositoryService.serviceUrl;
  }
}
</script>
