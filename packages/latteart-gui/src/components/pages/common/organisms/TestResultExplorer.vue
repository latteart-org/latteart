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
  <v-navigation-drawer
    class="navigation-drawer"
    absolute
    temporary
    width="360"
    v-model="isTestResultExplorerOpened"
  >
    <template v-slot:prepend>
      <v-list-item>
        <v-list-item-title class="text-h6">
          {{ $store.getters.message("test-result-explorer.title") }}
        </v-list-item-title>
      </v-list-item>
    </template>

    <test-result-list
      :showSelect="true"
      :opened="isTestResultExplorerOpened"
      :items="items"
    />

    <template v-slot:append>
      <div class="pa-2">
        <v-btn
          block
          :disabled="isDisabled"
          @click="confirmDialogOpened = true"
          >{{
            $store.getters.message("test-result-explorer.delete-test-results")
          }}</v-btn
        >
      </div>
    </template>

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="
        $store.getters.message('test-result-explorer.delete-test-results')
      "
      :message="
        $store.getters.message(
          'test-result-explorer.delete-test-result-message'
        )
      "
      :onAccept="deleteTestResults"
      @close="confirmDialogOpened = false"
    />

    <information-message-dialog
      :opened="informationDialogOpened"
      :title="$store.getters.message('common.confirm')"
      :message="
        $store.getters.message(
          'test-result-explorer.delete-test-result-succeeded'
        )
      "
      @close="informationDialogOpened = false"
    />

    <error-message-dialog
      :opened="errorDialogOpened"
      :message="errorMessage"
      @close="errorDialogOpened = false"
    />
  </v-navigation-drawer>
</template>

<script lang="ts">
import { TestResultSummary } from "@/lib/operationHistory/types";
import { CaptureControlState } from "@/store/captureControl";
import { OperationHistoryState } from "@/store/operationHistory";
import { Component, Vue, Watch } from "vue-property-decorator";
import ConfirmDialog from "../ConfirmDialog.vue";
import ErrorMessageDialog from "../ErrorMessageDialog.vue";
import InformationMessageDialog from "../InformationMessageDialog.vue";
import TestResultList from "./TestResultList.vue";

@Component({
  components: {
    "test-result-list": TestResultList,
    "confirm-dialog": ConfirmDialog,
    "information-message-dialog": InformationMessageDialog,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class TestResultExplorer extends Vue {
  private confirmDialogOpened = false;
  private informationDialogOpened = false;

  private errorDialogOpened = false;
  private errorMessage = "";

  private items: TestResultSummary[] = [];

  private get isTestResultExplorerOpened() {
    return (this.$store.state.captureControl as CaptureControlState)
      .isTestResultExplorerOpened;
  }

  private set isTestResultExplorerOpened(isOpened: boolean) {
    this.$store.commit("captureControl/setTestResultExplorerOpened", {
      isOpened,
    });
  }

  private get operationHistoryState() {
    return this.$store.state.operationHistory as OperationHistoryState;
  }

  @Watch("isTestResultExplorerOpened")
  private async initialize() {
    if (!this.isTestResultExplorerOpened) {
      this.$store.commit("operationHistory/clearCheckedTestResults");
    } else {
      const testResults: TestResultSummary[] = await this.$store
        .dispatch("operationHistory/getTestResults")
        .catch(() => []);

      this.items = testResults.map((testResult) => {
        return {
          ...testResult,
          testPurposes: testResult.testPurposes.slice(0, 5),
        };
      });
    }
  }

  private get isDisabled() {
    return this.operationHistoryState.checkedTestResults.length === 0;
  }

  private async deleteTestResults() {
    await this.$store.dispatch("openProgressDialog", {
      message: this.$store.getters.message(
        "test-result-explorer.deleting-test-results"
      ),
    });
    try {
      // Delete selected test results.
      await this.$store.dispatch("operationHistory/deleteTestResults", {
        testResultIds: this.operationHistoryState.checkedTestResults,
      });

      // Clear display information if it contains test results you are viewing.
      if (
        this.operationHistoryState.checkedTestResults.includes(
          this.operationHistoryState.testResultInfo.id
        )
      ) {
        this.$store.commit("operationHistory/removeStoringTestResultInfos", {
          testResultInfos: [
            {
              id: this.operationHistoryState.testResultInfo.id,
              name: this.operationHistoryState.testResultInfo.name,
            },
          ],
        });
        await this.$store.dispatch("operationHistory/clearTestResult");
        this.$store.commit(
          "operationHistory/clearScreenTransitionDiagramGraph"
        );
        this.$store.commit("operationHistory/clearElementCoverages");
        this.$store.commit("operationHistory/clearInputValueTable");
        this.$store.commit("operationHistory/clearDisplayedScreenshotUrl");
        await this.$store.dispatch("captureControl/resetTimer");
      }
      this.informationDialogOpened = true;
    } catch (error) {
      if (error instanceof Error) {
        this.errorDialogOpened = true;
        this.errorMessage = error.message;
      } else {
        throw error;
      }
    } finally {
      this.$store.commit("captureControl/setTestResultExplorerOpened", {
        isOpened: false,
      });
      await this.$store.dispatch("closeProgressDialog");
    }
  }
}
</script>

<style lang="sass" scoped>
.navigation-drawer ::v-deep .v-navigation-drawer__content
  overflow-y: hidden !important
</style>
