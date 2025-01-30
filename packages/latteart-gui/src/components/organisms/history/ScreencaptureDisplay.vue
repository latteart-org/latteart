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

    <a @click="downloadFile" class="screenshot-button">
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

    const downloadFile = (): boolean => {
      const url = new URL(imageInfo.value.decode);
      const pathName = url.pathname;
      const ar = pathName.split("/");
      ar.shift();
      const fileUrl = ar.join("/");

      const a = document.createElement("a");
      (async () => {
        const fileData = await operationHistoryStore.getFileData({ fileUrl });
        if (!fileData) {
          return false;
        }
        const blobUrl = window.URL.createObjectURL(fileData);
        a.href = blobUrl;
        a.download = ar[ar.length - 1];
        a.click();
        window.URL.revokeObjectURL(blobUrl);
      })();

      return false;
    };

    return { imageInfo, screenshotUrl, downloadFile };
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
