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
  <execute-dialog
    :opened="opened"
    :title="$t('common.target-tab-window')"
    @accept="onAcceptWindowSelector()"
    @cancel="onCancelWindowSelector()"
  >
    <v-select
      v-model="capturingWindowInfo.currentWindowHandle"
      variant="underlined"
      :items="capturingWindowInfo.windows"
    >
    </v-select>
  </execute-dialog>
</template>

<script lang="ts">
import { type WindowInfo } from "@/lib/operationHistory/types";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { defineComponent, ref, toRefs, watch } from "vue";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";

export default defineComponent({
  components: {
    "execute-dialog": ExecuteDialog
  },
  props: {
    opened: { type: Boolean, default: false, required: true }
  },
  setup(props, context) {
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();

    const capturingWindowInfo = ref<{
      currentWindowHandle: string;
      windows: WindowInfo[];
    }>({
      currentWindowHandle: "",
      windows: []
    });

    const openWindowSelector = (): void => {
      const windows = operationHistoryStore.windows.filter((window) => {
        return captureControlStore.captureSession?.windowHandles.includes(window.value);
      });

      if (props.opened && captureControlStore.captureSession) {
        capturingWindowInfo.value.currentWindowHandle =
          captureControlStore.captureSession.currentWindowHandle;
        capturingWindowInfo.value.windows.splice(
          0,
          capturingWindowInfo.value.windows.length,
          ...windows
        );
      }
    };

    const onAcceptWindowSelector = (): void => {
      (async () => {
        captureControlStore.switchCapturingWindow({
          to: capturingWindowInfo.value.currentWindowHandle
        });

        context.emit("close");
      })();
    };

    const onCancelWindowSelector = (): void => {
      (async () => {
        context.emit("close");
      })();
    };

    const { opened } = toRefs(props);
    watch(opened, openWindowSelector);

    if (props.opened) {
      openWindowSelector();
    }

    return {
      capturingWindowInfo,
      onAcceptWindowSelector,
      onCancelWindowSelector
    };
  }
});
</script>
