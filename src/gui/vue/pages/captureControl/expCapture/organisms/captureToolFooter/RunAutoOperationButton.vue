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
      @click="autoOperationSelectDialogOpened = true"
      fab
      small
      :title="$store.getters.message('app.auto-operation')"
    >
      <v-icon>video_library</v-icon>
    </v-btn>

    <auto-operation-select-dialog
      :opened="autoOperationSelectDialogOpened"
      :auto-operation-condition-groups="autoOperationConditionGroups"
      @ok="runAutoOperations"
      @close="autoOperationSelectDialogOpened = false"
    />

    <error-message-dialog
      :opened="errorDialogOpened"
      :message="errorDialogMessage"
      @close="errorDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { AutoOperationConditionGroup } from "@/lib/operationHistory/types";
import AutoOperationSelectDialog from "@/vue/pages/common/AutoOperationSelectDialog.vue";
import ErrorMessageDialog from "@/vue/pages/common/ErrorMessageDialog.vue";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    "auto-operation-select-dialog": AutoOperationSelectDialog,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class RunAutoOperationButton extends Vue {
  private autoOperationSelectDialogOpened = false;
  private errorDialogOpened = false;
  private errorDialogMessage = "";

  private get autoOperationConditionGroups() {
    const conditionGroups: AutoOperationConditionGroup[] =
      this.$store.state.operationHistory.config.autoOperationSetting
        .conditionGroups;
    return conditionGroups.filter((group) => {
      return group.isEnabled;
    });
  }

  private get isDisabled(): boolean {
    return (
      !this.$store.state.captureControl.isCapturing ||
      this.$store.state.captureControl.isAutoOperation
    );
  }

  private async runAutoOperations(index: number) {
    try {
      const tempOperations =
        this.autoOperationConditionGroups[index].autoOperations;

      await this.$store.dispatch("captureControl/runAutoOperations", {
        operations: tempOperations,
      });
    } catch (error) {
      if (error instanceof Error) {
        this.errorDialogOpened = true;
        this.errorDialogMessage = error.message;
      } else {
        throw error;
      }
    } finally {
      this.autoOperationSelectDialogOpened = false;
    }
  }
}
</script>
