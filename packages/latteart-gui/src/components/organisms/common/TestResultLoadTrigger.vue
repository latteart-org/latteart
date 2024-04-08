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
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useRootStore } from "@/stores/root";
import { computed, defineComponent, ref } from "vue";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    testResultIds: {
      type: Array as PropType<string[]>,
      default: () => [],
      required: true
    }
  },
  components: {
    "error-message-dialog": ErrorMessageDialog
  },
  setup(props) {
    const rootStore = useRootStore();
    const operationHistoryStore = useOperationHistoryStore();
    const captureControlStore = useCaptureControlStore();

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const isDisabled = computed((): boolean => {
      return isCapturing.value || isReplaying.value || isResuming.value;
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

    const loadTestResults = async (...testResultIds: string[]) => {
      try {
        await operationHistoryStore.loadTestResultSummaries({
          testResultIds
        });

        await operationHistoryStore.loadTestResult({
          testResultId: testResultIds[0]
        });

        operationHistoryStore.canUpdateModels = false;
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

    const loadHistory = async () => {
      if (props.testResultIds.length === 0) {
        return;
      }

      try {
        rootStore.openProgressDialog({
          message: rootStore.message("test-result-page.loading-test-results")
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
        rootStore.closeProgressDialog();
      }
    };

    return {
      errorMessageDialogOpened,
      errorMessage,
      isDisabled,
      loadHistory
    };
  }
});
</script>
