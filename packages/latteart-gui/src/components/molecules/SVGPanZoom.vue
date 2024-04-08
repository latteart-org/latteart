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
  <div class="svgPanZoom" ref="panZoomRef">
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
import { defineComponent, onMounted, ref } from "vue";

export default defineComponent({
  props: {
    scaleUpDisabled: { type: Boolean, default: false },
    scaleDownDisabled: { type: Boolean, default: false }
  },
  setup(_, context) {
    const panZoomRef = ref<any>();

    onMounted(() => {
      const panZoom = panZoomRef.value;
      const top = panZoom.getBoundingClientRect().y;
      panZoom.style.position = "fixed";
      panZoom.style.top = top;
    });

    const clickChangeSacleButton = (scaleMode: string) => {
      context.emit("changeSvgScale", scaleMode);
    };

    return { panZoomRef, clickChangeSacleButton };
  }
});
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
