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
    <v-card-title>{{ $t("optional-features.snapshot-output.title") }}</v-card-title>

    <v-card-actions>
      <v-btn variant="elevated" :disabled="disabled" color="primary" @click="outputSnapshot">{{
        $t("optional-features.snapshot-output.execute-button")
      }}</v-btn>
    </v-card-actions>

    <download-link-dialog
      :opened="downloadLinkDialogOpened"
      :title="downloadLinkDialogTitle"
      :message="downloadLinkDialogMessage"
      :alert-message="downloadLinkDialogAlertMessage"
      :link-url="downloadLinkDialogLinkUrl"
      :download-message="$t('common.download-link')"
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
import DownloadLinkDialog from "@/components/molecules/DownloadLinkDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { type TestMatrix } from "@/lib/testManagement/types";
import { useRootStore } from "@/stores/root";
import { useTestManagementStore } from "@/stores/testManagement";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  components: {
    "download-link-dialog": DownloadLinkDialog,
    "error-message-dialog": ErrorMessageDialog
  },
  setup() {
    const rootStore = useRootStore();
    const testManagementStore = useTestManagementStore();

    const downloadLinkDialogOpened = ref(false);
    const downloadLinkDialogTitle = ref("");
    const downloadLinkDialogMessage = ref("");
    const downloadLinkDialogAlertMessage = ref("");
    const downloadLinkDialogLinkUrl = ref("");
    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const currentRepositoryUrl = computed(() => {
      return rootStore.repositoryService?.serviceUrl ?? "";
    });

    const disabled = computed(() => {
      return !hasTestMatrix.value;
    });

    const hasTestMatrix = computed((): boolean => {
      const testMatrices: TestMatrix[] = testManagementStore.getTestMatrices();

      return testMatrices.length > 0;
    });

    const outputSnapshot = () => {
      (async () => {
        rootStore.openProgressDialog({
          message: rootStore.message("manage-header.creating-snapshot")
        });

        try {
          const snapshotUrl = await testManagementStore.writeSnapshot();

          downloadLinkDialogOpened.value = true;
          downloadLinkDialogTitle.value = rootStore.message("manage-header.output-html");
          downloadLinkDialogMessage.value = rootStore.message("manage.print-html-succeeded");
          downloadLinkDialogAlertMessage.value = "";
          downloadLinkDialogLinkUrl.value = `${currentRepositoryUrl.value}/${snapshotUrl}`;
        } catch (error) {
          if (error instanceof Error) {
            errorMessage.value = error.message;
            errorMessageDialogOpened.value = true;
          } else {
            throw error;
          }
        } finally {
          rootStore.closeProgressDialog();
        }
      })();
    };

    return {
      downloadLinkDialogOpened,
      downloadLinkDialogTitle,
      downloadLinkDialogMessage,
      downloadLinkDialogAlertMessage,
      downloadLinkDialogLinkUrl,
      errorMessageDialogOpened,
      errorMessage,
      disabled,
      outputSnapshot
    };
  }
});
</script>
