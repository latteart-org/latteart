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
  <div>
    <v-btn
      :disabled="!isCapturing"
      @click="pushPauseButton"
      icon
      text
      large
      :title="pauseButtonTooltip"
      :color="pauseButtonColor"
      class="mx-2"
    >
      <v-icon>pause</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { CaptureControlState } from "@/store/captureControl";
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  setup() {
    const store = useStore();

    const isCapturing = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState)
        .isCapturing;
    });

    const isPaused = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState)
        .isPaused;
    });

    const pauseButtonTooltip = computed((): string => {
      if (!isCapturing.value) {
        return "";
      }
      return store.getters.message(
        isPaused.value ? "app.resume-capturing" : "app.pause-capturing"
      );
    });

    const pauseButtonColor = computed(() => {
      return isPaused.value ? "yellow" : "grey darken-3";
    });

    const pushPauseButton = () => {
      if (isPaused.value) {
        store.dispatch("captureControl/resumeCapturing");
      } else {
        store.dispatch("captureControl/pauseCapturing");
      }
    };

    return {
      isCapturing,
      pauseButtonTooltip,
      pauseButtonColor,
      pushPauseButton,
    };
  },
});
</script>
