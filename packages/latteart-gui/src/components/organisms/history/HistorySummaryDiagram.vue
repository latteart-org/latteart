<!--
 Copyright 2025 NTT Corporation.

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
  <v-container fluid class="pa-0 ma-0 mt-2 fill-height diagram-container">
    <sequence-diagram
      v-if="diagramType === DIAGRAM_TYPE_SEQUENCE"
      :message="message"
    ></sequence-diagram>

    <screen-transition-diagram
      v-if="diagramType === DIAGRAM_TYPE_SCREEN_TRANSITION"
      :message="message"
    ></screen-transition-diagram>
  </v-container>
</template>

<script lang="ts">
import { type MessageProvider } from "@/lib/operationHistory/types";
import ScreenTransitionDiagram from "./ScreenTransitionDiagram.vue";
import SequenceDiagram from "./SequenceDiagram.vue";
import { defineComponent, ref } from "vue";
import type { PropType } from "vue";

export default defineComponent({
  components: {
    "screen-transition-diagram": ScreenTransitionDiagram,
    "sequence-diagram": SequenceDiagram
  },
  props: {
    diagramType: { type: String, required: true },
    message: {
      type: Function as PropType<MessageProvider>,
      required: true
    }
  },
  setup() {
    const DIAGRAM_TYPE_SEQUENCE = ref<string>("sequence");
    const DIAGRAM_TYPE_SCREEN_TRANSITION = ref<string>("screenTransition");

    return {
      DIAGRAM_TYPE_SEQUENCE,
      DIAGRAM_TYPE_SCREEN_TRANSITION
    };
  }
});
</script>
<style lang="sass" scoped>
.diagram-container
  align-items: start !important
</style>
