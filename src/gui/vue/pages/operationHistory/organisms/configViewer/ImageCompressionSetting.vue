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
  <v-container class="mt-0 pt-0">
    <v-layout row wrap>
      <v-flex xs12>
        <v-checkbox
          v-model="tempConfig.isEnabled"
          :label="
            $store.getters.message('config-view.image-compression-enabled')
          "
          @change="saveConfig"
        >
        </v-checkbox>
      </v-flex>
      <v-flex xs12>
        <v-checkbox
          v-model="tempConfig.isDeleteSrcImage"
          :label="
            $store.getters.message(
              'config-view.image-compression-delete-source-image'
            )
          "
          :disabled="!tempConfig.isEnabled"
          @change="saveConfig"
        >
        </v-checkbox>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { ImageCompression } from "@/lib/common/settings/Settings";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class ImageCompressionSetting extends Vue {
  @Prop({ type: Boolean, required: true })
  public readonly opened!: boolean;
  @Prop({ type: Object, default: null })
  public readonly imageCompression!: ImageCompression;

  private tempConfig: { isEnabled: boolean; isDeleteSrcImage: boolean } = {
    ...this.imageCompression,
  };

  @Watch("imageCompression")
  private updateTempConfig() {
    if (!this.opened) {
      this.tempConfig = { ...this.imageCompression };
    }
  }

  private saveConfig() {
    if (this.opened) {
      this.$emit("save-config", {
        imageCompression: this.tempConfig,
      });
    }
  }
}
</script>
