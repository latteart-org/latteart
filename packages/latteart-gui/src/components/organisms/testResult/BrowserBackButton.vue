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
      icon="arrow_back"
      size="small"
      :disabled="isDisabled"
      :title="$t('navigate.back')"
      class="mx-2"
      @click="browserBack"
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

    const canDoBrowserBack = ref(false);

    const isDisabled = computed((): boolean => {
      return !isCapturing.value || !canDoBrowserBack.value;
    });

    const isCapturing = computed((): boolean => {
      return captureControlStore.isCapturing;
    });

    const historyLength = computed(() => {
      return operationHistoryStore.history.length;
    });

    const browserBack = (): void => {
      captureControlStore.browserBack();
    };

    watch(historyLength, () => {
      canDoBrowserBack.value = captureControlStore.captureSession?.canNavigateBack ?? false;
    });

    return {
      isDisabled,
      browserBack
    };
  }
});
</script>
