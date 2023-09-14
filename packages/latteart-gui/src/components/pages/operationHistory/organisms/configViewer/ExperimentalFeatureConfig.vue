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
      <v-col class="pt-0">
        <h4>
          {{ $store.getters.message("config-view.recording-method") }}
        </h4>
        <v-checkbox
          v-model="captureArch"
          :label="$store.getters.message('config-view.capture-arch')"
          :disabled="isCapturing"
          hide-details
          class="py-0 my-0"
          true-value="push"
          false-value="polling"
        >
        </v-checkbox>
        <span class="pl-8">{{
          $store.getters.message("config-view.attention")
        }}</span>
        <p class="pl-8">
          {{ $store.getters.message("config-view.attention-video") }}
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ExperimentalFeatureSetting } from "@/lib/common/settings/Settings";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
@Component
export default class ExperimentalFeatureConfig extends Vue {
  @Prop({ type: Boolean, required: true })
  public readonly opened!: boolean;
  @Prop({ type: Object, default: null })
  public readonly experimentalFeatureSetting!: ExperimentalFeatureSetting;
  @Prop({ type: Boolean, default: true })
  public readonly isCapturing!: boolean;
  private tempConfig: ExperimentalFeatureSetting = {
    ...this.experimentalFeatureSetting,
  };
  @Watch("experimentalFeatureSetting")
  private updateTempConfig() {
    if (!this.opened) {
      this.tempConfig = { ...this.experimentalFeatureSetting };
    }
  }
  @Watch("tempConfig")
  private saveConfig() {
    if (this.opened) {
      this.$emit("save-config", {
        experimentalFeatureSetting: this.tempConfig,
      });
    }
  }

  private get captureArch(): "polling" | "push" {
    return this.tempConfig.captureArch;
  }

  private set captureArch(captureArch: "polling" | "push") {
    this.tempConfig = {
      ...this.tempConfig,
      captureArch,
    };
  }
}
</script>
