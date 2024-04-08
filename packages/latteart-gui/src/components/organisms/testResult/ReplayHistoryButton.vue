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
  <v-list-item @click="execute" :disabled="isDisabled">
    <v-list-item-title>{{ title }}</v-list-item-title>
    <error-message-dialog
      :opened="errorDialogOpened"
      :message="errorDialogMessage"
      @close="errorDialogOpened = false"
    />

    <replay-option-dialog
      :opened="replayOptionDialogOpened"
      @close="replayOptionDialogOpened = false"
      @ok="startReplay"
    />

    <comparison-result-dialog
      :opened="resultDialogOpened"
      :comparisonResult="comparisonResult"
      @close="resultDialogOpened = false"
    />
  </v-list-item>
</template>

<script lang="ts">
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import {
  type TestResultComparisonResult,
  type TestResultSummary
} from "@/lib/operationHistory/types";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import ComparisonResultDialog from "@/components/organisms/dialog/ComparisonResultDialog.vue";
import ReplayOptionDialog from "@/components/organisms/dialog/ReplayOptionDialog.vue";
import { computed, defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";

export default defineComponent({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "replay-option-dialog": ReplayOptionDialog,
    "comparison-result-dialog": ComparisonResultDialog
  },
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();
    const router = useRouter();

    const errorDialogOpened = ref(false);
    const errorDialogMessage = ref("");

    const replayOptionDialogOpened = ref(false);

    const resultDialogOpened = ref(false);

    const comparisonResult = ref<TestResultComparisonResult | null>(null);

    const isDisabled = computed((): boolean => {
      return (
        (isCapturing.value && !isReplaying.value) ||
        isResuming.value ||
        operations.value.length === 0
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

    const operations = computed((): OperationForGUI[] => {
      return operationHistoryStore.getOperations();
    });

    const title = computed(() => {
      return isReplaying.value
        ? rootStore.message("app.stop-replay")
        : rootStore.message("app.replay");
    });

    const replayOption = computed(
      (): {
        testResultName: string;
        resultSavingEnabled: boolean;
        comparisonEnabled: boolean;
      } => {
        return captureControlStore.replayOption;
      }
    );

    const execute = async () => {
      if (!isReplaying.value) {
        replayOptionDialogOpened.value = true;
      } else {
        await forceQuitReplay();
      }
    };

    const startReplay = async () => {
      await replayOperations();
    };

    const replayOperations = async () => {
      goToHistoryView();
      (async () => {
        try {
          await captureControlStore.replayOperations({
            initialUrl: operations.value[0].url
          });

          if (replayOption.value.resultSavingEnabled && replayOption.value.comparisonEnabled) {
            await compareHistory();
          } else {
            captureControlStore.completionDialogData = {
              title: rootStore.message("replay.done-title"),
              message: rootStore.message("replay.done-run-operations")
            };
          }
        } catch (error) {
          if (error instanceof Error) {
            errorDialogOpened.value = true;
            errorDialogMessage.value = error.message;
          } else {
            throw error;
          }
        }
      })();
    };

    const compareHistory = async () => {
      rootStore.openProgressDialog({
        message: rootStore.message("test-result-page.comparing-test-result")
      });

      try {
        const testResults: TestResultSummary[] = await operationHistoryStore.getTestResults();
        if (testResults.length === 0) {
          throw new Error(rootStore.message("test-result-page.compare-test-result-not-exist"));
        }

        const { actualTestResultId, expectedTestResultId } = findCompareTargets(testResults);

        if (!expectedTestResultId) {
          throw new Error(rootStore.message("test-result-page.compare-test-result-not-exist"));
        }

        comparisonResult.value = await operationHistoryStore.compareTestResults({
          actualTestResultId,
          expectedTestResultId
        });

        resultDialogOpened.value = true;
      } catch (error) {
        if (error instanceof Error) {
          errorDialogMessage.value = error.message;
          errorDialogOpened.value = true;
        } else {
          throw error;
        }
      } finally {
        rootStore.closeProgressDialog();
      }
    };

    const findCompareTargets = (testResults: TestResultSummary[]) => {
      const actualTestResultId = operationHistoryStore.testResultInfo.id;

      const actualTestResult = testResults.find((testResult) => {
        return testResult.id === actualTestResultId;
      });
      const expectedTestResult = testResults.find((testResult) => {
        return testResult.id === actualTestResult?.parentTestResultId;
      });

      return {
        actualTestResultId,
        expectedTestResultId: expectedTestResult?.id ?? undefined
      };
    };

    const forceQuitReplay = async () => {
      await captureControlStore.forceQuitReplay().catch((error) => {
        console.log(error);
      });
    };

    const goToHistoryView = () => {
      router.push({ path: "/test-result" }).catch((err: Error) => {
        if (err.name !== "NavigationDuplicated") {
          throw err;
        }
      });
    };

    return {
      errorDialogOpened,
      errorDialogMessage,
      replayOptionDialogOpened,
      resultDialogOpened,
      comparisonResult,
      isDisabled,
      title,
      execute,
      startReplay
    };
  }
});
</script>
