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
  <v-layout>
    <v-combobox
      :hide-details="hideDetails"
      v-model="targetUrl"
      :items="urls"
      :label="$store.getters.message('remote-access.remote-connection-url')"
      id="connectUrlTextField"
      ref="urlField"
      :disabled="disabled"
    ></v-combobox>
    <v-btn
      :color="color"
      id="connecttButton"
      @click="connect()"
      :disabled="disabled || targetUrl === url"
      >{{ $store.getters.message("remote-access.connect") }}</v-btn
    >
  </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class RemoteAccessField extends Vue {
  @Prop({ type: String, default: "" }) public readonly url!: string;
  @Prop({ type: String, default: "" }) public readonly color!: string;
  @Prop({ type: Boolean, default: false })
  public readonly hideDetails!: boolean;
  @Prop({ type: Array, default: () => [] }) public readonly urls!: string[];
  @Prop({ type: Boolean, default: false })
  public readonly disabled!: boolean;

  private targetUrl = this.url;

  @Watch("url")
  private updateUrl() {
    this.targetUrl = this.url;
  }

  private connect(): void {
    (this.$refs.urlField as any).blur();
    this.$nextTick(() => {
      if (this.targetUrl) {
        this.$emit("execute", this.targetUrl);
      } else {
        console.warn("Target URL is empty.");
      }
    });
  }
}
</script>
