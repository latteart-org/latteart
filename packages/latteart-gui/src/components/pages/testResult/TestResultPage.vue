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
  <v-container fluid fill-height pa-0>
    <v-app-bar color="white" flat absolute height="64px">
      <test-result-header />
    </v-app-bar>

    <v-container
      fluid
      fill-height
      py-0
      :style="{
        'margin-top': '4px',
        'max-height': 'calc(100vh - 64px - 64px)',
      }"
    >
      <v-row class="fill-height">
        <history-display
          :locale="store.state.i18n?.locale"
          :changeWindowTitle="changeWindowTitle"
          :rawHistory="history"
          :message="messageProvider"
          :screenDefinitionConfig="screenDefinitionConfig"
          scriptGenerationEnabled
          operationContextEnabled
        ></history-display>
      </v-row>
    </v-container>

    <v-footer absolute height="64px">
      <test-result-footer />
    </v-footer>

    <autofill-select-dialog />
    <completion-dialog />
  </v-container>
</template>

<script lang="ts">
import {
  OperationHistory,
  MessageProvider,
} from "@/lib/operationHistory/types";
import HistoryDisplay from "@/components/organisms/history/HistoryDisplay.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import TestResultHeader from "@/components/organisms/testResult/TestResultHeader.vue";
import TestResultFooter from "@/components/organisms/testResult/TestResultFooter.vue";
import ConfirmDialog from "@/components/molecules/ConfirmDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import AutofillSelectDialog from "@/components/organisms/dialog/AutofillSelectDialog.vue";
import NoteRegisterDialog from "@/components/organisms/dialog/NoteRegisterDialog.vue";
import NoteUpdateDialog from "@/components/organisms/dialog/NoteUpdateDialog.vue";
import CompletionDialog from "@/components/organisms/dialog/CompletionDialog.vue";
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";
import { useRoute } from "vue-router/composables";

export default defineComponent({
  components: {
    "test-result-header": TestResultHeader,
    "test-result-footer": TestResultFooter,
    "history-display": HistoryDisplay,
    "confirm-dialog": ConfirmDialog,
    "error-message-dialog": ErrorMessageDialog,
    "autofill-select-dialog": AutofillSelectDialog,
    "note-register-dialog": NoteRegisterDialog,
    "note-update-dialog": NoteUpdateDialog,
    "completion-dialog": CompletionDialog,
  },
  setup() {
    const store = useStore();
    const route = useRoute();

    const screenDefinitionConfig = computed(() => {
      return store.state.projectSettings.config.screenDefinition;
    });

    const messageProvider = computed((): MessageProvider => {
      return store.getters.message;
    });

    const history = computed((): OperationHistory => {
      return ((store.state as any).operationHistory as OperationHistoryState)
        .history;
    });

    const changeWindowTitle = (windowTitle: string) => {
      const windowTitlePrefix = store.getters.message(route.meta?.title ?? "");
      store.dispatch("changeWindowTitle", {
        title: `${windowTitlePrefix} [${windowTitle}]`,
      });
    };

    return {
      store,
      screenDefinitionConfig,
      messageProvider,
      history,
      changeWindowTitle,
    };
  },
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
