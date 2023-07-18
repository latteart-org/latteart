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
  <v-container class="mt-0 pt-0">
    <v-radio-group
      :value="tempConfig.type"
      class="py-0 my-0"
      @change="saveConfig"
    >
      <v-radio
        :label="$store.getters.message('config-view.png')"
        value="png"
      ></v-radio>
      <v-radio
        :label="$store.getters.message('config-view.webp')"
        value="webp"
      ></v-radio>
    </v-radio-group>
  </v-container>
</template>

<script lang="ts">
import { ImageCompressionSetting } from "@/lib/common/settings/Settings";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class ImageCompressionConfig extends Vue {
  @Prop({ type: Boolean, required: true })
  public readonly opened!: boolean;
  @Prop({ type: Object, default: null })
  public readonly imageCompression!: ImageCompressionSetting;

  private tempConfig: ImageCompressionSetting = { ...this.imageCompression };

  @Watch("imageCompression")
  private updateTempConfig() {
    if (!this.opened) {
      this.tempConfig = { ...this.imageCompression };
    }
  }

  @Watch("tempConfig")
  private saveConfig(type: "png" | "webp") {
    if (this.opened) {
      this.$emit("save-config", { imageCompression: { type } });
    }
  }
}
</script>
