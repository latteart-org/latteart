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
    <v-row
      no-gutters
      align="center"
      :style="{ height: '70px', 'max-width': '100%' }"
    >
      <v-col v-if="testResults.length > 1" :style="buildStyle">
        <v-select
          class="mr-3"
          :label="message('test-result-page.test-result-name')"
          :items="testResults"
          item-text="name"
          item-value="id"
          :value="currentTestResultId"
          @change="changeCurrentTestResultId"
          hide-details
          dense
      /></v-col>
      <v-col :style="buildStyle">
        <v-select
          class="mr-3"
          :label="message('test-result-page.test-purpose')"
          :items="testPurposes"
          item-text="text"
          item-value="value"
          v-model="selectedTestPurposeIndex"
          hide-details
          dense
      /></v-col>
      <v-col cols="auto" v-if="!isViewerMode">
        <v-btn class="mr-1" :disabled="!this.graph" @click="editTestPurpose">{{
          message("test-result-page.edit-test-purpose")
        }}</v-btn></v-col
      >
    </v-row>
    <v-row
      no-gutters
      id="sequence-diagram-container"
      :style="{ 'overflow-y': 'auto', height: 'calc(100% - 70px)' }"
    >
      <mermaid-graph-renderer
        v-if="graphElement"
        :graph="graphElement"
      ></mermaid-graph-renderer>
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

import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { MessageProvider } from "@/lib/operationHistory/types";
import MermaidGraphRenderer from "@/components/molecules/MermaidGraphRenderer.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";

@Component({
  components: {
    "mermaid-graph-renderer": MermaidGraphRenderer,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class SequenceDiagram extends Vue {
  @Prop({ type: Function }) public readonly message!: MessageProvider;

  private errorMessageDialogOpened = false;
  private errorMessage = "";
  private selectedTestPurposeIndex = 0;

  private get isViewerMode() {
    return (this as any).$isViewerMode ?? false;
  }

  private get operationHistoryState() {
    return this.$store.state.operationHistory as OperationHistoryState;
  }

  private get currentTestResultId() {
    return this.operationHistoryState.testResultInfo.id;
  }

  private get testResults() {
    return this.operationHistoryState.storingTestResultInfos;
  }

  private get testPurposes() {
    return this.operationHistoryState.sequenceDiagramGraphs.map(
      ({ testPurpose }, index) => {
        return {
          text:
            testPurpose?.value ??
            this.message("test-result-page.no-test-purpose"),
          value: index,
        };
      }
    );
  }

  private get graph() {
    const graphs = this.operationHistoryState.sequenceDiagramGraphs;

    return graphs.at(this.selectedTestPurposeIndex);
  }

  private get graphElement() {
    return this.graph?.element ?? null;
  }

  private mounted() {
    this.selectedTestPurposeIndex = 0;
    const sequenceDiagram = document.getElementById(
      "sequence-diagram-container"
    ) as any;
    sequenceDiagram.oncontextmenu = () => false;
  }

  @Watch("currentTestResultId")
  private resetTestPurposeIndex() {
    this.selectedTestPurposeIndex = 0;
  }

  private async changeCurrentTestResultId(testResultId: string) {
    try {
      if ((this as any).$isViewerMode ? (this as any).$isViewerMode : false) {
        await this.$store.dispatch(
          "operationHistory/loadTestResultForSnapshot",
          {
            testResultId,
          }
        );
      } else {
        await this.$store.dispatch("operationHistory/loadTestResult", {
          testResultId,
        });

        await this.$store.dispatch(
          "operationHistory/updateModelsFromSequenceView",
          {
            testResultId,
          }
        );
      }

      this.$store.commit("operationHistory/setCanUpdateModels", {
        setCanUpdateModels: false,
      });
      this.$store.dispatch("operationHistory/selectOperation", { sequence: 1 });

      this.selectedTestPurposeIndex = 0;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        this.errorMessageDialogOpened = true;
        this.errorMessage = error.message;
      } else {
        throw error;
      }
    }
  }

  private editTestPurpose() {
    if (!this.graph) {
      return;
    }

    this.operationHistoryState.openNoteEditDialog(
      "intention",
      this.graph.sequence
    );
  }

  private get buildStyle() {
    const buttonWidth = this.isViewerMode ? "0px" : "160px";
    const selectBoxNum = this.testResults.length > 1 ? 2 : 1;
    return {
      "max-width": `calc((100% - ${buttonWidth}) / ${selectBoxNum})`,
    };
  }
}
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
