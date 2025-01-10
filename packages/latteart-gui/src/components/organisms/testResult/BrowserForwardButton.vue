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
  <div>
    <v-btn
      icon="arrow_forward"
      size="small"
      :disabled="isDisabled"
      :title="$t('browser-forward-button.forward')"
      class="mx-2"
      @click="browserForward"
    >
    </v-btn>
  </div>
</template>

<script lang="ts">
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { computed, defineComponent, ref, watch } from "vue";

export default defineComponent({
  setup() {
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();

    const canDoBrowserForward = ref(false);

    const isDisabled = computed((): boolean => {
      return !isCapturing.value || !canDoBrowserForward.value;
    });

    const isCapturing = computed((): boolean => {
      return captureControlStore.isCapturing;
    });

    const historyLength = computed(() => {
      return operationHistoryStore.history.length;
    });

    const browserForward = (): void => {
      captureControlStore.browserForward();
    };

    watch(historyLength, () => {
      canDoBrowserForward.value = captureControlStore.captureSession?.canNavigateForward ?? false;
    });

    return {
      isDisabled,
      browserForward
    };
  }
});
</script>
