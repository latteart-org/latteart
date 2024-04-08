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
  <div style="display: inline">
    <slot name="activator" v-bind="{ on: openTestResultImportDialog, isDisabled }" />

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />

    <test-result-import-dialog
      :opened="testResultImportDialogOpened"
      @execute="importData"
      @close="testResultImportDialogOpened = false"
    />

    <information-message-dialog
      :opened="informationMessageDialogOpened"
      :title="informationTitle"
      :message="informationMessage"
      @close="informationMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import InformationMessageDialog from "@/components/molecules/InformationMessageDialog.vue";
import TestResultImportDialog from "@/components/organisms/dialog/TestResultImportDialog.vue";
import { computed, defineComponent, ref } from "vue";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";

export default defineComponent({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "information-message-dialog": InformationMessageDialog,
    "test-result-import-dialog": TestResultImportDialog
  },
  setup(_, context) {
    const rootStore = useRootStore();
    const operationHistoryStore = useOperationHistoryStore();
    const captureControlStore = useCaptureControlStore();

    const isImportingTestResults = ref(false);

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const testResultImportDialogOpened = ref(false);

    const informationMessageDialogOpened = ref(false);
    const informationTitle = ref("");
    const informationMessage = ref("");

    const isDisabled = computed((): boolean => {
      return (
        isCapturing.value || isReplaying.value || isResuming.value || isImportingTestResults.value
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

    const openTestResultImportDialog = () => {
      testResultImportDialogOpened.value = true;
    };

    const importData = (testResultImportFile: { data: string; name: string }) => {
      isImportingTestResults.value = true;

      setTimeout(async () => {
        try {
          rootStore.openProgressDialog({
            message: rootStore.message("import-export-dialog.importing-data")
          });
          await operationHistoryStore.importData({
            source: { testResultFile: testResultImportFile }
          });
          rootStore.closeProgressDialog();

          informationMessageDialogOpened.value = true;
          informationTitle.value = rootStore.message(
            "import-export-dialog.test-result-import-title"
          );
          informationMessage.value = rootStore.message(
            "import-export-dialog.import-data-succeeded",
            {
              returnName: testResultImportFile.name
            }
          );

          context.emit("update", testResultImportFile.name);
        } catch (error) {
          rootStore.closeProgressDialog();
          if (error instanceof Error) {
            errorMessage.value = error.message;
            errorMessageDialogOpened.value = true;
          } else {
            throw error;
          }
        } finally {
          isImportingTestResults.value = false;
        }
      }, 300);
    };

    return {
      errorMessageDialogOpened,
      errorMessage,
      testResultImportDialogOpened,
      informationMessageDialogOpened,
      informationTitle,
      informationMessage,
      isDisabled,
      openTestResultImportDialog,
      importData
    };
  }
});
</script>
