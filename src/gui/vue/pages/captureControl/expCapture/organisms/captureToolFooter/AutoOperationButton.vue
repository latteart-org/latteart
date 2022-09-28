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
      @click="openDialog"
      fab
      small
      title="操作の登録"
    >
      <v-icon>library_add</v-icon>
    </v-btn>

    <auto-operation-register-dialog
      :opened="autoOptionRegisterDialogOpened"
      :checked-operations="checkedOperations"
      @ok="clearCheckedOperations"
      @close="autoOptionRegisterDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Operation } from "@/lib/operationHistory/Operation";
import AutoOperationRegisterDialog from "@/vue/pages/common/AutoOperationRegisterDialog.vue";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    "auto-operation-register-dialog": AutoOperationRegisterDialog,
  },
})
export default class AutoOperationButton extends Vue {
  private autoOptionRegisterDialogOpened = false;

  private get checkedOperations(): Operation[] {
    return this.$store.state.operationHistory.checkedOperations;
  }

  private get isDisabled(): boolean {
    return this.checkedOperations.length < 1;
  }

  private openDialog() {
    this.autoOptionRegisterDialogOpened = true;
  }

  private clearCheckedOperations() {
    this.$store.commit("operationHistory/clearCheckedOperations");
    this.autoOptionRegisterDialogOpened = false;
  }
}
</script>
