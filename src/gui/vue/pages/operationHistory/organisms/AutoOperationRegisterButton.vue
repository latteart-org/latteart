<!--
 Copyright 2022 NTT Corporation.

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
      small
      >{{ $store.getters.message("app.register-operation") }}
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
import AutoOperationRegisterDialog from "@/vue/pages/common/AutoOperationRegisterDialog.vue";
import { Component, Vue } from "vue-property-decorator";
import ErrorMessageDialog from "../../common/ErrorMessageDialog.vue";

@Component({
  components: {
    "auto-operation-register-dialog": AutoOperationRegisterDialog,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class AutoOperationRegisterButton extends Vue {
  private registerDialogOpened = false;
  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private get targetOperations(): OperationForGUI[] {
    return (
      this.$store.state.operationHistory.checkedOperations as {
        index: number;
        operation: OperationForGUI;
      }[]
    ).map((item) => {
      return item.operation;
    });
  }

  private get isReplaying(): boolean {
    return this.$store.state.captureControl.isReplaying;
  }

  private get isDisabled(): boolean {
    return this.targetOperations.length < 1 || this.isReplaying;
  }

  private clearCheckedOperations() {
    this.$store.commit("operationHistory/clearCheckedOperations");
    this.registerDialogOpened = false;
  }

  private openInvalidTypeErrorDialog(invalidTypes: string[]) {
    this.registerDialogOpened = false;
    this.errorMessage = this.$store.getters.message(
      "error.operation_history.register_failed_with_invalid_type",
      { value: invalidTypes.join(",") }
    );
    this.errorMessageDialogOpened = true;
  }
}
</script>
