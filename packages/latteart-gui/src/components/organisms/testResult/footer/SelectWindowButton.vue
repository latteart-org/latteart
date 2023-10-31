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
      :title="$store.getters.message('app.target-tab-window')"
      id="openWindowSelectorButton"
      class="mx-2"
    >
      <v-icon dark>tab</v-icon>
    </v-btn>

    <window-selector-dialog
      :opened="!isReplaying && isWindowSelectorDialogOpened"
      @close="isWindowSelectorDialogOpened = false"
    >
    </window-selector-dialog>
  </div>
</template>

<script lang="ts">
import { DeviceSettings } from "@/lib/common/settings/Settings";
import { CaptureControlState } from "@/store/captureControl";
import { Component, Vue } from "vue-property-decorator";
import WindowSelectorDialog from "./WindowSelectorDialog.vue";

@Component({
  components: {
    "window-selector-dialog": WindowSelectorDialog,
  },
})
export default class SelectWindowButton extends Vue {
  private get config(): DeviceSettings {
    return this.$store.state.deviceSettings;
  }

  private get captureControlState() {
    return this.$store.state.captureControl as CaptureControlState;
  }

  private get isCapturing(): boolean {
    return this.captureControlState.isCapturing;
  }

  private get isReplaying(): boolean {
    return this.captureControlState.isReplaying;
  }

  private get windowSelectorIsEnabled() {
    if (!this.isCapturing) {
      return false;
    }
    if (this.config.platformName === "iOS") {
      return false;
    }
    return true;
  }

  private get isWindowSelectorDialogOpened() {
    return this.captureControlState.isWindowSelectorDialogOpened;
  }

  private set isWindowSelectorDialogOpened(isOpened: boolean) {
    this.$store.commit("captureControl/setWindowSelectorDialogOpened", {
      isOpened,
    });
  }
}
</script>
