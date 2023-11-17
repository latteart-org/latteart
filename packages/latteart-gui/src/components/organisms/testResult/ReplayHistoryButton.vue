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
  TestResultComparisonResult,
  TestResultSummary,
} from "@/lib/operationHistory/types";
import { CaptureControlState } from "@/store/captureControl";
import { OperationHistoryState } from "@/store/operationHistory";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import ComparisonResultDialog from "@/components/organisms/dialog/ComparisonResultDialog.vue";
import ReplayOptionDialog from "@/components/organisms/dialog/ReplayOptionDialog.vue";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";
import { useRouter } from "vue-router/composables";

export default defineComponent({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "replay-option-dialog": ReplayOptionDialog,
    "comparison-result-dialog": ComparisonResultDialog,
  },
  setup() {
    const store = useStore();
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

    const operations = computed((): OperationForGUI[] => {
      return store.getters["operationHistory/getOperations"]();
    });

    const title = computed(() => {
      return isReplaying.value
        ? store.getters.message("app.stop-replay")
        : store.getters.message("app.replay");
    });

    const replayOption = computed(
      (): {
        testResultName: string;
        resultSavingEnabled: boolean;
        comparisonEnabled: boolean;
      } => {
        return ((store.state as any).captureControl as CaptureControlState)
          .replayOption;
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
          await store.dispatch("captureControl/replayOperations", {
            initialUrl: operations.value[0].url,
          });

          if (
            replayOption.value.resultSavingEnabled &&
            replayOption.value.comparisonEnabled
          ) {
            await compareHistory();
          } else {
            store.commit("captureControl/setCompletionDialog", {
              title: store.getters.message("replay.done-title"),
              message: store.getters.message("replay.done-run-operations"),
            });
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
      store.dispatch("openProgressDialog", {
        message: store.getters.message(
          "test-result-page.comparing-test-result"
        ),
      });

      try {
        const testResults: TestResultSummary[] = await store.dispatch(
          "operationHistory/getTestResults"
        );

        if (testResults.length === 0) {
          throw new Error(
            store.getters.message(
              "test-result-page.compare-test-result-not-exist"
            )
          );
        }

        const { actualTestResultId, expectedTestResultId } =
          findCompareTargets(testResults);

        if (!expectedTestResultId) {
          throw new Error(
            store.getters.message(
              "test-result-page.compare-test-result-not-exist"
            )
          );
        }

        comparisonResult.value = await store.dispatch(
          "operationHistory/compareTestResults",
          { actualTestResultId, expectedTestResultId }
        );

        resultDialogOpened.value = true;
      } catch (error) {
        if (error instanceof Error) {
          errorDialogMessage.value = error.message;
          errorDialogOpened.value = true;
        } else {
          throw error;
        }
      } finally {
        store.dispatch("closeProgressDialog");
      }
    };

    const findCompareTargets = (testResults: TestResultSummary[]) => {
      const actualTestResultId = (
        (store.state as any).operationHistory as OperationHistoryState
      ).testResultInfo.id;

      const actualTestResult = testResults.find((testResult) => {
        return testResult.id === actualTestResultId;
      });
      const expectedTestResult = testResults.find((testResult) => {
        return testResult.id === actualTestResult?.parentTestResultId;
      });

      return {
        actualTestResultId,
        expectedTestResultId: expectedTestResult?.id ?? undefined,
      };
    };

    const forceQuitReplay = async () => {
      await store.dispatch("captureControl/forceQuitReplay").catch((error) => {
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
      store,
      errorDialogOpened,
      errorDialogMessage,
      replayOptionDialogOpened,
      resultDialogOpened,
      comparisonResult,
      isDisabled,
      title,
      execute,
      startReplay,
    };
  },
});
</script>
