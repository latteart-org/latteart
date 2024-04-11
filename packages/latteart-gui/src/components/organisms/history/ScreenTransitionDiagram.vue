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
  <v-container fluid class="ma-0 pa-0 align-start">
    <v-row id="screen-transition-diagram-container" justify="end">
      <v-col cols="12" class="pt-0">
        <mermaid-graph-renderer v-if="graph" :graph="graph"></mermaid-graph-renderer>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { type MessageProvider } from "@/lib/operationHistory/types";
import MermaidGraphRenderer from "@/components/molecules/MermaidGraphRenderer.vue";
import { computed, defineComponent } from "vue";
import type { PropType } from "vue";
import { useOperationHistoryStore } from "@/stores/operationHistory";

export default defineComponent({
  components: {
    "mermaid-graph-renderer": MermaidGraphRenderer
  },
  props: {
    message: {
      type: Function as PropType<MessageProvider>,
      required: true
    }
  },
  setup() {
    const operationHistoryStore = useOperationHistoryStore();

    const graph = computed((): Element | null => {
      return operationHistoryStore.screenTransitionDiagramGraph;
    });

    return { graph };
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
