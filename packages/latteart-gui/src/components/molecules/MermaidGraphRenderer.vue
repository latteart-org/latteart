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
  <v-container fluid>
    <v-row justify="start" class="fill-height">
      <svg-pan-zoom
        @changeSvgScale="changeSvgScale"
        :scaleUpDisabled="isMaxSize"
        :scaleDownDisabled="isMinSize"
      ></svg-pan-zoom>
      <div ref="graphRef" class="graphDisplay"></div>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import SVGPanZoom from "@/components/molecules/SVGPanZoom.vue";
import { defineComponent, onMounted, onUpdated, nextTick, ref, toRefs, watch } from "vue";

export default defineComponent({
  props: {
    graph: { type: Element, required: true }
  },
  components: {
    "svg-pan-zoom": SVGPanZoom
  },
  setup(props) {
    const svgScalePercentage = ref(100);
    const isMaxSize = ref(false);
    const isMinSize = ref(false);

    const graphRef = ref<HTMLElement>();

    onMounted(() => {
      renderGraph();
    });

    onUpdated(() => {
      nextTick(() => {
        adaptSvgScale();
      });
    });

    const renderGraph = () => {
      updateGraphElement();
      nextTick(() => {
        adaptSvgScale();
      });
    };

    const adaptSvgScale = () => {
      adaptSvgScaleOfSequence();
    };

    const setIsMaxSizeAndIsMinSizeOfSequence = () => {
      if (svgScalePercentage.value <= 10) {
        isMinSize.value = true;
      } else {
        isMinSize.value = false;
      }

      const graph = graphRef.value;
      if (!graph || !graph.children) {
        return;
      }
      const svg = graph.children[0] as any;
      const maxWidth = Number(svg.style.maxWidth.split("px")[0]);
      const width = Number(svg.style.width.split("px")[0]);
      if (width >= maxWidth) {
        isMaxSize.value = true;
      } else {
        isMaxSize.value = false;
      }
    };

    const updateGraphElement = () => {
      const element = graphRef.value;
      if (!element) {
        return;
      }

      element.textContent = "";
      element.insertAdjacentElement("afterbegin", props.graph);
    };

    const changeSvgScale = (scaleMode: string) => {
      if ("up" === scaleMode && !isMaxSize.value) {
        svgScalePercentage.value += 10;
      } else if ("down" === scaleMode && !isMinSize.value) {
        svgScalePercentage.value -= 10;
      } else {
        return;
      }
      adaptSvgScale();
    };

    const adaptSvgScaleOfSequence = () => {
      if (!graphRef.value) {
        return;
      }

      const svg = graphRef.value.children[0] as any;
      svg.style.width = `${svg.style.maxWidth.split("px")[0] * svgScalePercentage.value * 0.01}px`;

      setIsMaxSizeAndIsMinSizeOfSequence();
    };

    const { graph } = toRefs(props);
    watch(graph, renderGraph);

    return { isMaxSize, isMinSize, graphRef, changeSvgScale };
  }
});
</script>

<style lang="sass" scoped>
.graphDisplay
  margin-left: 30px
</style>
