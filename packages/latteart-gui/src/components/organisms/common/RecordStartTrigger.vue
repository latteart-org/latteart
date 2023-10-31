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
    <slot name="activator" v-bind="{ on: startCapture, isDisabled }" />

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
import { TimestampImpl } from "@/lib/common/Timestamp";
import { CaptureControlState } from "@/store/captureControl";
import { OperationHistoryState } from "@/store/operationHistory";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class RecordStartTrigger extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly initial!: boolean;

  private preparingForCapture = false;
  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private get isDisabled(): boolean {
    return (
      !this.url ||
      this.isReplaying ||
      this.isResuming ||
      !this.urlIsValid ||
      this.isCapturing ||
      this.preparingForCapture
    );
  }

  private get captureControlState() {
    return this.$store.state.captureControl as CaptureControlState;
  }

  private get testResultId() {
    return (this.$store.state.operationHistory as OperationHistoryState)
      .testResultInfo.id;
  }

  private get url(): string {
    return this.captureControlState.url;
  }

  private get testResultName(): string {
    return this.captureControlState.testResultName;
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

  private get urlIsValid(): boolean {
    return this.$store.getters["captureControl/urlIsValid"]();
  }

  private async startCapture(): Promise<void> {
    this.goToHistoryView();

    try {
      await this.$store.dispatch("openProgressDialog", {
        message: this.$store.getters.message(
          "start-capture-view.starting-capture"
        ),
      });
      this.preparingForCapture = true;

      if (this.initial) {
        await this.resetHistory();
      }

      if (this.$store.state.operationHistory.testResultInfo.id === "") {
        await this.$store.dispatch("operationHistory/createTestResult", {
          initialUrl: this.url,
          name: this.testResultName,
        });
      }

      const history = this.$store.state.operationHistory.history;
      const startTime = new TimestampImpl().epochMilliseconds();

      if (history.length === 0) {
        await this.$store.dispatch("operationHistory/changeCurrentTestResult", {
          startTime,
          initialUrl: this.url,
        });
      } else if (history.length > 0) {
        await this.$store.dispatch("operationHistory/changeCurrentTestResult", {
          startTime,
          initialUrl: "",
        });
      }

      await this.$store.dispatch("captureControl/startCapture", {
        url: this.url,
        callbacks: {
          onEnd: async (error?: Error) => {
            if (error) {
              this.goToHistoryView();
              throw error;
            }
          },
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        this.goToHistoryView();
      } else {
        throw error;
      }
    } finally {
      this.preparingForCapture = false;
      await this.$store.dispatch("closeProgressDialog");
    }
  }

  private async resetHistory() {
    await this.$store.dispatch("operationHistory/clearTestResult");
    this.$store.commit("operationHistory/clearStoringTestResultInfos");
    this.$store.commit("operationHistory/clearScreenTransitionDiagramGraph");
    this.$store.commit("operationHistory/clearElementCoverages");
    this.$store.commit("operationHistory/clearInputValueTable");
    await this.$store.dispatch("captureControl/resetTimer");
  }

  private goToHistoryView() {
    const targetPath = "/capture/history";

    if (this.$router.currentRoute.path !== targetPath) {
      this.$router.push({ path: targetPath }).catch((err: Error) => {
        if (err.name !== "NavigationDuplicated") {
          throw err;
        }
      });
    }
  }
}
</script>
