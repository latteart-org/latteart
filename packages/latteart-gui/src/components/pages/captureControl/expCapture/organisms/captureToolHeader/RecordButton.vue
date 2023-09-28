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
  <div>
    <v-btn
      v-if="!isCapturing"
      :disabled="isDisabled"
      icon
      text
      large
      color="grey darken-3"
      @click="testOptionDialogOpened = true"
      :title="$store.getters.message('app.start')"
      id="startButton"
      class="mx-1"
    >
      <v-icon>fiber_manual_record</v-icon>
    </v-btn>
    <v-btn
      v-else
      icon
      text
      large
      color="red"
      @click="endCapture"
      :title="$store.getters.message('app.finish')"
      id="endButton"
      class="mx-2"
    >
      <v-icon>fiber_manual_record</v-icon>
    </v-btn>

    <test-option-dialog
      :opened="testOptionDialogOpened"
      @close="testOptionDialogOpened = false"
      @ok="startCapture"
    />

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ErrorMessageDialog from "@/components/pages/common/ErrorMessageDialog.vue";
import TestOptionDialog from "../../../testOptionDialog/TestOptionDialog.vue";
import { TimestampImpl } from "@/lib/common/Timestamp";
import { DeviceSettings } from "@/lib/common/settings/Settings";
import { RootState } from "@/store";

@Component({
  components: {
    "test-option-dialog": TestOptionDialog,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class RecordButton extends Vue {
  private testOptionDialogOpened = false;
  private preparingForCapture = false;
  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private get testResultName(): string {
    return this.$store.state.operationHistory.testResultInfo.name;
  }

  private get url(): string {
    return this.$store.state.captureControl.url;
  }

  private set url(value: string) {
    this.$store.commit("captureControl/setUrl", { url: value });
  }

  private get isDisabled(): boolean {
    return (
      !this.url ||
      this.isReplaying ||
      this.isResuming ||
      !this.urlIsValid ||
      this.testOptionDialogOpened ||
      this.preparingForCapture
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

  private get urlIsValid(): boolean {
    return this.$store.getters["captureControl/urlIsValid"]();
  }

  private startCapture(): void {
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
          callbacks: {
            onEnd: (error?: Error) => {
              this.preparingForCapture = false;
              if (error) {
                this.errorMessage = error.message;
                this.errorMessageDialogOpened = true;
              }
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

  private endCapture(): void {
    this.$store.dispatch("captureControl/endCapture");
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
