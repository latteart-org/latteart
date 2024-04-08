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
  <v-container fluid class="fill-height pa-0">
    <v-app-bar color="white" flat absolute :height="64">
      <test-result-header />
    </v-app-bar>

    <v-container
      class="fill-height py-0"
      fluid
      :style="{
        'max-height': 'calc(100vh - 64px - 64px)'
      }"
    >
      <v-row class="fill-height">
        <!-- <history-display
          :locale="locale"
          :changeWindowTitle="changeWindowTitle"
          :rawHistory="history"
          :message="messageProvider"
          scriptGenerationEnabled
          operationContextEnabled
        ></history-display> -->
      </v-row>
    </v-container>

    <v-footer absolute :height="64" class="pa-0">
      <test-result-footer />
    </v-footer>

    <autofill-select-dialog />
    <completion-dialog />
  </v-container>
</template>

<script lang="ts">
import { type OperationHistory, type MessageProvider } from "@/lib/operationHistory/types";
// import HistoryDisplay from "@/components/organisms/history/HistoryDisplay.vue";
import TestResultHeader from "@/components/organisms/testResult/TestResultHeader.vue";
import TestResultFooter from "@/components/organisms/testResult/TestResultFooter.vue";
import AutofillSelectDialog from "@/components/organisms/dialog/AutofillSelectDialog.vue";
import CompletionDialog from "@/components/organisms/dialog/CompletionDialog.vue";
import { computed, defineComponent } from "vue";
import { useRoute } from "vue-router";
import { useRootStore } from "@/stores/root";
import { useOperationHistoryStore } from "@/stores/operationHistory";

export default defineComponent({
  components: {
    "test-result-header": TestResultHeader,
    "test-result-footer": TestResultFooter,
    // "history-display": HistoryDisplay,
    "autofill-select-dialog": AutofillSelectDialog,
    "completion-dialog": CompletionDialog
  },
  setup() {
    const rootStore = useRootStore();
    const operationHistoryStore = useOperationHistoryStore();
    const route = useRoute();

    const screenDefinitionConfig = computed(() => {
      return rootStore.projectSettings.config.screenDefinition;
    });

    const messageProvider = computed((): MessageProvider => {
      return rootStore.message;
    });

    const history = computed((): OperationHistory => {
      return operationHistoryStore.history;
    });

    const changeWindowTitle = (windowTitle: string) => {
      const windowTitlePrefix = rootStore.message(route.meta?.title ?? "");
      rootStore.changeWindowTitle({
        title: `${windowTitlePrefix} [${windowTitle}]`
      });
    };

    const locale = computed((): "" | "ja" | "en" => {
      return rootStore.getLocale();
    });

    return {
      locale,
      screenDefinitionConfig,
      messageProvider,
      history,
      changeWindowTitle
    };
  }
});
</script>
<style lang="sass" scoped>
html
  overflow: hidden
</style>

<style lang="sass">
#windowHandlesSelectedBox
  max-height: 50px !important
</style>
