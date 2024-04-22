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
  <v-app>
    <error-handler>
      <div style="height: 100vh">
        <history-display :raw-history="history" :message="messageProvider"></history-display>
      </div>
    </error-handler>
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

    const messageProvider = computed((): MessageProvider => {
      return (message: string, args?: any) => {
        return rootStore.message(message, args).toString();
      };
    });

    (async () => {
      const testResultInfos = (await rootStore.dataLoader?.loadTestResultSummaries()) ?? [];
      const firstTestResultId = testResultInfos.at(0)?.id ?? "";
      const firstTestResultName = testResultInfos.at(0)?.name ?? "";

      const history = await rootStore.dataLoader?.loadTestResult(firstTestResultId);

      if (!history) {
        return;
      }

      operationHistoryStore.resetHistory({
        historyItems: parseHistoryLog(history.historyItems)
      });

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
      messageProvider
    };
  }
});
</script>

<style lang="sass">
html
  overflow-y: auto !important
</style>
