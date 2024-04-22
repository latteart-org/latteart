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
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { computed, defineComponent } from "vue";

export default defineComponent({
  setup() {
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();

    const currentWindowName = computed((): string => {
      const session = captureControlStore.captureSession;

      const currentWindow = operationHistoryStore.windows.find((window) => {
        return session && window.value === session.currentWindowHandle;
      });

      if (currentWindow === undefined) {
        return "No Window";
      }

      return currentWindow.text;
    });

    return {
      currentWindowName
    };
  }
});
</script>
