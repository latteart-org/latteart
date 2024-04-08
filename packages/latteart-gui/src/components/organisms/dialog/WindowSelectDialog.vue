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
  <execute-dialog
    :opened="opened"
    :title="$t('app.target-tab-window')"
    @accept="onAcceptWindowSelector()"
    @cancel="onCancelWindowSelector()"
  >
    <v-select
      :items="capturingWindowInfo.windows"
      v-model="capturingWindowInfo.currentWindowHandle"
    >
    </v-select>
  </execute-dialog>
</template>

<script lang="ts">
import { type WindowInfo } from "@/lib/operationHistory/types";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { defineComponent, ref, toRefs, watch } from "vue";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true }
  },
  components: {
    "execute-dialog": ExecuteDialog
  },
  setup(props, context) {
    const rootStore = useRootStore();
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
      t: rootStore.message,
      capturingWindowInfo,
      onAcceptWindowSelector,
      onCancelWindowSelector
    };
  }
});
</script>
