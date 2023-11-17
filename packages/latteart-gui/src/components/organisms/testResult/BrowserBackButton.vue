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
      fab
      small
      @click="browserBack"
      :disabled="isDisabled"
      :title="store.getters.message('navigate.back')"
      class="mx-2"
    >
      <v-icon dark>arrow_back</v-icon>
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

    const isDisabled = computed((): boolean => {
      return !isCapturing.value || !canDoBrowserBack.value;
    });

    const isCapturing = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState)
        .isCapturing;
    });

    const canDoBrowserBack = computed(() => {
      return (
        ((store.state as any).captureControl as CaptureControlState)
          .captureSession?.canNavigateBack ?? false
      );
    });

    const browserBack = (): void => {
      store.dispatch("captureControl/browserBack");
    };

    return {
      store,
      isDisabled,
      browserBack,
    };
  },
});
</script>
