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
    <v-row>
      <v-col cols="12">
        <v-radio-group
          :value="tempConfig.imageCompression.format"
          class="py-0 my-0"
          @change="changeCaptureFormat"
          :disabled="captureArch === 'push'"
        >
          <v-radio
            :label="$store.getters.message('config-page.png')"
            value="png"
          ></v-radio>
          <v-radio
            :label="$store.getters.message('config-page.webp')"
            value="webp"
          ></v-radio>
        </v-radio-group>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { CaptureMediaSetting } from "@/lib/common/settings/Settings";
import { RootState } from "@/store";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
@Component
export default class CaptureMediaConfig extends Vue {
  @Prop({ type: Boolean, required: true })
  public readonly opened!: boolean;
  @Prop({ type: Object, default: null })
  public readonly captureMediaSetting!: CaptureMediaSetting;
  @Prop({ type: Boolean, default: true })
  public readonly isCapturing!: boolean;
  private tempConfig: CaptureMediaSetting = {
    ...this.captureMediaSetting,
  };

  private get captureArch() {
    return (
      (this.$store.state as RootState).projectSettings.config
        .experimentalFeatureSetting.captureArch ?? "polling"
    );
  }

  private get platform() {
    return (this.$store.state as RootState).deviceSettings.platformName;
  }

  @Watch("captureMediaSetting")
  private updateTempConfig() {
    if (!this.opened) {
      this.tempConfig = { ...this.captureMediaSetting };
    }
  }
  @Watch("tempConfig")
  private saveConfig() {
    if (this.opened) {
      this.$emit("save-config", { captureMediaSetting: this.tempConfig });
    }
  }

  private changeCaptureFormat(format: "png" | "webp") {
    this.tempConfig = { ...this.tempConfig, imageCompression: { format } };
  }
}
</script>