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
    <slot name="activator" v-bind="{ on: loadHistory, isDisabled }" />

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

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class TestResultLoadTrigger extends Vue {
  @Prop({ type: Array, default: () => [] }) testResultIds!: string[];

  private errorMessageDialogOpened = false;
  private errorMessage = "";

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

  private async loadHistory() {
    if (this.testResultIds.length === 0) {
      return;
    }

    try {
      this.$store.dispatch("openProgressDialog", {
        message: this.$store.getters.message(
          "history-view.loading-test-results"
        ),
      });

      await this.loadTestResults(...this.testResultIds);
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
  }

  private async loadTestResults(...testResultIds: string[]) {
    try {
      await this.$store.dispatch("operationHistory/loadTestResultSummaries", {
        testResultIds,
      });

      await this.$store.dispatch("operationHistory/loadTestResult", {
        testResultId: testResultIds[0],
      });

      this.$store.commit("operationHistory/setCanUpdateModels", {
        setCanUpdateModels: false,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        this.errorMessageDialogOpened = true;
        this.errorMessage = error.message;
      } else {
        throw error;
      }
    }
  }
}
</script>
