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
  <v-layout justify-start align-center row>
    <!-- <v-icon class="pr-1">upload_file</v-icon> -->
    <v-icon class="pr-1">add_link</v-icon>
    <v-text-field
      single-line
      label="URL Link"
      v-model="url"
      :disabled="isDisabled"
      id="urlTextField"
    ></v-text-field>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class URLTextField extends Vue {
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

  public get url(): string {
    return this.$store.state.captureControl.url;
  }

  public set url(value: string) {
    this.$store.commit("captureControl/setUrl", { url: value });
  }
}
</script>
