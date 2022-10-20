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
      @click="replayOperations"
      small
      >{{ $store.getters.message("app.replay-operations") }}
    </v-btn>
    <information-message-dialog
      :opened="informationDialogOpened"
      :title="$store.getters.message('replay.done-title')"
      :message="informationDialogMessage"
      @close="informationDialogOpened = false"
    />

    <error-message-dialog
      :opened="errorDialogOpened"
      :message="errorDialogMessage"
      @close="errorDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Operation } from "@/lib/operationHistory/Operation";
import { Component, Vue } from "vue-property-decorator";
import ErrorMessageDialog from "../../common/ErrorMessageDialog.vue";
import InformationMessageDialog from "../../common/InformationMessageDialog.vue";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "information-message-dialog": InformationMessageDialog,
  },
})
export default class ReplayButton extends Vue {
  private errorDialogOpened = false;
  private errorDialogMessage = "";

  private informationDialogOpened = false;
  private informationDialogMessage = "";

  private get targetOperations(): Operation[] {
    return (
      this.$store.state.operationHistory.checkedOperations as {
        index: number;
        operation: Operation;
      }[]
    ).map((item) => {
      return item.operation;
    });
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

  private get isDisabled(): boolean {
    return (
      this.targetOperations.length < 1 || this.isCapturing || this.isReplaying
    );
  }

  private async replayOperations() {
    (async () => {
      try {
        const sortedOperations = this.targetOperations.sort(
          (a, b) => a.sequence - b.sequence
        );
        await this.$store.dispatch("captureControl/replayOperations", {
          operations: sortedOperations,
        });

        this.informationDialogOpened = true;
        this.informationDialogMessage = this.$store.getters.message(
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
}
</script>
