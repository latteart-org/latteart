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
      :disabled="!isCapturing"
      @click="pushPauseButton"
      icon
      flat
      large
      :title="pauseButtonTooltip"
      :color="pauseButtonColor"
    >
      <v-icon>pause</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class PauseButton extends Vue {
  private get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  private get isPaused(): boolean {
    return this.$store.state.captureControl.isPaused;
  }

  private get pauseButtonTooltip(): string {
    if (!this.isCapturing) {
      return "";
    }
    return this.$store.getters.message(
      this.isPaused ? "app.resume-capturing" : "app.pause-capturing"
    );
  }

  private get pauseButtonColor() {
    return this.isPaused ? "yellow" : "grey darken-3";
  }

  private pushPauseButton() {
    if (this.isPaused) {
      this.$store.dispatch("captureControl/resumeCapturing");
    } else {
      this.$store.dispatch("captureControl/pauseCapturing");
    }
  }
}
</script>
