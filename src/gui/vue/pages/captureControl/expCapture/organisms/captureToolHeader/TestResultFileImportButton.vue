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
      @click="getImportTestResults"
      :loading="isImportTestResults"
      :disabled="isImportTestResults"
      :title="$store.getters.message('manage-header.import-option')"
    >
      <v-icon>file_upload</v-icon>
    </v-btn>

    <v-menu
      offset-y
      v-model="showImportData"
      :position-x="dataX"
      :position-y="dataY"
      absolute
    >
      <v-list>
        <v-list-tile
          v-for="(testResult, index) in importTestResults"
          :key="index"
          @click="importData(testResult)"
          :disabled="!testResult.url"
        >
          <v-list-tile-title>{{ testResult.name }}</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
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
import ErrorMessageDialog from "@/vue/pages/common/ErrorMessageDialog.vue";
import InformationMessageDialog from "@/vue/pages/common/InformationMessageDialog.vue";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "information-message-dialog": InformationMessageDialog,
  },
})
export default class TestResultFileImportButton extends Vue {
  private showImportData = false;
  private dataX = 0;
  private dataY = 0;
  private isImportTestResults = false;
  private importTestResults: Array<{ url: string; name: string }> = [];

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private informationMessageDialogOpened = false;
  private informationTitle = "";
  private informationMessage = "";

  private getImportTestResults(e: any) {
    e.preventDefault();

    if (this.showImportData) {
      this.showImportData = false;
      return;
    }

    this.dataX = e.clientX;
    this.dataY = e.clientY;
    this.$nextTick(async () => {
      const newImportTestResults: {
        url: string;
        name: string;
      }[] = await this.$store.dispatch("operationHistory/getImportTestResults");

      this.importTestResults.splice(
        0,
        this.importTestResults.length,
        ...newImportTestResults
      );

      if (this.importTestResults.length === 0) {
        this.importTestResults.push({
          url: "",
          name: "EMPTY",
        });
      }

      this.showImportData = true;
    });
  }

  private importData(importTestResult: { url: string; name: string }) {
    this.isImportTestResults = true;
    if (!importTestResult.url) {
      this.isImportTestResults = false;
      return;
    }

    setTimeout(async () => {
      try {
        await this.$store.dispatch("operationHistory/importData", {
          source: { testResultFileUrl: importTestResult.url },
        });

        this.informationMessageDialogOpened = true;
        this.informationTitle = this.$store.getters.message(
          "import-export-dialog.import-title"
        );
        this.informationMessage = this.$store.getters.message(
          "import-export-dialog.import-data-succeeded",
          {
            returnName: importTestResult.name,
          }
        );
      } catch (error) {
        if (error instanceof Error) {
          this.errorMessage = `${error.message}`;
          this.errorMessageDialogOpened = true;
        } else {
          throw error;
        }
      } finally {
        this.isImportTestResults = false;
      }
    }, 300);
  }
}
</script>
