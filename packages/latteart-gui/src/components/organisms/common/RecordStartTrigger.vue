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
    <slot name="activator" v-bind="{ on: startCapture, isDisabled }" />

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { TimestampImpl } from "@/lib/common/Timestamp";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useRootStore } from "@/stores/root";
import { computed, defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  props: {
    initial: { type: Boolean, default: false }
  },
  components: {
    "error-message-dialog": ErrorMessageDialog
  },
  setup(props) {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();
    const router = useRouter();

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const isDisabled = computed((): boolean => {
      return (
        !url.value ||
        isReplaying.value ||
        isResuming.value ||
        !urlIsValid.value ||
        isCapturing.value
      );
    });

    const url = computed((): string => {
      return captureControlStore.url;
    });

    const testResultName = computed((): string => {
      return captureControlStore.testResultName;
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

    const urlIsValid = computed((): boolean => {
      return captureControlStore.urlIsValid;
    });

    const startCapture = async (): Promise<void> => {
      operationHistoryStore.clearTestResult();

      goToHistoryView();

      try {
        await rootStore.openProgressDialog({
          message: rootStore.message("start-capture-page.starting-capture")
        });

        if (props.initial) {
          await resetHistory();
        }

        if (operationHistoryStore.testResultInfo.id === "") {
          await operationHistoryStore.createTestResult({
            initialUrl: url.value,
            name: testResultName.value
          });
        }

        const history = operationHistoryStore.history;
        const startTime = new TimestampImpl().epochMilliseconds();

        if (history.length === 0) {
          await operationHistoryStore.changeCurrentTestResult({
            startTime,
            initialUrl: url.value
          });
        } else if (history.length > 0) {
          await operationHistoryStore.changeCurrentTestResult({
            startTime,
            initialUrl: ""
          });
        }

        await captureControlStore.startCapture({
          url: url.value,
          callbacks: {
            onEnd: async (error?: Error) => {
              rootStore.closeProgressDialog();

              if (error) {
                goToHistoryView();
                throw error;
              }
            }
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          goToHistoryView();
        } else {
          throw error;
        }
      } finally {
        rootStore.closeProgressDialog();
      }
    };

    const resetHistory = async () => {
      operationHistoryStore.clearTestResult();
      operationHistoryStore.storingTestResultInfos = [];
      operationHistoryStore.clearScreenTransitionDiagramGraph();
      operationHistoryStore.clearElementCoverages();
      operationHistoryStore.clearInputValueTable();
      captureControlStore.resetTimer();
    };

    const goToHistoryView = () => {
      const targetPath = "/test-result";

      if (router.currentRoute.value.path !== targetPath) {
        router.push({ path: targetPath }).catch((err: Error) => {
          if (err.name !== "NavigationDuplicated") {
            throw err;
          }
        });
      }
    };

    return {
      errorMessageDialogOpened,
      errorMessage,
      isDisabled,
      startCapture
    };
  }
});
</script>
