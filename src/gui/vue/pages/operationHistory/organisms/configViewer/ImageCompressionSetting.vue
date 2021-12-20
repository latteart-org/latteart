<!--
 Copyright 2021 NTT Corporation.

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
          v-model="isEnableCompression"
          :label="
            $store.getters.message('config-view.image-compression-enabled')
          "
        >
        </v-checkbox>
      </v-flex>
      <v-flex xs12>
        <v-checkbox
          v-model="isDeleteSrcImage"
          :label="
            $store.getters.message(
              'config-view.image-compression-delete-source-image'
            )
          "
          :disabled="!isEnableCompression"
        >
        </v-checkbox>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class ImageCompressionSetting extends Vue {
  private get isEnableCompression(): boolean {
    return this.$store.state.operationHistory.config.imageCompression.isEnabled;
  }
  private set isEnableCompression(isEnabled: boolean) {
    (async () => {
      await this.$store.dispatch("operationHistory/writeSettings", {
        config: {
          imageCompression: {
            isEnabled,
            isDeleteSrcImage: this.$store.state.operationHistory.config
              .imageCompression.isDeleteSrcImage,
            command: this.$store.state.operationHistory.config.imageCompression
              .command,
          },
        },
      });
    })();
  }

  private get isDeleteSrcImage(): boolean {
    return this.$store.state.operationHistory.config.imageCompression
      .isDeleteSrcImage;
  }
  private set isDeleteSrcImage(isDelete: boolean) {
    (async () => {
      await this.$store.dispatch("operationHistory/writeSettings", {
        config: {
          imageCompression: {
            isEnabled: this.$store.state.operationHistory.config
              .imageCompression.isEnabled,
            isDeleteSrcImage: isDelete,
            command: this.$store.state.operationHistory.config.imageCompression
              .command,
          },
        },
      });
    })();
  }
}
</script>
