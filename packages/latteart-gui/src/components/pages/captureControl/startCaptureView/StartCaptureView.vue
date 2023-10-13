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
        <v-card-text>
          <v-text-field label="URL" v-model="url" />
          <v-text-field
            :label="$store.getters.message('app.test-result-name')"
            v-model="testResultName"
          ></v-text-field>
        </v-card-text>

        <v-card-subtitle>
          {{ $store.getters.message("config-view.device") }}
        </v-card-subtitle>

        <v-card-text>
          <v-select
            :label="$store.getters.message('config-view.platform')"
            :items="platformNames"
            :value="selectedPlatformName"
            @change="selectPlatform"
          ></v-select>

          <v-card class="pa-2 mb-4" outlined v-show="!isDeviceConfigDisabled">
            <v-card-text>
              <v-btn @click="updateDevices">{{
                $store.getters.message("config-view.update-device")
              }}</v-btn>
              <v-select
                :label="$store.getters.message('config-view.select-device')"
                :value="selectedDevice"
                @change="selectDevice"
                :items="devices"
                item-text="modelNumber"
                item-value="deviceName"
                :no-data-text="$store.getters.message('config-view.no-device')"
                return-object
              ></v-select>
              <v-text-field
                :label="$store.getters.message('config-view.os-version')"
                v-model="selectedDevice.osVersion"
                readonly
              ></v-text-field>
            </v-card-text>
          </v-card>

          <v-select
            :label="$store.getters.message('config-view.browser')"
            :items="browsers"
            :value="selectedBrowser"
            @change="selectBrowser"
          ></v-select>

          <number-field
            arrowOnly
            @updateNumberFieldValue="
              ({ value }) => updateWaitTimeForStartupReload(value)
            "
            :value="waitTimeForStartupReload"
            :maxValue="60"
            :minValue="0"
            :label="$store.getters.message('config-view.reload-setting')"
            :suffix="$store.getters.message('config-view.reload-suffix')"
          ></number-field>
        </v-card-text>
        <v-card-subtitle>
          {{ $store.getters.message("config-view.device") }}
        </v-card-subtitle>
        <v-card-text>
          <h4>{{ $store.getters.message("config-view.media-type") }}</h4>

          <v-radio-group
            :value="captureMediaSetting.mediaType"
            :disabled="isMediaTypeDisabled"
            @change="changeCaptureMediaType"
            class="py-0 my-0"
            row
            :hint="
              $store.getters.message('config-view.capture-media-config-hint')
            "
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

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </v-container>
</template>

<script lang="ts">
import NumberField from "@/components/molecules/NumberField.vue";
import {
  CaptureMediaSetting,
  DeviceSettings,
} from "@/lib/common/settings/Settings";
import { RootState } from "@/store";
import { Component, Vue } from "vue-property-decorator";
import ErrorMessageDialog from "../../common/ErrorMessageDialog.vue";
import RecordButton from "../expCapture/organisms/captureToolHeader/RecordButton.vue";
import RecordStartTrigger from "../../common/organisms/RecordStartTrigger.vue";

@Component({
  components: {
    "record-button": RecordButton,
    "number-field": NumberField,
    "error-message-dialog": ErrorMessageDialog,
    "record-start-trigger": RecordStartTrigger,
  },
})
export default class StartCaptureView extends Vue {
  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private url: string = "";
  private testResultName: string = "";

  private get isExecuteButtonDisabled() {
    return !this.url || !this.urlIsValid;
  }

  private get urlIsValid(): boolean {
    try {
      new URL(this.url);
      return true;
    } catch (error) {
      return false;
    }
  }
  private get isMediaTypeDisabled() {
    return (
      this.isCapturing || this.captureArch === "push" || this.platform !== "PC"
    );
  }

  private get config() {
    return (this.$store.state as RootState).projectSettings.config;
  }

  private get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  private get captureMediaSetting() {
    return this.config.captureMediaSetting;
  }

  private get captureArch() {
    return this.config.experimentalFeatureSetting.captureArch ?? "polling";
  }

  private get platform() {
    return (this.$store.state as RootState).deviceSettings.platformName;
  }

  private changeCaptureMediaType(mediaType: "image" | "video") {
    this.saveCaptureMediaSetting({ ...this.captureMediaSetting, mediaType });
  }

  private saveCaptureMediaSetting(captureMediaSetting: CaptureMediaSetting) {
    this.$store.dispatch("writeConfig", {
      config: { ...this.config, captureMediaSetting },
    });
  }

  private platformNames: DeviceSettings["platformName"][] = [
    "PC",
    "Android",
    "iOS",
  ];

  private browsers: DeviceSettings["browser"][] = [];

  private devices: {
    deviceName: string;
    modelNumber: string;
    osVersion: string;
  }[] = [];

  private get deviceSettings(): DeviceSettings | undefined {
    return (this.$store.state as RootState).deviceSettings;
  }

  private get selectedPlatformName() {
    return this.deviceSettings?.platformName ?? "PC";
  }

  private get selectedBrowser() {
    return this.deviceSettings?.browser ?? "Chrome";
  }

  private get selectedDevice(): {
    deviceName: string;
    modelNumber: string;
    osVersion: string;
  } {
    return (
      this.deviceSettings?.device ?? {
        deviceName: "",
        modelNumber: "",
        osVersion: "",
      }
    );
  }

  private get isDeviceConfigDisabled() {
    return this.selectedPlatformName === "PC";
  }

  private get waitTimeForStartupReload() {
    return this.deviceSettings?.waitTimeForStartupReload ?? 0;
  }

  created() {
    this.$store.dispatch("changeWindowTitle", {
      title: this.$store.getters.message(this.$route.meta?.title ?? ""),
    });

    this.browsers = [...this.collectBrowsers(this.selectedPlatformName)];
  }

  private async selectPlatform(platformName: DeviceSettings["platformName"]) {
    this.browsers = [...this.collectBrowsers(platformName)];
    const browser = this.browsers[0];

    this.devices = [...(await this.recognizeDevices(platformName))];

    await this.$store.dispatch("writeDeviceSettings", {
      config: {
        platformName,
        browser,
        device: this.getDefaultDevice(this.devices),
      },
    });
  }

  private collectBrowsers(
    platformName: DeviceSettings["platformName"]
  ): DeviceSettings["browser"][] {
    if (platformName === "Android") return ["Chrome"];
    if (platformName === "iOS") return ["Safari"];

    return ["Chrome", "Edge"];
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

  private async updateDevices() {
    try {
      this.devices = [
        ...(await this.recognizeDevices(this.selectedPlatformName)),
      ];

      await this.$store.dispatch("writeDeviceSettings", {
        config: {
          device: this.getDefaultDevice(this.devices),
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        this.errorMessageDialogOpened = true;
        this.errorMessage = error.message;

        return;
      }

      throw error;
    }
  }

  private async selectDevice(device: {
    deviceName: string;
    modelNumber: string;
    osVersion: string;
  }) {
    await this.$store.dispatch("writeDeviceSettings", {
      config: { device },
    });
  }

  private async updateWaitTimeForStartupReload(
    waitTimeForStartupReload: number
  ) {
    await this.$store.dispatch("writeDeviceSettings", {
      config: { waitTimeForStartupReload },
    });
  }

  private async selectBrowser(browser: string) {
    await this.$store.dispatch("writeDeviceSettings", {
      config: { browser },
    });
  }

  private async execute(onStart: () => void) {
    this.$store.commit("captureControl/setUrl", { url: this.url });
    this.$store.commit("captureControl/setTestResultName", {
      name: this.testResultName,
    });
    onStart();
  }
}
</script>
