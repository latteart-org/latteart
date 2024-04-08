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
  <v-container v-if="videoUrl" fluid fill-height class="pa-0">
    <video-display
      :videoUrl="videoUrl"
      :pictureInPicture="isPipMode"
      @playing="isRectDisplayed = false"
      @enterPictureInPicture="togglePipMode(true)"
      @leavePictureInPicture="togglePipMode(false)"
    >
      <div v-if="isRectDisplayed" :style="rectStyle" class="rect-area"></div>
    </video-display>
  </v-container>
</template>

<script lang="ts">
import VideoDisplay from "@/components/molecules/VideoDisplay.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  components: {
    "video-display": VideoDisplay
  },
  setup() {
    const store = useStore();

    const isRectDisplayed = ref(false);

    const operationHistoryState = computed(() => {
      return ((store.state as any).operationHistory as OperationHistoryState) ?? null;
    });

    const isPipMode = computed(() => {
      return operationHistoryState.value.isPictureInPictureWindowDisplayed;
    });

    const selectedOperationInfo = computed(() => {
      return operationHistoryState.value.selectedOperationInfo;
    });

    const rectStyle = computed(
      (): {
        top?: string;
        left?: string;
        width?: string;
        height?: string;
        display: string;
      } => {
        const screenImage = operationHistoryState.value.screenImage;
        if (!screenImage || !screenImage.background.video || !screenImage.overlay?.markerRect) {
          return { display: "none" };
        }
        const { width, height, offset, markerRect } = screenImage.overlay;
        return {
          top: `${((markerRect.top + (offset?.y ?? 0)) / height) * 100}%`,
          left: `${(markerRect.left / width) * 100}%`,
          width: `${(markerRect.width / width) * 100}%`,
          height: `${(markerRect.height / height) * 100}%`,
          display: "block"
        };
      }
    );

    const videoUrl = computed(() => {
      isRectDisplayed.value = true;
      const screenImage = operationHistoryState.value.screenImage;
      if (!screenImage || !screenImage.background.video) {
        return "";
      }
      const { url, time } = screenImage.background.video;
      return `${url}#t=${time}`;
    });

    const togglePipMode = (isPipMode: boolean) => {
      if (isPipMode) {
        isRectDisplayed.value = false;
      }
      store.commit("operationHistory/setPictureInPictureWindowDisplayed", {
        isDisplayed: isPipMode
      });
    };

    const displayRect = () => {
      if (isPipMode.value) {
        return;
      }
      isRectDisplayed.value = true;
    };

    watch(selectedOperationInfo, displayRect);

    return {
      isRectDisplayed,
      isPipMode,
      rectStyle,
      videoUrl,
      togglePipMode
    };
  }
});
</script>

<style lang="sass" scoped>
.rect-area
  position: absolute
  outline: solid 2px #F00
</style>
