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
  <v-row justify="start" class="fill-height pt-5 pl-5">
    <svg-pan-zoom
      @changeSvgScale="changeSvgScale"
      :scaleUpDisabled="isMaxSize"
      :scaleDownDisabled="isMinSize"
    ></svg-pan-zoom>
    <div ref="graph" class="graphDisplay"></div>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import SVGPanZoom from "@/components/molecules/SVGPanZoom.vue";

@Component({
  components: {
    "svg-pan-zoom": SVGPanZoom,
  },
})
export default class MermaidGraphRenderer extends Vue {
  @Prop() public readonly graph!: Element;
  @Prop() public readonly graphType!: string;

  private svgScalePercentage = 100;
  private isMaxSize = false;
  private isMinSize = false;

  private mounted() {
    this.renderGraph();
  }

  private updated() {
    this.$nextTick(() => {
      this.adaptSvgScale();
    });
  }

  @Watch("graph")
  private renderGraph() {
    this.updateGraphElement();
    this.$nextTick(() => {
      this.adaptSvgScale();
    });
  }

  private adaptSvgScale() {
    if (this.graphType === "sequence") {
      this.adaptSvgScaleOfSequence();
    } else if (this.graphType === "screenTransition") {
      this.adaptSvgScaleOfScreenTransition();
    }
  }

  private setIsMaxSizeAndIsMinSizeOfScreenTransition() {
    if (this.svgScalePercentage <= 10) {
      this.isMinSize = true;
    } else {
      this.isMinSize = false;
    }

    const graph = this.$refs.graph as HTMLElement;
    if (!graph || !graph.children) {
      return;
    }
    const svg = graph.children[0] as any;
    const maxWidth = Number(svg.style.maxWidth.split("px")[0]);
    const width = Number(svg.style.width.split("px")[0]);
    if (width >= maxWidth) {
      this.isMaxSize = true;
    } else {
      this.isMaxSize = false;
    }
  }

  private setIsMaxSizeAndIsMinSizeOfSequence() {
    if (this.svgScalePercentage <= 10) {
      this.isMinSize = true;
    } else {
      this.isMinSize = false;
    }

    const graph = this.$refs.graph as HTMLElement;
    if (!graph || !graph.children) {
      return;
    }
    const svg = graph.children[0] as any;
    const maxWidth = Number(svg.style.maxWidth.split("px")[0]);
    const width = Number(svg.style.width.split("px")[0]);
    if (width >= maxWidth) {
      this.isMaxSize = true;
    } else {
      this.isMaxSize = false;
    }
  }

  private updateGraphElement() {
    const element = this.$refs.graph as HTMLElement;
    if (!element) {
      return;
    }

    element.textContent = "";
    element.insertAdjacentElement("afterbegin", this.graph);
  }

  private changeSvgScale(scaleMode: string) {
    if ("up" === scaleMode && !this.isMaxSize) {
      this.svgScalePercentage += 10;
    } else if ("down" === scaleMode && !this.isMinSize) {
      this.svgScalePercentage -= 10;
    } else {
      return;
    }
    this.adaptSvgScale();
  }

  private adaptSvgScaleOfSequence() {
    const svg = (this.$refs.graph as HTMLElement).children[0] as any;
    svg.style.width = `${
      svg.style.maxWidth.split("px")[0] * this.svgScalePercentage * 0.01
    }px`;

    this.setIsMaxSizeAndIsMinSizeOfSequence();
  }
  private adaptSvgScaleOfScreenTransition() {
    const svg = (this.$refs.graph as HTMLElement).children[0] as any;
    svg.style.width = `${
      svg.style.maxWidth.split("px")[0] * this.svgScalePercentage * 0.01
    }px`;

    this.setIsMaxSizeAndIsMinSizeOfScreenTransition();
  }
}
</script>

<style lang="sass" scoped>
.graphDisplay
  margin-left: 30px
</style>
