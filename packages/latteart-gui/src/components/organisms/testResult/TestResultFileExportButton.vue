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
    <v-list-item-title>{{ $t("import-export-dialog.test-result-export-title") }}</v-list-item-title>
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
      :downloadMessage="$t('common.download-link')"
      @close="downloadLinkDialogOpened = false"
    />
  </v-list-item>
</template>

<script lang="ts">
import DownloadLinkDialog from "@/components/molecules/DownloadLinkDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useRootStore } from "@/stores/root";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "download-link-dialog": DownloadLinkDialog
  },
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const downloadLinkDialogOpened = ref(false);
    const downloadLinkDialogTitle = ref("");
    const downloadLinkDialogMessage = ref("");
    const downloadLinkDialogAlertMessage = ref("");
    const downloadLinkDialogLinkUrl = ref("");

    const isExportingData = ref(false);

    const isDisabled = computed((): boolean => {
      return (
        isCapturing.value ||
        isReplaying.value ||
        isResuming.value ||
        sequence.value === 0 ||
        isExportingData.value
      );
    });

    const isCapturing = computed((): boolean => {
      return captureControlStore.isCapturing;
    });

    const isReplaying = computed((): boolean => {
      return captureControlStore.isReplaying;
    });

    const isResuming = computed((): boolean => {
      return captureControlStore.isResuming;
    });

    const sequence = computed(() => {
      const history = operationHistoryStore.history;

      return history.at(-1)?.operation.sequence ?? 0;
    });

    const exportData = () => {
      (async () => {
        isExportingData.value = true;
        const testResultId = operationHistoryStore.testResultInfo.id;

        try {
          rootStore.openProgressDialog({
            message: rootStore.message("import-export-dialog.creating-export-data")
          });
          const exportDataPath = await operationHistoryStore
            .exportData({ testResultId })
            .catch((error) => {
              console.error(error);
            });
          rootStore.closeProgressDialog();
          downloadLinkDialogTitle.value = rootStore.message("common.confirm");
          downloadLinkDialogMessage.value = rootStore.message(
            "import-export-dialog.create-export-data-succeeded"
          );
          downloadLinkDialogAlertMessage.value = "";
          downloadLinkDialogLinkUrl.value = `${currentRepositoryUrl.value}/${exportDataPath}`;
          downloadLinkDialogOpened.value = true;
        } catch (error) {
          rootStore.closeProgressDialog();
          if (error instanceof Error) {
            errorMessage.value = error.message;
            errorMessageDialogOpened.value = true;
          } else {
            throw error;
          }
        } finally {
          isExportingData.value = false;
        }
      })();
    };

    const currentRepositoryUrl = computed((): string => {
      return rootStore.repositoryService?.serviceUrl ?? "";
    });

    return {
      t: rootStore.message,
      errorMessageDialogOpened,
      errorMessage,
      downloadLinkDialogOpened,
      downloadLinkDialogTitle,
      downloadLinkDialogMessage,
      downloadLinkDialogAlertMessage,
      downloadLinkDialogLinkUrl,
      isDisabled,
      exportData
    };
  }
});
</script>
