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
  <v-card flat class="pa-0">
    <v-card-text>
      <v-text-field
        :label="$store.getters.message('app.url')"
        v-model="captureOption.url"
      />
      <v-text-field
        :label="$store.getters.message('app.test-result-name')"
        v-model="captureOption.testResultName"
      ></v-text-field>
    </v-card-text>

    <v-card-subtitle>
      {{ $store.getters.message("config-view.device") }}
    </v-card-subtitle>

    <v-card-text>
      <v-select
        :label="$store.getters.message('config-view.platform')"
        :items="platforms"
        v-model="captureOption.platform"
      ></v-select>

      <v-card class="pa-2 mb-4" outlined v-show="isMobileSelected">
        <v-card-text>
          <v-btn @click="updateDevices">{{
            $store.getters.message("config-view.update-device")
          }}</v-btn>
          <v-select
            :label="$store.getters.message('config-view.select-device')"
            v-model="captureOption.device"
            :items="devices"
            item-text="modelNumber"
            item-value="deviceName"
            :no-data-text="$store.getters.message('config-view.no-device')"
            return-object
          ></v-select>
          <v-text-field
            :label="$store.getters.message('config-view.os-version')"
            v-model="captureOption.device.osVersion"
            readonly
          ></v-text-field>
        </v-card-text>
      </v-card>

      <v-select
        :label="$store.getters.message('config-view.browser')"
        :items="browsers"
        v-model="captureOption.browser"
      ></v-select>

      <number-field
        v-show="isMobileSelected"
        arrowOnly
        @updateNumberFieldValue="
          ({ value }) => {
            captureOption.waitTimeForStartupReload = value;
          }
        "
        :value="captureOption.waitTimeForStartupReload"
        :maxValue="60"
        :minValue="0"
        :label="$store.getters.message('config-view.reload-setting')"
        :suffix="$store.getters.message('config-view.reload-suffix')"
      ></number-field>
    </v-card-text>

    <v-card-subtitle>
      {{ $store.getters.message("config-view.media-type") }}
    </v-card-subtitle>

    <v-card-text class="mb-3">
      <v-radio-group
        v-model="captureOption.mediaType"
        :disabled="isMediaTypeDisabled"
        class="py-0 my-0"
        row
        :hint="$store.getters.message('config-view.capture-media-config-hint')"
        persistent-hint
      >
        <v-radio
          :label="$store.getters.message('config-view.still-image')"
          value="image"
        />
        <v-radio
          :label="$store.getters.message('config-view.video')"
          value="video"
        />
      </v-radio-group>
    </v-card-text>

    <v-card-subtitle>
      {{ $store.getters.message("test-option.title") }}
    </v-card-subtitle>

    <v-card-text>
      <v-checkbox
        class="mt-0"
        :label="$store.getters.message('test-option.use-test-purpose')"
        v-model="captureOption.shouldRecordTestPurpose"
      ></v-checkbox>

      <v-card
        class="pa-2 mb-4"
        outlined
        v-show="captureOption.shouldRecordTestPurpose"
      >
        <v-card-subtitle>
          {{ $store.getters.message("test-option.first-test-purpose") }}
        </v-card-subtitle>

        <v-card-text>
          <v-text-field
            :label="$store.getters.message('note-edit.summary')"
            v-model="captureOption.firstTestPurpose"
          ></v-text-field>
          <v-textarea
            :label="$store.getters.message('note-edit.details')"
            v-model="captureOption.firstTestPurposeDetails"
          ></v-textarea>
        </v-card-text>
      </v-card>
    </v-card-text>

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import NumberField from "@/components/molecules/NumberField.vue";
import { RootState } from "@/store";
import { SettingsForRepository } from "latteart-client";
import { DeviceSettings } from "@/lib/common/settings/Settings";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { CaptureOptionParams } from "@/lib/common/captureOptionParams";

@Component({
  components: {
    "number-field": NumberField,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class CaptureOption extends Vue {
  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private captureOption: CaptureOptionParams = {
    url: "",
    testResultName: "",
    platform: this.deviceSettings?.platformName ?? "PC",
    device: this.deviceSettings?.device ?? {
      deviceName: "",
      modelNumber: "",
      osVersion: "",
    },
    waitTimeForStartupReload: 0,
    browser: this.deviceSettings?.browser ?? "Chrome",
    mediaType:
      this.projectSettings?.config.captureMediaSetting.mediaType ?? "image",
    shouldRecordTestPurpose: false,
    firstTestPurpose: "",
    firstTestPurposeDetails: "",
  };

  private platforms: DeviceSettings["platformName"][] = [
    "PC",
    "Android",
    "iOS",
  ];

  private devices: {
    deviceName: string;
    modelNumber: string;
    osVersion: string;
  }[] = [];

  private get browsers(): DeviceSettings["browser"][] {
    if (this.captureOption.platform === "Android") return ["Chrome"];
    if (this.captureOption.platform === "iOS") return ["Safari"];

    return ["Chrome", "Edge"];
  }

  private get projectSettings(): SettingsForRepository | undefined {
    return (this.$store.state as RootState).projectSettings;
  }

  private get deviceSettings(): DeviceSettings | undefined {
    return (this.$store.state as RootState).deviceSettings;
  }

  private get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  private get captureArch() {
    return (
      this.projectSettings?.config.experimentalFeatureSetting.captureArch ??
      "polling"
    );
  }

  private get isMediaTypeDisabled() {
    return (
      this.isCapturing ||
      this.captureArch === "push" ||
      this.captureOption.platform !== "PC"
    );
  }

  private get isMobileSelected() {
    return this.captureOption.platform !== "PC";
  }

  @Watch("captureOption", { deep: true })
  private update(): void {
    this.$emit("update", {
      ...this.captureOption,
      waitTimeForStartupReload: this.isMobileSelected
        ? this.captureOption.waitTimeForStartupReload
        : 0,
      firstTestPurpose: this.captureOption.shouldRecordTestPurpose
        ? this.captureOption.firstTestPurpose
        : "",
      firstTestPurposeDetails: this.captureOption.shouldRecordTestPurpose
        ? this.captureOption.firstTestPurposeDetails
        : "",
    });
  }

  @Watch("browsers")
  private initializeBrowserSelection() {
    this.captureOption.browser = this.browsers[0];
  }

  @Watch("captureOption.platform")
  private async updateDevices() {
    try {
      this.devices = [
        ...(await this.recognizeDevices(this.captureOption.platform)),
      ];
      this.captureOption.device = this.getDefaultDevice(this.devices);
    } catch (error) {
      if (error instanceof Error) {
        this.errorMessageDialogOpened = true;
        this.errorMessage = error.message;

        return;
      }

      throw error;
    }
  }

  private getDefaultDevice(
    devices: {
      deviceName: string;
      modelNumber: string;
      osVersion: string;
    }[]
  ) {
    return devices.length > 0
      ? devices[0]
      : { deviceName: "", modelNumber: "", osVersion: "" };
  }

  private async recognizeDevices(platformName: string): Promise<
    {
      deviceName: string;
      modelNumber: string;
      osVersion: string;
    }[]
  > {
    return this.$store.dispatch("captureControl/recognizeDevices", {
      platformName,
    });
  }
}
</script>
