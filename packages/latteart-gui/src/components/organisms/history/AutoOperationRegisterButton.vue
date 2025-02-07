<!--
 Copyright 2024 NTT Corporation.

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
  <div
    :title="
      $t('auto-operation-register-button.title') +
      ': ' +
      $t('auto-operation-register-button.details')
    "
  >
    <v-btn :disabled="isDisabled" color="blue" size="small" class="mx-1" @click="openRegisterDialog"
      >{{ $t("auto-operation-register-button.title") }}
    </v-btn>
  </div>

  <auto-operation-register-dialog
    :opened="registerDialogOpened"
    :target-operations="targetOperations"
    @ok="clearCheckedOperations"
    @close="registerDialogOpened = false"
  />

  <error-message-dialog
    :opened="errorMessageDialogOpened"
    :message="errorMessage"
    @close="errorMessageDialogOpened = false"
  />
</template>

<script lang="ts">
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import AutoOperationRegisterDialog from "@/components/organisms/dialog/AutoOperationRegisterDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { computed, defineComponent, ref } from "vue";
import { useRootStore } from "@/stores/root";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useCaptureControlStore } from "@/stores/captureControl";

export default defineComponent({
  components: {
    "auto-operation-register-dialog": AutoOperationRegisterDialog,
    "error-message-dialog": ErrorMessageDialog
  },
  setup() {
    const rootStore = useRootStore();
    const operationHistoryStore = useOperationHistoryStore();
    const captureControlStore = useCaptureControlStore();

    const registerDialogOpened = ref(false);
    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const invalidTypes = ref(["switch_window"]);

    const targetOperations = computed((): OperationForGUI[] => {
      return operationHistoryStore.checkedTestSteps.map((item) => {
        return item.operation;
      });
    });

    const invalidOperations = computed(() => {
      return targetOperations.value.filter((operation) => {
        return invalidTypes.value.includes(operation.type);
      });
    });

    const isReplaying = computed((): boolean => {
      return captureControlStore.isReplaying;
    });

    const isDisabled = computed((): boolean => {
      return targetOperations.value.length < 1 || isReplaying.value;
    });

    const openRegisterDialog = () => {
      if (invalidOperations.value.length > 0) {
        openInvalidTypeErrorDialog();
        return;
      }
      registerDialogOpened.value = true;
    };

    const clearCheckedOperations = () => {
      operationHistoryStore.checkedTestSteps = [];
      registerDialogOpened.value = false;
    };

    const openInvalidTypeErrorDialog = (): void => {
      registerDialogOpened.value = false;
      errorMessage.value = rootStore.message(
        "error.operation_history.register_failed_with_invalid_type",
        { value: invalidTypes.value.join(",") }
      );
      errorMessageDialogOpened.value = true;
    };

    return {
      registerDialogOpened,
      errorMessageDialogOpened,
      errorMessage,
      targetOperations,
      isDisabled,
      openRegisterDialog,
      clearCheckedOperations,
      openInvalidTypeErrorDialog
    };
  }
});
</script>
