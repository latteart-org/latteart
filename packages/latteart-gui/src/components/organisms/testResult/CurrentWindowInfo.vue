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
    {{ currentWindowName }}
  </div>
</template>

<script lang="ts">
import { CaptureControlState } from "@/store/captureControl";
import { OperationHistoryState } from "@/store/operationHistory";
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  setup() {
    const store = useStore();

    const currentWindowName = computed((): string => {
      const captureControlState = (store.state as any)
        .captureControl as CaptureControlState;
      const operationHistoryState = (store.state as any)
        .operationHistory as OperationHistoryState;

      const session = captureControlState.captureSession;

      const currentWindow = operationHistoryState?.windows.find((window) => {
        return session && window.value === session.currentWindowHandle;
      });

      if (currentWindow === undefined) {
        return "No Window";
      }

      return currentWindow.text;
    });

    return {
      currentWindowName,
    };
  },
});
</script>
