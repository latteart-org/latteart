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
  <v-row justify="start" align="center">
    <v-icon class="pr-1">open_in_browser</v-icon>
    <v-text-field
      single-line
      label="URL"
      v-model="url"
      :disabled="isDisabled"
      id="urlTextField"
    ></v-text-field>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class URLTextField extends Vue {
  private get isDisabled(): boolean {
    return this.isCapturing || this.isReplaying || this.isResuming;
  }

  private get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  private get isReplaying(): boolean {
    return this.$store.state.captureControl.isReplaying;
  }

  private get isResuming(): boolean {
    return this.$store.state.captureControl.isResuming;
  }

  private get url(): string {
    return this.$store.state.captureControl.url;
  }

  private set url(value: string) {
    this.$store.commit("captureControl/setUrl", { url: value });
  }
}
</script>
