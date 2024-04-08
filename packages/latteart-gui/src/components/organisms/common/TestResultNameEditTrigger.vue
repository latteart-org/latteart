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
    <slot name="activator" v-bind="{ on: openEditDialog, isDisabled }" />

    <test-result-name-edit-dialog
      :opened="editDialogOpened"
      :oldTestResultName="testResultName"
      @close="editDialogOpened = false"
      @execute="editTestResultName"
    />

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import TestResultNameEditDialog from "../dialog/TestResultNameEditDialog.vue";
import { computed, defineComponent, ref } from "vue";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useCaptureControlStore } from "@/stores/captureControl";

export default defineComponent({
  props: {
    testResultId: { type: String, default: "", required: true },
    testResultName: { type: String, default: "", required: true }
  },
  components: {
    "test-result-name-edit-dialog": TestResultNameEditDialog,
    "error-message-dialog": ErrorMessageDialog
  },
  setup(props, context) {
    const operationHistoryStore = useOperationHistoryStore();
    const captureControlStore = useCaptureControlStore();

    const editDialogOpened = ref(false);
    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const isDisabled = computed((): boolean => {
      return isReplaying.value || isResuming.value || isCapturing.value;
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

    const openEditDialog = () => {
      editDialogOpened.value = true;
    };

    const editTestResultName = async (newTestResultName: string) => {
      if (!newTestResultName) {
        return;
      }

      try {
        await operationHistoryStore.changeTestResultName({
          testResultId: props.testResultId,
          testResultName: newTestResultName
        });

        context.emit("update", newTestResultName);
      } catch (error) {
        if (error instanceof Error) {
          errorMessage.value = error.message;
          errorMessageDialogOpened.value = true;
        } else {
          throw error;
        }
      }
    };

    return {
      editDialogOpened,
      errorMessageDialogOpened,
      errorMessage,
      isDisabled,
      openEditDialog,
      editTestResultName
    };
  }
});
</script>
