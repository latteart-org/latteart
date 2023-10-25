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
  <v-container fluid fill-height pa-8 style="overflow-y: scroll">
    <v-container class="align-self-start">
      <v-card class="pa-2">
        <capture-option @update="updateOption" />

        <v-card-actions>
          <record-start-trigger initial>
            <template v-slot:activator="{ on }">
              <v-btn
                :disabled="isExecuteButtonDisabled"
                :dark="!isExecuteButtonDisabled"
                color="primary"
                @click="execute(on)"
                >{{
                  $store.getters.message("start-capture-view.execute-button")
                }}</v-btn
              >
            </template>
          </record-start-trigger>
        </v-card-actions>
      </v-card>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { RootState } from "@/store";
import { Component, Vue } from "vue-property-decorator";
import RecordStartTrigger from "../../common/organisms/RecordStartTrigger.vue";
import CaptureOption from "../../common/CaptureOption.vue";
import { CaptureOptionParams } from "@/lib/common/captureOptionParams";

@Component({
  components: {
    "record-start-trigger": RecordStartTrigger,
    "capture-option": CaptureOption,
  },
})
export default class StartCaptureView extends Vue {
  private captureOption: CaptureOptionParams = {
    url: "",
    testResultName: "",
    platform: "PC",
    device: { deviceName: "", modelNumber: "", osVersion: "" },
    waitTimeForStartupReload: 0,
    browser: "Chrome",
    mediaType: "image",
    shouldRecordTestPurpose: false,
    firstTestPurpose: "",
    firstTestPurposeDetails: "",
  };

  private updateOption(option: CaptureOptionParams) {
    this.captureOption = option;
  }

  private get isExecuteButtonDisabled() {
    return !this.captureOption.url || !this.urlIsValid;
  }

  private get urlIsValid(): boolean {
    try {
      new URL(this.captureOption.url);
      return true;
    } catch (error) {
      return false;
    }
  }

  private get config() {
    return (this.$store.state as RootState).projectSettings.config;
  }

  private async execute(onStart: () => Promise<void>) {
    this.$store.dispatch("openProgressDialog");

    try {
      this.$store.commit("captureControl/setUrl", {
        url: this.captureOption.url,
      });
      this.$store.commit("captureControl/setTestResultName", {
        name: this.captureOption.testResultName,
      });
      await this.$store.dispatch("writeDeviceSettings", {
        config: {
          platformName: this.captureOption.platform,
          device: this.captureOption.device,
          browser: this.captureOption.browser,
          waitTimeForStartupReload: this.captureOption.waitTimeForStartupReload,
        },
      });
      await this.$store.dispatch("writeConfig", {
        config: {
          ...this.config,
          captureMediaSetting: {
            ...this.config.captureMediaSetting,
            mediaType: this.captureOption.mediaType,
          },
        },
      });
      this.$store.commit("captureControl/setTestOption", {
        testOption: {
          firstTestPurpose: this.captureOption.firstTestPurpose,
          firstTestPurposeDetails: this.captureOption.firstTestPurposeDetails,
          shouldRecordTestPurpose: this.captureOption.shouldRecordTestPurpose,
        },
      });
    } catch (error) {
      this.$store.dispatch("closeProgressDialog");
      throw error;
    }
    await onStart();
  }
}
</script>
