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
      variant="elevated"
      icon="arrow_forward"
      size="small"
      @click="browserForward"
      :disabled="isDisabled"
      :title="$t('navigate.forward')"
      class="mx-2"
    >
    </v-btn>
  </div>
</template>

<script lang="ts">
import { useCaptureControlStore } from "@/stores/captureControl";
import { useRootStore } from "@/stores/root";
import { computed, defineComponent } from "vue";

export default defineComponent({
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();

    const isDisabled = computed((): boolean => {
      return !isCapturing.value || !canDoBrowserForward.value;
    });

    const isCapturing = computed((): boolean => {
      return captureControlStore.isCapturing;
    });

    const canDoBrowserForward = computed(() => {
      return captureControlStore.captureSession?.canNavigateForward ?? false;
    });

    const browserForward = (): void => {
      captureControlStore.browserForward();
    };

    return {
      t: rootStore.message,
      isDisabled,
      browserForward
    };
  }
});
</script>
