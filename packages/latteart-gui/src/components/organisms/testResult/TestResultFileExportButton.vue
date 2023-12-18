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
      store.getters.message("import-export-dialog.test-result-export-title")
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
      :downloadMessage="store.getters.message('common.download-link')"
      @close="downloadLinkDialogOpened = false"
    />
  </v-list-item>
</template>

<script lang="ts">
import DownloadLinkDialog from "@/components/molecules/DownloadLinkDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import { CaptureControlState } from "@/store/captureControl";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "download-link-dialog": DownloadLinkDialog,
  },
  setup() {
    const store = useStore();

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
      return ((store.state as any).captureControl as CaptureControlState)
        .isCapturing;
    });

    const isReplaying = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState)
        .isReplaying;
    });

    const isResuming = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState)
        .isResuming;
    });

    const sequence = computed(() => {
      const history = (
        (store.state as any).operationHistory as OperationHistoryState
      ).history;

      return history.at(-1)?.operation.sequence ?? 0;
    });

    const exportData = () => {
      (async () => {
        isExportingData.value = true;
        const testResultId = (
          (store.state as any).operationHistory as OperationHistoryState
        ).testResultInfo.id;

        try {
          store.dispatch("openProgressDialog", {
            message: store.getters.message(
              "import-export-dialog.creating-export-data"
            ),
          });
          const exportDataPath = await store
            .dispatch("operationHistory/exportData", { testResultId })
            .catch((error) => {
              console.error(error);
            });
          store.dispatch("closeProgressDialog");
          downloadLinkDialogTitle.value =
            store.getters.message("common.confirm");
          downloadLinkDialogMessage.value = store.getters.message(
            "import-export-dialog.create-export-data-succeeded"
          );
          downloadLinkDialogAlertMessage.value = "";
          downloadLinkDialogLinkUrl.value = `${currentRepositoryUrl.value}/${exportDataPath}`;
          downloadLinkDialogOpened.value = true;
        } catch (error) {
          store.dispatch("closeProgressDialog");
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
      return store.state.repositoryService.serviceUrl;
    });

    return {
      store,
      errorMessageDialogOpened,
      errorMessage,
      downloadLinkDialogOpened,
      downloadLinkDialogTitle,
      downloadLinkDialogMessage,
      downloadLinkDialogAlertMessage,
      downloadLinkDialogLinkUrl,
      isDisabled,
      exportData,
    };
  },
});
</script>
