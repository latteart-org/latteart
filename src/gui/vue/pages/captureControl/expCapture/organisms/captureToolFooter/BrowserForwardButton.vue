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
      fab
      small
      @click="browserForward"
      :disabled="isDisabled"
      :title="$store.getters.message('navigate.forward')"
    >
      <!-- <v-icon dark>arrow_forward</v-icon> -->
      <v-icon dark>chevron_right</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class BrowserForwardButton extends Vue {
  public get isDisabled(): boolean {
    return !this.isCapturing || !this.canDoBrowserForward;
  }

  public get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public get canDoBrowserForward() {
    return this.$store.state.captureControl.canDoBrowserForward;
  }

  public browserForward(): void {
    this.$store.dispatch("captureControl/browserForward");
  }
}
</script>
