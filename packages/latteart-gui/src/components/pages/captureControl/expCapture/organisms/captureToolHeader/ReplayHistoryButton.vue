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

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :onAccept="confirmDialogAccept"
      @close="confirmDialogOpened = false"
    />

    <replay-option-dialog
      :opened="replayOptionDialogOpened"
      @close="replayOptionDialogOpened = false"
      @ok="startReplay"
    />

    <comparison-result-dialog
      :opened="resultDialogOpened"
      :comparisonResult="comparisonResult"
      @close="resultDialogOpened = false"
    />
  </v-list-tile>
</template>

<script lang="ts">
import ConfirmDialog from "@/components/pages/common/ConfirmDialog.vue";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import {
  TestResultComparisonResult,
  TestResultSummary,
} from "@/lib/operationHistory/types";
import { CaptureControlState } from "@/store/captureControl";
import { OperationHistoryState } from "@/store/operationHistory";
import { Component, Vue } from "vue-property-decorator";
import ErrorMessageDialog from "../../../../common/ErrorMessageDialog.vue";
import InformationMessageDialog from "../../../../common/InformationMessageDialog.vue";
import ComparisonResultDialog from "../ComparisonResultDialog.vue";
import ReplayOptionDialog from "../ReplayOptionDialog.vue";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "information-message-dialog": InformationMessageDialog,
    "confirm-dialog": ConfirmDialog,
    "replay-option-dialog": ReplayOptionDialog,
    "comparison-result-dialog": ComparisonResultDialog,
  },
})
export default class ReplayHistoryButton extends Vue {
  private errorDialogOpened = false;
  private errorDialogMessage = "";

  private informationMessageDialogOpened = false;
  private informationMessage = "";

  private confirmDialogOpened = false;
  private confirmDialogTitle = "";
  private confirmDialogMessage = "";
  private confirmDialogAccept() {
    /* Do nothing */
  }

  private replayOptionDialogOpened = false;

  private resultDialogOpened = false;

  private comparisonResult: TestResultComparisonResult | null = null;

  private get isDisabled(): boolean {
    return (
      (this.isCapturing && !this.isReplaying) ||
      this.isResuming ||
      this.operations.length === 0
    );
  }

  private get isCapturing() {
    return (this.$store.state.captureControl as CaptureControlState)
      .isCapturing;
  }

  private get isReplaying() {
    return (this.$store.state.captureControl as CaptureControlState)
      .isReplaying;
  }

  private get isResuming() {
    return (this.$store.state.captureControl as CaptureControlState).isResuming;
  }

  private get operations(): OperationForGUI[] {
    return this.$store.getters["operationHistory/getOperations"]();
  }

  private get title() {
    return this.isReplaying
      ? this.$store.getters.message("app.stop-replay")
      : this.$store.getters.message("app.replay");
  }

  private get replayOption(): {
    testResultName: string;
    resultSavingEnabled: boolean;
    comparisonEnabled: boolean;
  } {
    return (this.$store.state.captureControl as CaptureControlState)
      .replayOption;
  }

  private async execute() {
    if (!this.isReplaying) {
      this.replayOptionDialogOpened = true;
    } else {
      await this.forceQuitReplay();
    }
  }

  private async startReplay() {
    await this.replayOperations();
  }

  private async replayOperations() {
    this.goToHistoryView();

    (async () => {
      try {
        await this.$store.dispatch("captureControl/replayOperations", {
          initialUrl: this.operations[0].url,
        });

        if (
          this.replayOption.resultSavingEnabled &&
          this.replayOption.comparisonEnabled
        ) {
          await this.compareHistory();
        } else {
          this.informationMessageDialogOpened = true;
          this.informationMessage = this.$store.getters.message(
            `replay.done-run-operations`
          );
        }
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

  private async compareHistory() {
    this.$store.dispatch("openProgressDialog", {
      message: this.$store.getters.message(
        "history-view.comparing-test-result"
      ),
    });

    try {
      const testResults: TestResultSummary[] = await this.$store.dispatch(
        "operationHistory/getTestResults"
      );

      if (testResults.length === 0) {
        throw new Error(
          this.$store.getters.message(
            "history-view.compare-test-result-not-exist"
          )
        );
      }

      const { actualTestResultId, expectedTestResultId } =
        this.findCompareTargets(testResults);

      if (!expectedTestResultId) {
        throw new Error(
          this.$store.getters.message(
            "history-view.compare-test-result-not-exist"
          )
        );
      }

      this.comparisonResult = await this.$store.dispatch(
        "operationHistory/compareTestResults",
        { actualTestResultId, expectedTestResultId }
      );

      this.resultDialogOpened = true;
    } catch (error) {
      if (error instanceof Error) {
        this.errorDialogMessage = error.message;
        this.errorDialogOpened = true;
      } else {
        throw error;
      }
    } finally {
      this.$store.dispatch("closeProgressDialog");
    }
  }

  private findCompareTargets(testResults: TestResultSummary[]) {
    const actualTestResultId = (
      this.$store.state.operationHistory as OperationHistoryState
    ).testResultInfo.id;

    const actualTestResult = testResults.find((testResult) => {
      return testResult.id === actualTestResultId;
    });
    const expectedTestResult = testResults.find((testResult) => {
      return testResult.id === actualTestResult?.parentTestResultId;
    });

    return {
      actualTestResultId,
      expectedTestResultId: expectedTestResult?.id ?? undefined,
    };
  }

  private async forceQuitReplay() {
    await this.$store
      .dispatch("captureControl/forceQuitReplay")
      .catch((error) => {
        console.log(error);
      });
  }

  private goToHistoryView() {
    this.$router.push({ path: "history" }).catch((err: Error) => {
      if (err.name !== "NavigationDuplicated") {
        throw err;
      }
    });
  }
}
</script>
