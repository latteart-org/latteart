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
      icon
      flat
      large
      color="grey darken-3"
      @click="updateTestResults"
      :disabled="isDisabled"
      :title="$store.getters.message('app.import')"
    >
      <v-icon>folder_open</v-icon>
    </v-btn>

    <v-menu
      offset-y
      v-model="showMenu"
      :position-x="menuX"
      :position-y="menuY"
      absolute
    >
      <v-list>
        <v-list-tile
          v-for="(testResult, index) in testResults"
          :key="index"
          @click="loadHistory(testResult.id)"
          :disabled="!testResult.id"
        >
          <v-list-tile-action :style="{ 'min-width': '30px' }">
            <v-icon :disabled="!testResult.parentTestResultId" small
              >compare</v-icon
            >
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ testResult.name }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-menu>

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
import { TestResultSummary } from "@/lib/operationHistory/types";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class LoadHistoryButton extends Vue {
  private showMenu = false;
  private menuX = 0;
  private menuY = 0;
  private errorMessageDialogOpened = false;
  private errorMessage = "";
  private testResults: Array<TestResultSummary> = [];

  private get isDisabled(): boolean {
    return this.isCapturing || this.isReplaying || this.isResuming;
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

  private updateTestResults(e: any) {
    e.preventDefault();

    if (this.showMenu) {
      this.showMenu = false;
      return;
    }

    this.menuX = e.clientX;
    this.menuY = e.clientY;
    this.$nextTick(async () => {
      const newTestResults = await this.$store.dispatch(
        "operationHistory/getTestResults"
      );

      this.testResults.splice(0, this.testResults.length, ...newTestResults);

      if (this.testResults.length === 0) {
        this.testResults.push({
          id: "",
          name: "EMPTY",
        });
      }

      this.showMenu = true;
    });
  }

  private async loadHistory(testResultId: string) {
    if (!testResultId) {
      return;
    }

    setTimeout(async () => {
      try {
        this.$store.dispatch("openProgressDialog", {
          message: this.$store.getters.message("remote-access.load"),
        });

        await this.$store.dispatch("operationHistory/loadHistory", {
          testResultId,
        });
      } catch (error) {
        if (error instanceof Error) {
          this.errorMessage = error.message;
          this.errorMessageDialogOpened = true;
        } else {
          throw error;
        }
      } finally {
        this.$store.dispatch("closeProgressDialog");
      }
    }, 300);
  }
}
</script>
