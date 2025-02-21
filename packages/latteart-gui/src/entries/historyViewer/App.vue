<!--
 Copyright 2025 NTT Corporation.

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
  <v-app>
    <v-container fluid class="fill-height pa-0">
      <v-app-bar color="#424242" absolute flat>
        <v-toolbar-title>{{ $t("common.review-window-title") }}</v-toolbar-title>
      </v-app-bar>
      <error-handler>
        <v-container fluid class="pa-0" style="height: calc(100vh); padding-top: 64px !important">
          <history-display
            :raw-history="history"
            :raw-comments="comments"
            :message="messageProvider"
          ></history-display>
        </v-container>
      </error-handler>
    </v-container>
  </v-app>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import ErrorHandler from "@/components/organisms/common/ErrorHandler.vue";
import HistoryDisplay from "@/components/organisms/history/HistoryDisplay.vue";
import type { MessageProvider, OperationWithNotes } from "@/lib/operationHistory/types";
import { useRootStore } from "@/stores/root";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { parseHistoryLog } from "@/lib/common/util";

export default defineComponent({
  components: {
    "error-handler": ErrorHandler,
    "history-display": HistoryDisplay
  },
  setup() {
    const rootStore = useRootStore();
    const operationHistoryStore = useOperationHistoryStore();

    const history = computed((): OperationWithNotes[] => {
      return operationHistoryStore.history;
    });

    const comments = computed(() => {
      return operationHistoryStore.comments;
    });

    const messageProvider = computed((): MessageProvider => {
      return (message: string, args?: any) => {
        return rootStore.message(message, args).toString();
      };
    });

    (async () => {
      await rootStore.readSettings();

      const testResultInfos = (await rootStore.dataLoader?.loadTestResultSummaries()) ?? [];
      const firstTestResultId = testResultInfos.at(0)?.id ?? "";
      const firstTestResultName = testResultInfos.at(0)?.name ?? "";

      const testResult = await rootStore.dataLoader?.loadTestResult(firstTestResultId);

      if (!testResult) {
        return;
      }

      operationHistoryStore.resetHistory({
        historyItems: parseHistoryLog(testResult.historyItems)
      });
      if (testResult.comments) {
        operationHistoryStore.comments = testResult.comments;
      }

      operationHistoryStore.storingTestResultInfos = testResultInfos;
      operationHistoryStore.testResultInfo = {
        repositoryUrl: "",
        id: firstTestResultId,
        name: firstTestResultName,
        parentTestResultId: ""
      };

      await operationHistoryStore.updateModelsFromSequenceView({
        testResultId: firstTestResultId
      });
      await operationHistoryStore.updateModelsFromGraphView({
        testResultIds: []
      });

      operationHistoryStore.canUpdateModels = false;
    })();

    return {
      history,
      comments,
      messageProvider
    };
  }
});
</script>

<style lang="sass">
html
  overflow-y: auto !important
</style>
