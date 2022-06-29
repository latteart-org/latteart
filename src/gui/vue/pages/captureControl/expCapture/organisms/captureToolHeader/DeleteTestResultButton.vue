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
    <v-list-tile @click="openConfirmDialog" :disabled="isDisabled">
      <v-list-tile-title>{{
        $store.getters.message("history-view.delete-test-result")
      }}</v-list-tile-title>
    </v-list-tile>

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="$store.getters.message('history-view.delete-test-result-title')"
      :message="
        $store.getters.message('history-view.delete-test-result-message', {
          value: testResultName,
        })
      "
      :onAccept="deleteTestResult"
      @close="confirmDialogOpened = false"
    />

    <information-message-dialog
      :opened="informationMessageDialogOpened"
      :title="$store.getters.message('common.confirm')"
      :message="
        $store.getters.message('history-view.delete-test-result-succeeded')
      "
      @close="informationMessageDialogOpened = false"
    ></information-message-dialog>

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import ConfirmDialog from "@/vue/pages/common/ConfirmDialog.vue";
import ErrorMessageDialog from "@/vue/pages/common/ErrorMessageDialog.vue";
import InformationMessageDialog from "@/vue/pages/common/InformationMessageDialog.vue";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    "confirm-dialog": ConfirmDialog,
    "error-message-dialog": ErrorMessageDialog,
    "information-message-dialog": InformationMessageDialog,
  },
})
export default class DeleteTestResultButton extends Vue {
  private confirmDialogOpened = false;
  private confirmDialogAccept() {
    /* Do nothing */
  }

  private informationMessageDialogOpened = false;
  private informationMessage = "";

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private get isDisabled(): boolean {
    return (
      this.isCapturing ||
      this.isReplaying ||
      this.isResuming ||
      this.testResultName === ""
    );
  }

  private get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  private get isReplaying(): boolean {
    return this.$store.state.captureControl.isReplaying;
  }

  private get isResuming(): boolean {
    return this.$store.state.captureControl.isResuming;
  }

  private get testResultName(): string {
    return this.$store.state.operationHistory.testResultInfo.name;
  }

  private get operations() {
    return this.$store.getters["operationHistory/getOperations"]();
  }

  private openConfirmDialog(): void {
    this.confirmDialogOpened = true;
  }

  private async deleteTestResult(): Promise<void> {
    await this.$store.dispatch("openProgressDialog", {
      message: this.$store.getters.message("remote-access.delete-testresults"),
    });

    try {
      await this.$store.dispatch("operationHistory/deleteCurrentTestResult");
      await this.$store.dispatch("operationHistory/resetHistory");
      await this.$store.dispatch("captureControl/resetTimer");

      this.informationMessageDialogOpened = true;
    } catch (error) {
      if (error instanceof Error) {
        this.errorMessageDialogOpened = true;
        this.errorMessage = error.message;
      } else {
        throw error;
      }
    } finally {
      await this.$store.dispatch("closeProgressDialog");
    }
  }
}
</script>
