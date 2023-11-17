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
      @click="browserForward"
      :disabled="isDisabled"
      :title="store.getters.message('navigate.forward')"
      class="mx-2"
    >
      <v-icon dark>arrow_forward</v-icon>
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
      return !isCapturing.value || !canDoBrowserForward.value;
    });

    const isCapturing = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState)
        .isCapturing;
    });

    const canDoBrowserForward = computed(() => {
      return (
        ((store.state as any).captureControl as CaptureControlState)
          .captureSession?.canNavigateForward ?? false
      );
    });

    const browserForward = (): void => {
      store.dispatch("captureControl/browserForward");
    };

    return {
      store,
      isDisabled,
      browserForward,
    };
  },
});
</script>
