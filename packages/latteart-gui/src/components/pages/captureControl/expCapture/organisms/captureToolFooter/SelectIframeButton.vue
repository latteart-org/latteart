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
      :disabled="!iframeSelectorIsEnabled"
      fab
      small
      @click="iframeSelectorOpened = true"
      :title="$store.getters.message('app.target-iframe')"
      id="openIframeSelectorButton"
      class="mx-2"
    >
      <v-icon dark>tab</v-icon>
    </v-btn>

    <iframe-selector-dialog
      :opened="iframeSelectorOpened"
      @close="iframeSelectorOpened = false"
    >
    </iframe-selector-dialog>
  </div>
</template>

<script lang="ts">
import { CaptureControlState } from "@/store/captureControl";
import { Component, Vue } from "vue-property-decorator";
import IframeSelectorDialog from "../FrameSelectorDialog.vue";

@Component({
  components: {
    "iframe-selector-dialog": IframeSelectorDialog,
  },
})
export default class SelectIframeButton extends Vue {
  private iframeSelectorOpened = false;

  private get captureControlState(): CaptureControlState {
    return this.$store.state.captureControl;
  }

  private get isCapturing(): boolean {
    return this.captureControlState.isCapturing;
  }

  private get isReplaying(): boolean {
    return this.captureControlState.isReplaying;
  }

  private get isInIframe(): boolean {
    return this.captureControlState.currentFrame.locator !== "";
  }

  private get iframeSelectorIsEnabled() {
    if (!this.isCapturing) {
      return false;
    }
    if (this.isReplaying) {
      return false;
    }
    return (
      (this.captureControlState.iframeElements?.length ?? 0) > 0 ||
      this.isInIframe
    );
  }
}
</script>
