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
import { Component, Prop, Vue } from "vue-property-decorator";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { CaptureControlState } from "@/store/captureControl";
import TestResultNameEditDialog from "./TestResultNameEditDialog.vue";

@Component({
  components: {
    "test-result-name-edit-dialog": TestResultNameEditDialog,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class TestResultNameEditTrigger extends Vue {
  @Prop({ type: String, default: "" }) public readonly testResultId!: string;
  @Prop({ type: String, default: "" }) public readonly testResultName!: string;

  private editDialogOpened = false;
  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private get isDisabled(): boolean {
    return this.isReplaying || this.isResuming || this.isCapturing;
  }

  private get captureControlState() {
    return this.$store.state.captureControl as CaptureControlState;
  }

  private get isCapturing(): boolean {
    return this.captureControlState.isCapturing;
  }

  private get isReplaying(): boolean {
    return this.captureControlState.isReplaying;
  }

  private get isResuming(): boolean {
    return this.captureControlState.isResuming;
  }

  private openEditDialog() {
    this.editDialogOpened = true;
  }

  private async editTestResultName(newTestResultName: string) {
    if (!newTestResultName) {
      return;
    }

    try {
      await this.$store.dispatch("operationHistory/changeTestResultName", {
        testResultId: this.testResultId,
        testResultName: newTestResultName,
      });

      this.$emit("update", newTestResultName);
    } catch (error) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
        this.errorMessageDialogOpened = true;
      } else {
        throw error;
      }
    }
  }
}
</script>
