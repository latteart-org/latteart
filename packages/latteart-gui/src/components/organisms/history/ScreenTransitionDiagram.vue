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
  <v-container>
    <v-row justify="end" id="screen-transition-diagram-container">
      <v-col cols="12" class="pt-0">
        <mermaid-graph-renderer v-if="graph" :graph="graph"></mermaid-graph-renderer>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
/* tslint:disable:max-line-length */

import { MessageProvider } from "@/lib/operationHistory/types";
import MermaidGraphRenderer from "@/components/molecules/MermaidGraphRenderer.vue";
import MermaidGraph from "@/lib/operationHistory/mermaidGraph/MermaidGraph";
import { computed, defineComponent } from "vue";
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
    "mermaid-graph-renderer": MermaidGraphRenderer
  },
  setup() {
    const store = useStore();

    const graph = computed((): MermaidGraph | null => {
      return (store.state as any).operationHistory.screenTransitionDiagramGraph;
    });

    return {
      graph
    };
  }
});
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
