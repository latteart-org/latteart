<!--
 Copyright 2022 NTT Corporation.

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
      @click="windowSelectorOpened = true"
      :title="$store.getters.message('app.target-tab-window')"
      id="openWindowSelectorButton"
    >
      <v-icon dark>tab</v-icon>
    </v-btn>

    <window-selector-dialog
      :opened="windowSelectorOpened"
      @close="windowSelectorOpened = false"
    >
    </window-selector-dialog>
  </div>
</template>

<script lang="ts">
import { DeviceSettings } from "@/lib/common/settings/Settings";
import { CaptureControlState } from "@/store/captureControl";
import { Component, Vue, Watch } from "vue-property-decorator";
import WindowSelectorDialog from "../WindowSelectorDialog.vue";

@Component({
  components: {
    "window-selector-dialog": WindowSelectorDialog,
  },
})
export default class SelectWindowButton extends Vue {
  private windowSelectorOpened = false;

  private get config(): DeviceSettings {
    return this.$store.state.deviceSettings;
  }

  private get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  private get isReplaying(): boolean {
    return this.$store.state.captureControl.isReplaying;
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

  private get currentSessionWindowHandlesLength() {
    return (
      (this.$store.state.captureControl as CaptureControlState).captureSession
        ?.windowHandles.length ?? 0
    );
  }

  @Watch("currentSessionWindowHandlesLength")
  private openWindowSelectorDialog() {
    if (this.currentSessionWindowHandlesLength > 1 && !this.isReplaying) {
      this.windowSelectorOpened = true;
    }
  }
}
</script>
