<!--
 Copyright 2021 NTT Corporation.

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
  <v-layout justify-end column id="screen-transition-diagram-container">
    <v-select
      class="pb-2"
      :label="message('app.target-tab-window')"
      :items="usedWindowHandles"
      item-text="text"
      item-value="value"
      :value="selectedWindowHandle"
      @change="(value) => selectWindow(value)"
    />
    <mermaid-graph-renderer
      v-if="graph"
      :graph="graph"
      graphType="screenTransition"
    ></mermaid-graph-renderer>
  </v-layout>
</template>

<script lang="ts">
/* tslint:disable:max-line-length */

import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import {
  OperationWithNotes,
  Edge,
  WindowHandle,
  MessageProvider,
} from "@/lib/operationHistory/types";
import ScreenHistory from "@/lib/operationHistory/ScreenHistory";
import MermaidGraphRenderer from "./MermaidGraphRenderer.vue";
import MermaidGraph from "@/lib/operationHistory/mermaidGraph/MermaidGraph";

@Component({
  components: {
    "mermaid-graph-renderer": MermaidGraphRenderer,
  },
})
export default class ScreenTransitionDiagram extends Vue {
  @Prop({ type: Object, default: {} })
  public readonly screenHistory!: ScreenHistory;
  @Prop({ type: Array, default: [] })
  public readonly windowHandles!: WindowHandle[];
  @Prop({ type: Function }) public readonly message!: MessageProvider;

  private edges: Edge[] = [];
  private nameMap: Map<number, string> = new Map();

  private created() {
    if (this.selectedWindowHandle === "" && this.windowHandles.length >= 1) {
      this.$store.commit("operationHistory/selectWindow", {
        windowHandle: this.windowHandles[0].value,
      });
    }
  }

  private get selectedWindowHandle(): string {
    return this.$store.state.operationHistory.selectedWindowHandle;
  }

  private selectWindow(windowHandle: string) {
    this.$store.commit("operationHistory/selectWindow", { windowHandle });
  }

  private get graph(): MermaidGraph | null {
    return (
      this.$store.state.operationHistory
        .windowHandleToScreenTransitionDiagramGraph[
        this.selectedWindowHandle
      ] ?? null
    );
  }

  @Watch("windowHandles")
  private initSelectedWindowHandle(newValue: WindowHandle[]) {
    if (this.selectedWindowHandle === "" && newValue.length >= 1) {
      this.$store.commit("operationHistory/selectWindow", {
        windowHandle: newValue[0].value,
      });
    }
  }

  private get usedWindowHandles(): WindowHandle[] {
    return this.windowHandles.filter((windowHandle: WindowHandle) => {
      const existsHistory = this.screenHistory.body.find(
        (value: {
          url: string;
          title: string;
          screenDef: string;
          operationHistory: OperationWithNotes[];
        }) => {
          const existsHandle = value.operationHistory.find(
            (operationWithNotes: OperationWithNotes) => {
              return (
                operationWithNotes.operation.windowHandle === windowHandle.value
              );
            }
          );
          return !!existsHandle;
        }
      );
      return !!existsHistory;
    });
  }
}
</script>

<style lang="sass" scoped>
#screen-transition-diagram-container ::v-deep
  .edgeLabel
    span
      &:hover
        color: red !important
        font-weight: bold !important
  .node
    rect
      &:hover
        fill: #FDF !important
        stroke: red !important
    .label
      pointer-events: none
</style>
