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
      v-if="!isCapturing"
      :disabled="isDisabled"
      icon
      flat
      large
      color="grey darken-3"
      @click="testOptionDialogOpened = true"
      :title="$store.getters.message('app.start')"
      id="startButton"
    >
      <!-- <v-icon v-if="isDisabled">label_off</v-icon> -->
      <v-icon v-if="isDisabled">block</v-icon>
      <v-icon v-else>fiber_manual_record</v-icon>
    </v-btn>
    <v-btn
      v-else
      icon
      flat
      large
      color="green"
      @click="endCapture"
      :title="$store.getters.message('app.finish')"
      id="endButton"
    >
      <v-icon color="green">fiber_smart_record</v-icon>
    </v-btn>

    <test-option-dialog
      :opened="testOptionDialogOpened"
      @close="testOptionDialogOpened = false"
      @ok="startCapture"
    />

    <window-selector-dialog
      :opened="windowSelectorOpened"
      @close="windowSelectorOpened = false"
    >
    </window-selector-dialog>

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { CaptureConfig } from "@/lib/captureControl/CaptureConfig";
import ErrorMessageDialog from "@/vue/pages/common/ErrorMessageDialog.vue";
import TestOptionDialog from "../../../testOptionDialog/TestOptionDialog.vue";
import { TimestampImpl } from "@/lib/common/Timestamp";
import WindowSelectorDialog from "../WindowSelectorDialog.vue";

@Component({
  components: {
    "test-option-dialog": TestOptionDialog,
    "error-message-dialog": ErrorMessageDialog,
    "window-selector-dialog": WindowSelectorDialog,
  },
})
export default class RecordButton extends Vue {
  public testOptionDialogOpened = false;
  public preparingForCapture = false;
  public errorMessageDialogOpened = false;
  public errorMessage = "";

  public windowSelectorOpened = false;

  public get testResultName(): string {
    return this.$store.state.operationHistory.testResultInfo.name;
  }

  public get url(): string {
    return this.$store.state.captureControl.url;
  }

  public set url(value: string) {
    this.$store.commit("captureControl/setUrl", { url: value });
  }

  public get config(): CaptureConfig {
    return this.$store.state.operationHistory.config;
  }

  public get isDisabled(): boolean {
    return (
      !this.url ||
      this.isReplaying ||
      this.isResuming ||
      !this.urlIsValid ||
      this.testOptionDialogOpened ||
      this.preparingForCapture
    );
  }

  public get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  public get isReplaying(): boolean {
    return this.$store.state.captureControl.isReplaying;
  }

  public get isResuming(): boolean {
    return this.$store.state.captureControl.isResuming;
  }

  public get urlIsValid(): boolean {
    return this.$store.getters["captureControl/urlIsValid"]();
  }

  public startCapture(): void {
    this.preparingForCapture = true;
    this.goToHistoryView();

    (async () => {
      try {
        if (this.$store.state.operationHistory.testResultInfo.id === "") {
          await this.$store.dispatch("operationHistory/createTestResult", {
            initialUrl: this.url,
            name: this.testResultName,
          });
        }

        const history = this.$store.state.operationHistory.history;
        const startTime = new TimestampImpl().epochMilliseconds();

        if (history.length === 0) {
          await this.$store.dispatch(
            "operationHistory/changeCurrentTestResult",
            {
              startTime,
              initialUrl: this.url,
            }
          );
        } else if (history.length > 0) {
          await this.$store.dispatch(
            "operationHistory/changeCurrentTestResult",
            {
              startTime,
              initialUrl: "",
            }
          );
        }

        await this.$store.dispatch("captureControl/startCapture", {
          url: this.url,
          config: this.config,
          callbacks: {
            onChangeNumberOfWindows: () => {
              this.windowSelectorOpened = true;
            },
          },
        });
        this.preparingForCapture = false;
      } catch (error) {
        if (error instanceof Error) {
          this.errorMessage = error.message;
          this.errorMessageDialogOpened = true;
        } else {
          throw error;
        }
      } finally {
        this.preparingForCapture = false;
      }
    })();
  }

  public endCapture(): void {
    this.$store.dispatch("captureControl/endCapture");
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public goToHistoryView() {
    this.$router.push({ path: "history" }).catch((err: Error) => {
      if (err.name !== "NavigationDuplicated") {
        throw err;
      }
    });
  }
}
</script>
