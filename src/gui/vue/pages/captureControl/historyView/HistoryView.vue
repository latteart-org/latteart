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
  <v-layout fill-height>
    <history-display
      :locale="$store.state.i18n.locale"
      :changeWindowTitle="changeWindowTitle"
      :rawHistory="history"
      :windows="windows"
      :message="messageProvider"
      :screenDefinitionConfig="screenDefinitionConfig"
      scriptGenerationEnabled
      operationContextEnabled
    ></history-display>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import {
  OperationHistory,
  OperationWithNotes,
  MessageProvider,
} from "@/lib/operationHistory/types";
import HistoryDisplay from "@/vue/pages/operationHistory/organisms/HistoryDisplay.vue";
import { OperationHistoryState } from "@/store/operationHistory";

@Component({
  components: {
    "history-display": HistoryDisplay,
  },
})
export default class HistoryView extends Vue {
  private get screenDefinitionConfig() {
    return this.$store.state.projectSettings.config.screenDefinition;
  }

  private get messageProvider(): MessageProvider {
    return this.$store.getters.message;
  }

  private get screenDefList() {
    return this.$store.state.projectSettings.config.screenDefinition
      .screenDefList;
  }

  private get windows() {
    return (this.$store.state.operationHistory as OperationHistoryState)
      .windows;
  }

  private get history(): OperationHistory {
    return this.$store.getters[
      "operationHistory/getHistory"
    ]() as OperationWithNotes[];
  }

  private changeWindowTitle(windowTitle: string) {
    const windowTitleCapturePrefix =
      this.$store.getters.message("app.capture-title");
    this.$store.dispatch("changeWindowTitle", {
      title: `${windowTitleCapturePrefix} [${windowTitle}]`,
    });
  }
}
</script>
