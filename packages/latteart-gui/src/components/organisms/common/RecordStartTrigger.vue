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
import { CaptureControlState } from "@/store/captureControl";
import { OperationHistoryState } from "@/store/operationHistory";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";
import { useRouter } from "vue-router/composables";

export default defineComponent({
  props: {
    initial: { type: Boolean, default: false },
  },
  components: {
    "error-message-dialog": ErrorMessageDialog,
  },
  setup(props) {
    const store = useStore();
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

    const captureControlState = computed(() => {
      return (store.state as any).captureControl as CaptureControlState;
    });

    const url = computed((): string => {
      return captureControlState.value.url;
    });

    const testResultName = computed((): string => {
      return captureControlState.value.testResultName;
    });

    const isCapturing = computed((): boolean => {
      return captureControlState.value.isCapturing;
    });

    const isReplaying = computed((): boolean => {
      return captureControlState.value.isReplaying;
    });

    const isResuming = computed((): boolean => {
      return captureControlState.value.isResuming;
    });

    const urlIsValid = computed((): boolean => {
      return store.getters["captureControl/urlIsValid"]();
    });

    const startCapture = async (): Promise<void> => {
      goToHistoryView();

      try {
        await store.dispatch("openProgressDialog", {
          message: store.getters.message("start-capture-page.starting-capture"),
        });

        if (props.initial) {
          await resetHistory();
        }

        if (
          ((store.state as any).operationHistory as OperationHistoryState)
            .testResultInfo.id === ""
        ) {
          await store.dispatch("operationHistory/createTestResult", {
            initialUrl: url.value,
            name: testResultName.value,
          });
        }

        const history = (
          (store.state as any).operationHistory as OperationHistoryState
        ).history;
        const startTime = new TimestampImpl().epochMilliseconds();

        if (history.length === 0) {
          await store.dispatch("operationHistory/changeCurrentTestResult", {
            startTime,
            initialUrl: url.value,
          });
        } else if (history.length > 0) {
          await store.dispatch("operationHistory/changeCurrentTestResult", {
            startTime,
            initialUrl: "",
          });
        }

        await store.dispatch("captureControl/startCapture", {
          url: url.value,
          callbacks: {
            onEnd: async (error?: Error) => {
              await store.dispatch("closeProgressDialog");

              if (error) {
                goToHistoryView();
                throw error;
              }
            },
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          goToHistoryView();
        } else {
          throw error;
        }
      } finally {
        await store.dispatch("closeProgressDialog");
      }
    };

    const resetHistory = async () => {
      await store.dispatch("operationHistory/clearTestResult");
      store.commit("operationHistory/clearStoringTestResultInfos");
      store.commit("operationHistory/clearScreenTransitionDiagramGraph");
      store.commit("operationHistory/clearElementCoverages");
      store.commit("operationHistory/clearInputValueTable");
      await store.dispatch("captureControl/resetTimer");
    };

    const goToHistoryView = () => {
      const targetPath = "/test-result";

      if (router.currentRoute.path !== targetPath) {
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
      startCapture,
    };
  },
});
</script>
