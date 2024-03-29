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
      :disabled="!windowSelectorIsEnabled"
      fab
      small
      @click="isWindowSelectorDialogOpened = true"
      :title="store.getters.message('app.target-tab-window')"
      id="openWindowSelectorButton"
      class="mx-2"
    >
      <v-icon dark>tab</v-icon>
    </v-btn>

    <window-select-dialog
      :opened="!isReplaying && isWindowSelectorDialogOpened"
      @close="isWindowSelectorDialogOpened = false"
    >
    </window-select-dialog>
  </div>
</template>

<script lang="ts">
import { DeviceSettings } from "@/lib/common/settings/Settings";
import { CaptureControlState } from "@/store/captureControl";
import WindowSelectDialog from "@/components/organisms/dialog/WindowSelectDialog.vue";
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  components: {
    "window-select-dialog": WindowSelectDialog,
  },
  setup() {
    const store = useStore();

    const config = computed((): DeviceSettings => {
      return store.state.deviceSettings;
    });

    const captureControlState = computed(() => {
      return (store.state as any).captureControl as CaptureControlState;
    });

    const isCapturing = computed((): boolean => {
      return captureControlState.value.isCapturing;
    });

    const isReplaying = computed((): boolean => {
      return captureControlState.value.isReplaying;
    });

    const windowSelectorIsEnabled = computed(() => {
      if (!isCapturing.value) {
        return false;
      }
      if (config.value.platformName === "iOS") {
        return false;
      }
      return true;
    });

    const isWindowSelectorDialogOpened = computed({
      get: () => captureControlState.value.isWindowSelectorDialogOpened,
      set: (isOpened: boolean) => {
        store.commit("captureControl/setWindowSelectorDialogOpened", {
          isOpened,
        });
      },
    });

    return {
      store,
      isReplaying,
      windowSelectorIsEnabled,
      isWindowSelectorDialogOpened,
    };
  },
});
</script>
