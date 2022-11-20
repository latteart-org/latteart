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
      <!-- <v-icon dark>tab_unselected</v-icon> -->
      <v-icon v-if="windowSelectorIsEnabled">tab</v-icon>
      <v-icon v-else>tab_unselected</v-icon>
    </v-btn>

    <window-selector-dialog
      :opened="windowSelectorOpened"
      @close="windowSelectorOpened = false"
    >
    </window-selector-dialog>
  </div>
</template>

<script lang="ts">
import { CaptureConfig } from "@/lib/captureControl/CaptureConfig";
import { PlatformName } from "@/lib/common/enum/SettingsEnum";
import { Component, Vue } from "vue-property-decorator";
import WindowSelectorDialog from "../WindowSelectorDialog.vue";

@Component({
  components: {
    "window-selector-dialog": WindowSelectorDialog,
  },
})
export default class SelectWindowButton extends Vue {
  public windowSelectorOpened = false;

  public get config(): CaptureConfig {
    return this.$store.state.operationHistory.config;
  }

  public get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public get windowSelectorIsEnabled() {
    if (!this.isCapturing) {
      return false;
    }
    if (this.config.platformName === PlatformName.iOS) {
      return false;
    }
    return true;
  }
}
</script>
