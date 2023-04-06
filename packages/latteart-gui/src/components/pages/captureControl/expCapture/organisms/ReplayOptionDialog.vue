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
    <scrollable-dialog :opened="opened">
      <template v-slot:title>{{
        $store.getters.message("replay-option.start-replay")
      }}</template>
      <template v-slot:content>
        <v-checkbox
          :label="$store.getters.message('replay-option.replay-capture')"
          v-model="isResultSavingEnabled"
          hide-details
        ></v-checkbox>

        <v-card flat>
          <v-card-text>
            <v-text-field
              :disabled="!isResultSavingEnabled"
              :label="$store.getters.message('replay-option.test-result-name')"
              v-model="testResultName"
              hide-details
            ></v-text-field>
          </v-card-text>
        </v-card>

        <v-checkbox
          :disabled="!isResultSavingEnabled"
          :label="
            $store.getters.message('replay-option.replay-compare', {
              sourceTestResultName,
            })
          "
          v-model="isComparisonEnabled"
        ></v-checkbox>

        <p class="alert-message">{{ alertMessage }}</p>
      </template>
      <template v-slot:footer>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="okButtonIsDisabled"
          :dark="!okButtonIsDisabled"
          color="blue"
          @click="
            ok();
            close();
          "
        >
          {{ $store.getters.message("common.ok") }}
        </v-btn>
        <v-btn
          @click="
            cancel();
            close();
          "
          >{{ $store.getters.message("common.cancel") }}</v-btn
        >
      </template>
    </scrollable-dialog>
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ScrollableDialog from "@/components/molecules/ScrollableDialog.vue";
import ErrorMessageDialog from "@/components/pages/common/ErrorMessageDialog.vue";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { OperationHistoryState } from "@/store/operationHistory";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class ReplayOptionDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  private testResultName = "";
  private isResultSavingEnabled = false;
  private isComparisonEnabled = false;
  private errorMessageDialogOpened = false;
  private errorMessage = "";
  private alertMessage = "";
  private get okButtonIsDisabled() {
    if (this.isResultSavingEnabled) {
      return !this.testResultName ? true : false;
    }
    return false;
  }

  private get hasPauseCapturingOperation(): boolean {
    const operations: OperationForGUI[] =
      this.$store.getters["operationHistory/getOperations"]();

    return (
      operations.find((operation) => {
        return operation.type === "pause_capturing";
      }) !== undefined
    );
  }

  private get sourceTestResultName() {
    return (this.$store.state.operationHistory as OperationHistoryState)
      .testResultInfo.name;
  }

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }

    this.testResultName = `${this.sourceTestResultName}_re`;
    this.isResultSavingEnabled = false;
    this.isComparisonEnabled = false;
    this.alertMessage = this.hasPauseCapturingOperation
      ? this.$store.getters.message("replay-option.alert-pause-capturing")
      : "";
  }

  private ok() {
    try {
      this.$store.commit("captureControl/setReplayOption", {
        replayOption: {
          testResultName: this.isResultSavingEnabled ? this.testResultName : "",
          resultSavingEnabled: this.isResultSavingEnabled,
          comparisonEnabled: this.isResultSavingEnabled
            ? this.isComparisonEnabled
            : false,
        },
      });

      this.$emit("ok");
    } catch (error) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
        this.errorMessageDialogOpened = true;
      } else {
        throw error;
      }
    }
  }

  private cancel(): void {
    this.$emit("cancel");
  }

  private close(): void {
    this.$emit("close");
  }
}
</script>

<style lang="sass">
.alert-message
  color: red
  font-size: small
</style>
