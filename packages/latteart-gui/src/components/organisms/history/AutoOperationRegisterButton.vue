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
  <div>
    <v-btn
      :disabled="isDisabled"
      color="blue"
      :dark="!isDisabled"
      @click="registerDialogOpened = true"
      size="small"
      class="mx-2"
      >{{ store.getters.message("app.register-operation") }}
    </v-btn>

    <auto-operation-register-dialog
      :opened="registerDialogOpened"
      :target-operations="targetOperations"
      @ok="clearCheckedOperations"
      @close="registerDialogOpened = false"
      @error="openInvalidTypeErrorDialog"
    />

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import AutoOperationRegisterDialog from "@/components/organisms/dialog/AutoOperationRegisterDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import { CaptureControlState } from "@/store/captureControl";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  components: {
    "auto-operation-register-dialog": AutoOperationRegisterDialog,
    "error-message-dialog": ErrorMessageDialog
  },
  setup() {
    const store = useStore();

    const registerDialogOpened = ref(false);
    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const targetOperations = computed((): OperationForGUI[] => {
      return ((store.state as any).operationHistory as OperationHistoryState).checkedOperations.map(
        (item) => {
          return item.operation;
        }
      );
    });

    const isReplaying = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState).isReplaying;
    });

    const isDisabled = computed((): boolean => {
      return targetOperations.value.length < 1 || isReplaying.value;
    });

    const clearCheckedOperations = () => {
      store.commit("operationHistory/clearCheckedOperations");
      registerDialogOpened.value = false;
    };

    const openInvalidTypeErrorDialog = (invalidTypes: string[]): void => {
      registerDialogOpened.value = false;
      errorMessage.value = store.getters.message(
        "error.operation_history.register_failed_with_invalid_type",
        { value: invalidTypes.join(",") }
      );
      errorMessageDialogOpened.value = true;
    };

    return {
      store,
      registerDialogOpened,
      errorMessageDialogOpened,
      errorMessage,
      targetOperations,
      isDisabled,
      clearCheckedOperations,
      openInvalidTypeErrorDialog
    };
  }
});
</script>
