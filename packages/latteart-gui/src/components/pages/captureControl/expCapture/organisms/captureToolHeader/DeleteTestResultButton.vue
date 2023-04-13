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
    <v-list-item @click="openConfirmDialog" :disabled="isDisabled">
      <v-list-item-title>{{
        $store.getters.message("history-view.delete-test-result")
      }}</v-list-item-title>
    </v-list-item>

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="$store.getters.message('history-view.delete-test-result-title')"
      :message="confirmMessage"
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
import ConfirmDialog from "@/components/pages/common/ConfirmDialog.vue";
import ErrorMessageDialog from "@/components/pages/common/ErrorMessageDialog.vue";
import InformationMessageDialog from "@/components/pages/common/InformationMessageDialog.vue";
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
  private confirmMessage = "";

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

  private async openConfirmDialog() {
    const sessions: string[] = await this.$store.dispatch(
      "operationHistory/getSessionIds"
    );

    this.confirmMessage =
      sessions.length > 0
        ? this.$store.getters.message(
            "history-view.delete-test-result-associated-session-message",
            { value: this.testResultName }
          )
        : this.$store.getters.message(
            "history-view.delete-test-result-message",
            { value: this.testResultName }
          );
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
