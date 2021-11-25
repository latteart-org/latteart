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
  <div class="svgPanZoom" ref="panZoom">
    <button
      title="Zoom in"
      v-bind:class="{ scaleButtonDisabled: scaleUpDisabled }"
      :disabled="scaleUpDisabled"
      class="scaleButton scaleUpButton"
      @click="clickChangeSacleButton('up')"
    >
      <v-icon>add</v-icon>
    </button>
    <button
      title="Zoom out"
      v-bind:class="{ scaleButtonDisabled: scaleDownDisabled }"
      :disabled="scaleDownDisabled"
      class="scaleButton scaleDownButton"
      @click="clickChangeSacleButton('down')"
    >
      <v-icon>remove</v-icon>
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class SVGPanZoom extends Vue {
  @Prop({ type: Boolean, default: false })
  public readonly scaleUpDisabled!: boolean;
  @Prop({ type: Boolean, default: false })
  public readonly scaleDownDisabled!: boolean;

  private mounted() {
    const panZoom = this.$refs.panZoom as any;
    const top = panZoom.getBoundingClientRect().y;
    panZoom.style.position = "fixed";
    panZoom.style.top = top;
  }

  private clickChangeSacleButton(scaleMode: string) {
    this.$emit("changeSvgScale", scaleMode);
  }
}
</script>

<style lang="sass" scoped>
.scaleButton
  width: 30px
  height: 30px
  display: block
  border-color: #BBB
  border-style: solid
  background-color: #FFF
  &:hover
    background-color: #EEE
  &:focus
    outline: none
  &.scaleUpButton
    border-top-left-radius: 2px
    border-top-right-radius: 2px
    border-width: 2px 2px 1px 2px
  &.scaleDownButton
    border-bottom-left-radius: 2px
    border-bottom-right-radius: 2px
    border-width: 0px 2px 2px 2px

.scaleButtonDisabled
  background-color: #EEE
</style>
