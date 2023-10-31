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
    <slot
      name="activator"
      v-bind="{ on: openTestResultImportDialog, isDisabled }"
    />

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />

    <test-result-import-dialog
      :opened="testResultImportDialogOpened"
      @execute="importData"
      @close="testResultImportDialogOpened = false"
    />

    <information-message-dialog
      :opened="informationMessageDialogOpened"
      :title="informationTitle"
      :message="informationMessage"
      @close="informationMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import InformationMessageDialog from "@/components/molecules/InformationMessageDialog.vue";
import TestResultImportDialog from "@/components/organisms/dialog/TestResultImportDialog.vue";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "information-message-dialog": InformationMessageDialog,
    "test-result-import-dialog": TestResultImportDialog,
  },
})
export default class TestResultImportTrigger extends Vue {
  private isImportingTestResults = false;

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private testResultImportDialogOpened = false;

  private informationMessageDialogOpened = false;
  private informationTitle = "";
  private informationMessage = "";

  private get isDisabled(): boolean {
    return (
      this.isCapturing ||
      this.isReplaying ||
      this.isResuming ||
      this.isImportingTestResults
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

  private openTestResultImportDialog() {
    this.testResultImportDialogOpened = true;
  }

  private importData(testResultImportFile: { data: string; name: string }) {
    this.isImportingTestResults = true;

    setTimeout(async () => {
      try {
        this.$store.dispatch("openProgressDialog", {
          message: this.$store.getters.message(
            "import-export-dialog.importing-data"
          ),
        });
        await this.$store.dispatch("operationHistory/importData", {
          source: { testResultFile: testResultImportFile },
        });
        this.$store.dispatch("closeProgressDialog");

        this.informationMessageDialogOpened = true;
        this.informationTitle = this.$store.getters.message(
          "import-export-dialog.test-result-import-title"
        );
        this.informationMessage = this.$store.getters.message(
          "import-export-dialog.import-data-succeeded",
          {
            returnName: testResultImportFile.name,
          }
        );

        this.$emit("update", testResultImportFile.name);
      } catch (error) {
        this.$store.dispatch("closeProgressDialog");
        if (error instanceof Error) {
          this.errorMessage = error.message;
          this.errorMessageDialogOpened = true;
        } else {
          throw error;
        }
      } finally {
        this.isImportingTestResults = false;
      }
    }, 300);
  }
}
</script>
