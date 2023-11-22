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
    :title="store.getters.message('app.target-tab-window')"
    @accept="onAcceptWindowSelector()"
    @cancel="onCancelWindowSelector()"
  >
    <template>
      <v-select
        :items="capturingWindowInfo.windows"
        v-model="capturingWindowInfo.currentWindowHandle"
      >
      </v-select>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { WindowInfo } from "@/lib/operationHistory/types";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { CaptureControlState } from "@/store/captureControl";
import { OperationHistoryState } from "@/store/operationHistory";
import { defineComponent, ref, toRefs, watch } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true },
  },
  components: {
    "execute-dialog": ExecuteDialog,
  },
  setup(props, context) {
    const store = useStore();

    const capturingWindowInfo = ref<{
      currentWindowHandle: string;
      windows: WindowInfo[];
    }>({
      currentWindowHandle: "",
      windows: [],
    });

    const openWindowSelector = (): void => {
      const captureControlState = (store.state as any)
        .captureControl as CaptureControlState;
      const operationHistoryState = (store.state as any)
        .operationHistory as OperationHistoryState;

      const windows = operationHistoryState.windows.filter((window) => {
        return captureControlState.captureSession?.windowHandles.includes(
          window.value
        );
      });

      if (props.opened && captureControlState.captureSession) {
        capturingWindowInfo.value.currentWindowHandle =
          captureControlState.captureSession.currentWindowHandle;
        capturingWindowInfo.value.windows.splice(
          0,
          capturingWindowInfo.value.windows.length,
          ...windows
        );
      }
    };

    const onAcceptWindowSelector = (): void => {
      (async () => {
        await store.dispatch("captureControl/switchCapturingWindow", {
          to: capturingWindowInfo.value.currentWindowHandle,
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
      store,
      capturingWindowInfo,
      onAcceptWindowSelector,
      onCancelWindowSelector,
    };
  },
});
</script>
