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
  <v-container fluid class="ma-0 fill-height align-start">
    <v-row no-gutters align="center" :style="{ height: '70px', 'max-width': '100%' }">
      <v-col v-if="testResults.length > 1" :style="buildStyle">
        <v-select
          class="mr-3"
          :label="message('test-result-page.test-result-name')"
          :items="testResults"
          item-title="name"
          item-value="id"
          :model-value="currentTestResultId"
          @update:model-value="changeCurrentTestResultId"
          hide-details
          density="compact"
      /></v-col>
      <v-col :style="buildStyle">
        <v-select
          class="mr-3"
          :label="message('test-result-page.test-purpose')"
          :items="testPurposes"
          item-title="text"
          item-value="value"
          v-model="selectedTestPurposeIndex"
          hide-details
          density="compact"
      /></v-col>
      <v-col cols="auto" v-if="!isViewerMode">
        <v-btn class="mr-1" :disabled="!graph" @click="editTestPurpose">{{
          message("test-result-page.edit-test-purpose")
        }}</v-btn></v-col
      >
    </v-row>
    <v-row
      no-gutters
      id="sequence-diagram-container"
      :style="{ 'overflow-y': 'auto', height: 'calc(100% - 70px)' }"
    >
      <mermaid-graph-renderer v-if="graphElement" :graph="graphElement"></mermaid-graph-renderer>
    </v-row>

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </v-container>
</template>

<script lang="ts">
/* tslint:disable:max-line-length */

import { MessageProvider } from "@/lib/operationHistory/types";
import MermaidGraphRenderer from "@/components/molecules/MermaidGraphRenderer.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { computed, defineComponent, onMounted, ref, watch, inject } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    message: {
      type: Function as PropType<MessageProvider>,
      required: true
    }
  },
  components: {
    "mermaid-graph-renderer": MermaidGraphRenderer,
    "error-message-dialog": ErrorMessageDialog
  },
  setup(props) {
    const store = useStore();

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");
    const selectedTestPurposeIndex = ref(0);

    const isViewerMode = computed((): boolean => {
      return inject("isViewerMode") ?? false;
    });

    const operationHistoryState = computed(() => {
      return (store.state as any).operationHistory as OperationHistoryState;
    });

    const currentTestResultId = computed(() => {
      return operationHistoryState.value.testResultInfo.id;
    });

    const testResults = computed(() => {
      return operationHistoryState.value.storingTestResultInfos;
    });

    const testPurposes = computed(() => {
      return operationHistoryState.value.sequenceDiagramGraphs.map(({ testPurpose }, index) => {
        return {
          text: testPurpose?.value ?? props.message("test-result-page.no-test-purpose"),
          value: index
        };
      });
    });

    const graph = computed(() => {
      const graphs = operationHistoryState.value.sequenceDiagramGraphs;

      return graphs.at(selectedTestPurposeIndex.value);
    });

    const graphElement = computed(() => {
      return graph.value?.element ?? null;
    });

    const resetTestPurposeIndex = () => {
      selectedTestPurposeIndex.value = 0;
    };

    const changeCurrentTestResultId = async (testResultId: string) => {
      try {
        if (isViewerMode.value) {
          await store.dispatch("operationHistory/loadTestResultForSnapshot", {
            testResultId
          });
        } else {
          await store.dispatch("operationHistory/loadTestResult", {
            testResultId
          });

          await store.dispatch("operationHistory/updateModelsFromSequenceView", { testResultId });
        }

        store.commit("operationHistory/setCanUpdateModels", {
          setCanUpdateModels: false
        });
        store.dispatch("operationHistory/selectOperation", { sequence: 1 });

        selectedTestPurposeIndex.value = 0;
      } catch (error) {
        if (error instanceof Error) {
          console.error(error);
          errorMessageDialogOpened.value = true;
          errorMessage.value = error.message;
        } else {
          throw error;
        }
      }
    };

    const editTestPurpose = () => {
      if (!graph.value) {
        return;
      }

      operationHistoryState.value.openNoteEditDialog("intention", graph.value.sequence);
    };

    const buildStyle = computed(() => {
      const buttonWidth = isViewerMode.value ? "0px" : "160px";
      const selectBoxNum = testResults.value.length > 1 ? 2 : 1;
      return {
        "max-width": `calc((100% - ${buttonWidth}) / ${selectBoxNum})`
      };
    });

    onMounted(() => {
      selectedTestPurposeIndex.value = 0;
      const sequenceDiagram = document.getElementById("sequence-diagram-container") as any;
      sequenceDiagram.oncontextmenu = () => false;
    });

    watch(currentTestResultId, resetTestPurposeIndex);

    return {
      errorMessageDialogOpened,
      errorMessage,
      selectedTestPurposeIndex,
      isViewerMode,
      currentTestResultId,
      testResults,
      testPurposes,
      graph,
      graphElement,
      changeCurrentTestResultId,
      editTestPurpose,
      buildStyle
    };
  }
});
</script>

<style lang="sass" scoped>
#sequence-diagram-container ::v-deep
  .messageText
    stroke: none !important
    &.disabled
      fill: #959494 !important
      font-style: oblique
    &:not(.disabled)
      &:hover
        fill: red !important
        font-weight: bold !important
  .messageLine0
    &.disabled
      stroke: #959494 !important
  .messageLine1
    visibility: hidden !important
  .activation0
    width: 14px !important
    transform: translateX(-2px) !important
    &.disabled
      stroke: #959494 !important
      fill: #cbcaca !important
    &:not(.disabled)
      &:hover
        stroke: red !important
        fill: #FDF !important
  rect.actor
    &:hover
      stroke: red !important
      fill: #FDF !important
  text.actor
    pointer-events: none
  rect.note
    stroke: #8E44AD !important
    fill: #D2B4DE !important
    transform: translateX(-10px) !important
    &:hover
      fill: #E8DAEF !important
  rect.note.bug
    stroke: #E74C3C !important
    fill: #F5B7B1 !important
    transform: translateX(-10px) !important
    &:hover
      fill: #FADBD8 !important
  text.noteText
    pointer-events: none
    transform: translateX(-10px) !important
  polygon
    display: none !important
  text.labelText
    display: none !important
</style>
