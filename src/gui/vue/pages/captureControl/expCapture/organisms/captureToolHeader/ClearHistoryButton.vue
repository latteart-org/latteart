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
      :disabled="isDisabled"
      icon
      flat
      large
      color="grey darken-3"
      @click="resetHistory"
      :title="$store.getters.message('app.reset')"
    >
      <!-- <v-icon>refresh</v-icon> -->
      <!-- <v-icon>autorenew</v-icon> -->
      <v-icon v-if="isDisabled">block</v-icon>
      <v-icon v-else>autorenew</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class ClearHistoryButton extends Vue {
  public get isDisabled(): boolean {
    return this.isCapturing || this.isReplaying || this.isResuming;
  }

  public get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  public get isReplaying(): boolean {
    return this.$store.state.captureControl.isReplaying;
  }

  public get isResuming(): boolean {
    return this.$store.state.captureControl.isResuming;
  }

  public resetHistory(): void {
    this.$store.dispatch("operationHistory/resetHistory");
    this.$store.dispatch("captureControl/resetTimer");
  }
}
</script>
