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
    v-model="isTestResultNavigationDrawerOpened"
  >
    <template v-slot:prepend>
      <v-list-item>
        <v-list-item-title class="text-h6">
          {{ $store.getters.message("test-result-navigation-drawer.title") }}
        </v-list-item-title>
      </v-list-item>
    </template>

    <test-result-list
      v-if="isTestResultNavigationDrawerOpened"
      deletable
      editable
      :items="items"
      @click-item="loadHistory"
    />

    <template v-slot:append>
      <div class="pa-2">
        <v-btn
          block
          :disabled="isDisabled"
          @click="confirmDialogOpened = true"
          >{{
            $store.getters.message(
              "test-result-navigation-drawer.delete-test-results"
            )
          }}</v-btn
        >
      </div>
    </template>

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="
        $store.getters.message(
          'test-result-navigation-drawer.delete-test-results'
        )
      "
      :message="
        $store.getters.message(
          'test-result-navigation-drawer.delete-test-result-message'
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
          'test-result-navigation-drawer.delete-test-result-succeeded'
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
export default class TestResultNavigationDrawer extends Vue {
  private confirmDialogOpened = false;
  private informationDialogOpened = false;

  private errorDialogOpened = false;
  private errorMessage = "";

  private items: TestResultSummary[] = [];

  private get isTestResultNavigationDrawerOpened() {
    return (this.$store.state.captureControl as CaptureControlState)
      .isTestResultNavigationDrawerOpened;
  }

  private set isTestResultNavigationDrawerOpened(isOpened: boolean) {
    this.$store.commit("captureControl/setTestResultNavigationDrawerOpened", {
      isOpened,
    });
  }

  private get operationHistoryState() {
    return this.$store.state.operationHistory as OperationHistoryState;
  }

  @Watch("isTestResultNavigationDrawerOpened")
  private async initialize() {
    if (!this.isTestResultNavigationDrawerOpened) {
      this.$store.commit("operationHistory/clearCheckedTestResults");
    } else {
      this.items = await this.$store
        .dispatch("operationHistory/getTestResults")
        .catch(() => []);
    }
  }

  private get isDisabled() {
    return this.operationHistoryState.checkedTestResults.length === 0;
  }

  private async loadHistory(testResult: { id: string; name: string }) {
    if (!testResult) {
      return;
    }

    setTimeout(async () => {
      try {
        this.$store.commit(
          "captureControl/setTestResultNavigationDrawerOpened",
          {
            isOpened: false,
          }
        );

        this.$store.dispatch("openProgressDialog", {
          message: this.$store.getters.message(
            "test-result-navigation-drawer.load"
          ),
        });

        await this.loadTestResults(testResult.id);
      } catch (error) {
        if (error instanceof Error) {
          this.errorMessage = error.message;
          this.errorDialogOpened = true;
        } else {
          throw error;
        }
      } finally {
        this.$store.dispatch("closeProgressDialog");
      }
    }, 300);
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
        this.errorDialogOpened = true;
        this.errorMessage = error.message;
      } else {
        throw error;
      }
    }
  }

  private async deleteTestResults() {
    await this.$store.dispatch("openProgressDialog", {
      message: this.$store.getters.message(
        "test-result-navigation-drawer.deleting-test-results"
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
      this.$store.commit("captureControl/setTestResultNavigationDrawerOpened", {
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
