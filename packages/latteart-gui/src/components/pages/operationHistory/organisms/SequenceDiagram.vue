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
  <v-row justify="end" id="sequence-diagram-container">
    <v-col cols="12">
      <mermaid-graph-renderer
        v-if="graph"
        :graph="graph"
        graphType="sequence"
      ></mermaid-graph-renderer>
    </v-col>
  </v-row>
</template>

<script lang="ts">
/* tslint:disable:max-line-length */

import { Component, Vue, Prop } from "vue-property-decorator";
import { MessageProvider } from "@/lib/operationHistory/types";
import MermaidGraphRenderer from "./MermaidGraphRenderer.vue";

@Component({
  components: {
    "mermaid-graph-renderer": MermaidGraphRenderer,
  },
})
export default class SequenceDiagram extends Vue {
  @Prop({ type: Function }) public readonly message!: MessageProvider;

  private get graph() {
    return this.$store.state.operationHistory.sequenceDiagramGraph;
  }

  private mounted() {
    const sequenceDiagram = document.getElementById(
      "sequence-diagram-container"
    ) as any;
    sequenceDiagram.oncontextmenu = () => false;
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
