<!--
 Copyright 2024 NTT Corporation.

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
  <v-container v-if="screenshotUrl" fluid class="pa-0 fill-height" style="position: relative">
    <popup-image :image-file-url="imageInfo.decode"></popup-image>

    <a
      ref="dllink"
      :href="screenshotUrl"
      :download="screenshotName"
      target="_blank"
      rel="noopener noreferrer"
      class="screenshot-button"
    >
      <v-btn color="white" icon="image" size="small"> </v-btn
    ></a>
  </v-container>
</template>

<script lang="ts">
import PopupImage from "@/components/molecules/PopupImage.vue";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { computed, defineComponent } from "vue";

export default defineComponent({
  components: {
    "popup-image": PopupImage
  },
  setup() {
    const operationHistoryStore = useOperationHistoryStore();

    const selectedOperationInfo = computed(() => {
      return operationHistoryStore.selectedOperationInfo;
    });

    const screenshotName = computed((): string => {
      const url = imageInfo.value.decode;
      const ar = url.split(".");
      const ext = ar[ar.length - 1];
      const sequence = selectedOperationInfo.value;
      return `${sequence}.${ext}`;
    });

    const displayedScreenshotUrl = computed((): string => {
      const screenImage = operationHistoryStore.screenImage;
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
