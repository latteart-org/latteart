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
  <v-container v-if="screenshotUrl" fluid class="pa-0" fill-height style="position: relative">
    <screen-shot-display :imageInfo="imageInfo"></screen-shot-display>

    <a
      :href="screenshotUrl"
      :download="screenshotName"
      target="_blank"
      rel="noopener noreferrer"
      class="screenshot-button"
      ref="dllink"
    >
      <v-btn color="white" class="screenshot-button" fab size="small">
        <v-icon>image</v-icon>
      </v-btn></a
    >
  </v-container>
</template>

<script lang="ts">
import ScreenShotDisplay from "@/components/molecules/ScreenShotDisplay.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  components: {
    "screen-shot-display": ScreenShotDisplay
  },
  setup() {
    const store = useStore();

    const operationHistoryState = computed(() => {
      return ((store.state as any).operationHistory as OperationHistoryState) ?? null;
    });

    const selectedOperationInfo = computed(() => {
      return operationHistoryState.value.selectedOperationInfo;
    });

    const screenshotName = computed((): string => {
      const url = imageInfo.value.decode;
      const ar = url.split(".");
      const ext = ar[ar.length - 1];
      const sequence = selectedOperationInfo.value;
      return `${sequence}.${ext}`;
    });

    const displayedScreenshotUrl = computed((): string => {
      const screenImage = operationHistoryState.value.screenImage;
      if (!screenImage) {
        return "";
      }

      return screenImage.background.image.url;
    });

    const imageInfo = computed((): { decode: string } => {
      if (displayedScreenshotUrl.value !== "") {
        return { decode: displayedScreenshotUrl.value };
      }

      return { decode: "" };
    });

    const screenshotUrl = computed((): string => {
      return imageInfo.value.decode ?? "";
    });

    return {
      screenshotName,
      imageInfo,
      screenshotUrl
    };
  }
});
</script>

<style lang="sass" scoped>
.screenshot-button
  position: absolute
  z-index: 6
  bottom: 4px
  left: 2px
</style>
