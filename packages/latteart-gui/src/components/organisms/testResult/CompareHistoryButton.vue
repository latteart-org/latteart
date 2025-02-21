<!--
 Copyright 2025 NTT Corporation.

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
    <v-list-item :disabled="isDisabled" @click="openConfirmDialog">
      <v-list-item-title>{{ $t("compare-history-button.compare-test-result") }}</v-list-item-title>
    </v-list-item>

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="$t('compare-history-button.compare-test-result')"
      :message="$t('compare-history-button.compare-test-result-message')"
      :on-accept="compareHistory"
      :strong="false"
      @close="confirmDialogOpened = false"
    />

    <comparison-result-dialog
      :opened="resultDialogOpened"
      :comparison-result="comparisonResult"
      @close="resultDialogOpened = false"
    />

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import ConfirmDialog from "@/components/molecules/ConfirmDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import {
  type TestResultComparisonResult,
  type TestResultSummary
} from "@/lib/operationHistory/types";
import ComparisonResultDialog from "@/components/organisms/dialog/ComparisonResultDialog.vue";
import { computed, defineComponent, ref } from "vue";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";

export default defineComponent({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "confirm-dialog": ConfirmDialog,
    "comparison-result-dialog": ComparisonResultDialog
  },
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();

    const confirmDialogOpened = ref(false);
    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");
    const resultDialogOpened = ref(false);
    const comparisonResult = ref<TestResultComparisonResult | null>(null);

    const isDisabled = computed((): boolean => {
      return (
        isCapturing.value ||
        isReplaying.value ||
        isResuming.value ||
        operations.value.length === 0 ||
        parentTestResultId.value === ""
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

    const testResultId = computed((): string => {
      return operationHistoryStore.testResultInfo.id;
    });

    const parentTestResultId = computed((): string => {
      return operationHistoryStore.testResultInfo.parentTestResultId;
    });

    const operations = computed((): OperationForGUI[] => {
      return operationHistoryStore.getOperations();
    });

    const openConfirmDialog = () => {
      confirmDialogOpened.value = true;
    };

    const compareHistory = async (): Promise<void> => {
      rootStore.openProgressDialog({
        message: rootStore.message("common.comparing-test-result")
      });

      try {
        const testResults: TestResultSummary[] = await operationHistoryStore.getTestResults();
        if (testResults.length === 0) {
          throw new Error(
            rootStore.message("error.operation_history.compare_test_result_not_exist")
          );
        }

        const { actualTestResultId, expectedTestResultId } = findCompareTargets(testResults);

        if (!expectedTestResultId) {
          throw new Error(
            rootStore.message("error.operation_history.compare_test_result_not_exist")
          );
        }

        comparisonResult.value = await operationHistoryStore.compareTestResults({
          actualTestResultId,
          expectedTestResultId
        });
        resultDialogOpened.value = true;
      } catch (error) {
        if (error instanceof Error) {
          errorMessageDialogOpened.value = true;
          errorMessage.value = error.message;
        } else {
          throw error;
        }
      } finally {
        rootStore.closeProgressDialog();
      }
    };

    const findCompareTargets = (testResults: TestResultSummary[]) => {
      const actualTestResult = testResults.find((testResult) => {
        return testResult.id === testResultId.value;
      });

      const expectedTestResult = testResults.find((testResult) => {
        return testResult.id === actualTestResult?.parentTestResultId;
      });

      return {
        actualTestResultId: testResultId.value,
        expectedTestResultId: expectedTestResult?.id ?? undefined
      };
    };

    return {
      confirmDialogOpened,
      errorMessageDialogOpened,
      errorMessage,
      resultDialogOpened,
      comparisonResult,
      isDisabled,
      openConfirmDialog,
      compareHistory
    };
  }
});
</script>
