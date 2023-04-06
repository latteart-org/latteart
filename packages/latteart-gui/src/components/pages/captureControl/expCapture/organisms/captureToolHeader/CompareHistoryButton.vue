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
        $store.getters.message("history-view.compare-test-result")
      }}</v-list-tile-title>
    </v-list-tile>

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="$store.getters.message('history-view.compare-test-result-title')"
      :message="
        $store.getters.message('history-view.compare-test-result-message')
      "
      :onAccept="compareHistory"
      @close="confirmDialogOpened = false"
    />

    <comparison-result-dialog
      :opened="resultDialogOpened"
      :comparisonResult="comparisonResult"
      @close="resultDialogOpened = false"
    />

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
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import {
  TestResultComparisonResult,
  TestResultSummary,
} from "@/lib/operationHistory/types";
import { CaptureControlState } from "@/store/captureControl";
import { OperationHistoryState } from "@/store/operationHistory";
import { Component, Vue } from "vue-property-decorator";
import ComparisonResultDialog from "../ComparisonResultDialog.vue";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "confirm-dialog": ConfirmDialog,
    "comparison-result-dialog": ComparisonResultDialog,
  },
})
export default class CompareHistoryButton extends Vue {
  private confirmDialogOpened = false;
  private errorMessageDialogOpened = false;
  private errorMessage = "";
  private resultDialogOpened = false;
  private comparisonResult: TestResultComparisonResult | null = null;

  private get isDisabled(): boolean {
    return (
      this.isCapturing ||
      this.isReplaying ||
      this.isResuming ||
      this.operations.length === 0 ||
      this.parentTestResultId === ""
    );
  }

  private get isCapturing(): boolean {
    return (this.$store.state.captureControl as CaptureControlState)
      .isCapturing;
  }

  private get isReplaying(): boolean {
    return (this.$store.state.captureControl as CaptureControlState)
      .isReplaying;
  }

  private get isResuming(): boolean {
    return (this.$store.state.captureControl as CaptureControlState).isResuming;
  }

  private get testResultId(): string {
    return (this.$store.state.operationHistory as OperationHistoryState)
      .testResultInfo.id;
  }

  private get parentTestResultId(): string {
    return (this.$store.state.operationHistory as OperationHistoryState)
      .testResultInfo.parentTestResultId;
  }

  private get operations(): OperationForGUI[] {
    return this.$store.getters["operationHistory/getOperations"]();
  }

  private openConfirmDialog() {
    this.confirmDialogOpened = true;
  }

  private async compareHistory(): Promise<void> {
    await this.$store.dispatch("openProgressDialog", {
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
        this.errorMessageDialogOpened = true;
        this.errorMessage = error.message;
      } else {
        throw error;
      }
    } finally {
      await this.$store.dispatch("closeProgressDialog");
    }
  }

  private findCompareTargets(testResults: TestResultSummary[]) {
    const actualTestResult = testResults.find((testResult) => {
      return testResult.id === this.testResultId;
    });

    const expectedTestResult = testResults.find((testResult) => {
      return testResult.id === actualTestResult?.parentTestResultId;
    });

    return {
      actualTestResultId: this.testResultId,
      expectedTestResultId: expectedTestResult?.id ?? undefined,
    };
  }
}
</script>
