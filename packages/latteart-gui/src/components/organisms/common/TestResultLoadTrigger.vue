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
    <slot name="activator" v-bind="{ on: loadHistory, isDisabled }" />

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { CaptureControlState } from "@/store/captureControl";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    testResultIds: {
      type: Array as PropType<string[]>,
      default: () => [],
      required: true,
    },
  },
  components: {
    "error-message-dialog": ErrorMessageDialog,
  },
  setup(props) {
    const store = useStore();

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const isDisabled = computed((): boolean => {
      return isCapturing.value || isReplaying.value || isResuming.value;
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

    const loadHistory = async () => {
      if (props.testResultIds.length === 0) {
        return;
      }

      try {
        store.dispatch("openProgressDialog", {
          message: store.getters.message(
            "test-result-page.loading-test-results"
          ),
        });

        await loadTestResults(...props.testResultIds);
      } catch (error) {
        if (error instanceof Error) {
          errorMessage.value = error.message;
          errorMessageDialogOpened.value = true;
        } else {
          throw error;
        }
      } finally {
        store.dispatch("closeProgressDialog");
      }
    };

    const loadTestResults = async (...testResultIds: string[]) => {
      try {
        await store.dispatch("operationHistory/loadTestResultSummaries", {
          testResultIds,
        });

        await store.dispatch("operationHistory/loadTestResult", {
          testResultId: testResultIds[0],
        });

        store.commit("operationHistory/setCanUpdateModels", {
          setCanUpdateModels: false,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(error);
          errorMessageDialogOpened.value = true;
          errorMessage.value = error.message;
        } else {
          throw error;
        }
      }
    };

    return {
      errorMessageDialogOpened,
      errorMessage,
      isDisabled,
      loadHistory,
    };
  },
});
</script>
