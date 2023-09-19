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
  <v-container
    v-if="screenshotUrl"
    fluid
    pa-0
    fill-height
    style="position: relative"
  >
    <screen-shot-display :imageInfo="imageInfo"></screen-shot-display>

    <a
      :href="screenshotUrl"
      :download="screenshotName"
      target="_blank"
      rel="noopener noreferrer"
      class="screenshot-button screenshot-button-single"
      ref="dllink"
    >
      <v-btn
        color="white"
        class="screenshot-button screenshot-button-single"
        fab
        small
      >
        <v-icon>image</v-icon>
      </v-btn></a
    >
  </v-container>
</template>

<script lang="ts">
import ScreenShotDisplay from "@/components/molecules/ScreenShotDisplay.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import { Vue, Component } from "vue-property-decorator";
@Component({
  components: {
    "screen-shot-display": ScreenShotDisplay,
  },
})
export default class ScreencaptureDisplay extends Vue {
  private get operationHistoryState() {
    return (
      (this.$store.state.operationHistory as OperationHistoryState) ?? null
    );
  }

  private get selectedOperationSequence() {
    return this.operationHistoryState.selectedOperationSequence;
  }

  private get screenshotName(): string {
    const url = this.imageInfo.decode;
    const ar = url.split(".");
    const ext = ar[ar.length - 1];
    const sequence = this.selectedOperationSequence;
    return `${sequence}.${ext}`;
  }

  private get displayedScreenshotUrl(): string {
    const screenImage = this.operationHistoryState.screenImage;
    if (!screenImage) {
      return "";
    }

    return screenImage.background.image.url;
  }

  private get imageInfo(): { decode: string } {
    if (this.displayedScreenshotUrl !== "") {
      return { decode: this.displayedScreenshotUrl };
    }

    return { decode: "" };
  }

  private get screenshotUrl(): string {
    return this.imageInfo.decode ?? "";
  }
}
</script>

<style lang="sass" scoped>
.screenshot-button
  position: absolute
  z-index: 6

  &-multi
    bottom: 45px
  &-single
    bottom: 48px
    left: 2px
</style>
