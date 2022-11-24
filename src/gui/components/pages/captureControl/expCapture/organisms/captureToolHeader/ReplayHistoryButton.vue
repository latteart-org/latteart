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
  <v-list-tile @click="execute" :disabled="isDisabled">
    <v-list-tile-title>{{ title }}</v-list-tile-title>
    <information-message-dialog
      :opened="informationMessageDialogOpened"
      :title="$store.getters.message('replay.done-title')"
      :message="informationMessage"
      @close="informationMessageDialogOpened = false"
    />

    <error-message-dialog
      :opened="errorDialogOpened"
      :message="errorDialogMessage"
      @close="errorDialogOpened = false"
    />
  </v-list-tile>
</template>

<script lang="ts">
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { Component, Vue } from "vue-property-decorator";
import ErrorMessageDialog from "../../../../common/ErrorMessageDialog.vue";
import InformationMessageDialog from "../../../../common/InformationMessageDialog.vue";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "information-message-dialog": InformationMessageDialog,
  },
})
export default class ReplayHistoryButton extends Vue {
  private errorDialogOpened = false;
  private errorDialogMessage = "";

  private informationMessageDialogOpened = false;
  private informationMessage = "";

  private get isDisabled(): boolean {
    return (
      (this.isCapturing && !this.isReplaying) ||
      this.isResuming ||
      this.operations.length === 0
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

  private get operations(): OperationForGUI[] {
    return this.$store.getters["operationHistory/getOperations"]();
  }

  private get title() {
    return this.isReplaying
      ? this.$store.getters.message("app.stop-replay")
      : this.$store.getters.message("app.replay");
  }

  private async execute() {
    if (!this.isReplaying) {
      await this.replayOperations();
    } else {
      await this.forceQuitReplay();
    }
  }

  private async replayOperations() {
    (async () => {
      try {
        await this.$store.dispatch("captureControl/replayOperations", {
          initialUrl: this.operations[0].url,
        });

        this.informationMessageDialogOpened = true;
        this.informationMessage = this.$store.getters.message(
          `replay.done-run-operations`
        );
      } catch (error) {
        if (error instanceof Error) {
          this.errorDialogOpened = true;
          this.errorDialogMessage = error.message;
        } else {
          throw error;
        }
      }
    })();
  }

  private async forceQuitReplay() {
    await this.$store
      .dispatch("captureControl/forceQuitReplay")
      .catch((error) => {
        console.log(error);
      });
  }
}
</script>
