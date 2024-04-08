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
      variant="text"
      size="large"
      :title="pauseButtonTooltip"
      :color="pauseButtonColor"
      class="mx-2"
    >
      <v-icon>pause</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";
import { computed, defineComponent } from "vue";

export default defineComponent({
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();

    const isCapturing = computed((): boolean => {
      return captureControlStore.isCapturing;
    });

    const isPaused = computed((): boolean => {
      return captureControlStore.isPaused;
    });

    const pauseButtonTooltip = computed((): string => {
      if (!isCapturing.value) {
        return "";
      }
      return rootStore.message(isPaused.value ? "app.resume-capturing" : "app.pause-capturing");
    });

    const pauseButtonColor = computed(() => {
      return isPaused.value ? "yellow" : "grey darken-3";
    });

    const pushPauseButton = () => {
      if (isPaused.value) {
        captureControlStore.resumeCapturing();
      } else {
        captureControlStore.pauseCapturing();
      }
    };

    return {
      isCapturing,
      pauseButtonTooltip,
      pauseButtonColor,
      pushPauseButton
    };
  }
});
</script>
