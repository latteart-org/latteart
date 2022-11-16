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
  <v-layout row>
    <sequence-diagram
      v-if="diagramType === DIAGRAM_TYPE_SEQUENCE"
      :message="message"
    ></sequence-diagram>

    <screen-transition-diagram
      v-if="diagramType === DIAGRAM_TYPE_SCREEN_TRANSITION"
      :screenHistory="screenHistory"
      :windows="windows"
      :message="message"
    ></screen-transition-diagram>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { WindowInfo, MessageProvider } from "@/lib/operationHistory/types";
import ScreenHistory from "@/lib/operationHistory/ScreenHistory";
import ScreenTransitionDiagram from "@/vue/pages/operationHistory/organisms/ScreenTransitionDiagram.vue";
import SequenceDiagram from "@/vue/pages/operationHistory/organisms/SequenceDiagram.vue";

@Component({
  components: {
    "screen-transition-diagram": ScreenTransitionDiagram,
    "sequence-diagram": SequenceDiagram,
  },
})
export default class HistorySummaryDiagram extends Vue {
  @Prop({ type: String }) public readonly diagramType!: string;
  @Prop({ type: Object, default: {} })
  public readonly screenHistory!: ScreenHistory;
  @Prop({ type: Array, default: () => [] })
  public readonly windows!: WindowInfo[];
  @Prop({ type: Function }) public readonly message!: MessageProvider;

  private readonly DIAGRAM_TYPE_SEQUENCE: string = "sequence";
  private readonly DIAGRAM_TYPE_SCREEN_TRANSITION: string = "screenTransition";
}
</script>
