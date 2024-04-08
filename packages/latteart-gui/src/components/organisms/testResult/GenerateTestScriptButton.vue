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
  <v-list-item @click="scriptGenerationOptionDialogIsOpened = true" :disabled="isDisabled">
    <v-list-item-title>{{ $t("test-result-page.generate-testscript") }}</v-list-item-title>
    <script-generation-option-dialog
      :opened="scriptGenerationOptionDialogIsOpened"
      @execute="generateTestScript"
      @close="scriptGenerationOptionDialogIsOpened = false"
    >
    </script-generation-option-dialog>

    <download-link-dialog
      :opened="downloadLinkDialogOpened"
      :title="downloadLinkDialogTitle"
      :message="downloadLinkDialogMessage"
      :alertMessage="downloadLinkDialogAlertMessage"
      :linkUrl="downloadLinkDialogLinkUrl"
      @close="downloadLinkDialogOpened = false"
    />

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </v-list-item>
</template>

<script lang="ts">
import DownloadLinkDialog from "@/components/molecules/DownloadLinkDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import ScriptGenerationOptionDialog from "@/components/organisms/dialog/ScriptGenerationOptionDialog.vue";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useRootStore } from "@/stores/root";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "script-generation-option-dialog": ScriptGenerationOptionDialog,
    "download-link-dialog": DownloadLinkDialog
  },
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();

    const scriptGenerationOptionDialogIsOpened = ref(false);
    const isGeneratingTestScripts = ref(false);

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const downloadLinkDialogOpened = ref(false);
    const downloadLinkDialogTitle = ref("");
    const downloadLinkDialogMessage = ref("");
    const downloadLinkDialogAlertMessage = ref("");
    const downloadLinkDialogLinkUrl = ref("");

    const isDisabled = computed((): boolean => {
      return (
        isCapturing.value ||
        isReplaying.value ||
        isResuming.value ||
        sequence.value === 0 ||
        isGeneratingTestScripts.value
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

    const currentRepositoryUrl = computed((): string => {
      return rootStore.repositoryService?.serviceUrl ?? "";
    });

    const generateTestScript = (option: {
      testScript: {
        isSimple: boolean;
        useMultiLocator: boolean;
      };
      testData: {
        useDataDriven: boolean;
        maxGeneration: number;
      };
      buttonDefinitions: {
        tagname: string;
        attribute?: { name: string; value: string };
      }[];
    }) => {
      (async () => {
        isGeneratingTestScripts.value = true;

        try {
          rootStore.openProgressDialog({
            message: rootStore.message("manage-header.generating-test-script")
          });
          const testScriptInfo = await operationHistoryStore.generateTestScripts({
            option
          });
          rootStore.closeProgressDialog();
          downloadLinkDialogTitle.value = rootStore.message("common.confirm");
          downloadLinkDialogMessage.value = rootStore.message(
            "test-result-page.generate-testscript-succeeded"
          );
          if (testScriptInfo.invalidOperationTypeExists) {
            downloadLinkDialogAlertMessage.value = rootStore.message(
              "test-result-page.generate-alert-info"
            );
          } else {
            downloadLinkDialogAlertMessage.value = "";
          }
          downloadLinkDialogLinkUrl.value = `${currentRepositoryUrl.value}/${testScriptInfo.outputUrl}`;
          scriptGenerationOptionDialogIsOpened.value = false;
          downloadLinkDialogOpened.value = true;
        } catch (error) {
          rootStore.closeProgressDialog();
          scriptGenerationOptionDialogIsOpened.value = false;

          if (error instanceof Error) {
            errorMessage.value = error.message;
            errorMessageDialogOpened.value = true;
          } else {
            throw error;
          }
        } finally {
          isGeneratingTestScripts.value = false;
        }
      })();
    };

    return {
      t: rootStore.message,
      scriptGenerationOptionDialogIsOpened,
      errorMessageDialogOpened,
      errorMessage,
      downloadLinkDialogOpened,
      downloadLinkDialogTitle,
      downloadLinkDialogMessage,
      downloadLinkDialogAlertMessage,
      downloadLinkDialogLinkUrl,
      isDisabled,
      generateTestScript
    };
  }
});
</script>
