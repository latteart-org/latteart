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
  <v-layout fill-height justify-start>
    <v-flex pt-3 px-3>
      <p class="subheading">
        {{ $store.getters.message("config-view.target") }}
      </p>
      <v-layout row wrap>
        <v-flex xs12 pr-1 class="pb-18">
          <v-select
            :label="$store.getters.message('config-view.platform')"
            :items="platformNames"
            :value="selectedPlatformName"
            @change="selectPlatform"
          ></v-select>
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
          <v-expansion-panel v-model="panel" class="py-0">
            <v-expansion-panel-content>
              <template v-slot:header class="py-0">
                {{ $store.getters.message("config-view.setting-device") }}
              </template>
              <v-container>
                <v-btn
                  @click="updateDevices"
                  :disabled="isDisabledDeviceConfig"
                  >{{
                    $store.getters.message("config-view.update-device")
                  }}</v-btn
                >
                <v-select
                  :label="$store.getters.message('config-view.select-device')"
                  :value="selectedDevice"
                  @change="selectDevice"
                  :items="devices"
                  item-text="modelNumber"
                  item-value="deviceName"
                  :disabled="isDisabledDeviceConfig"
                  :no-data-text="
                    $store.getters.message('config-view.no-device')
                  "
                  return-object
                ></v-select>
                <v-text-field
                  :label="$store.getters.message('config-view.os-version')"
                  v-model="selectedDevice.osVersion"
                  :disabled="isDisabledDeviceConfig"
                  readonly
                ></v-text-field>
              </v-container>
            </v-expansion-panel-content>

            <v-expansion-panel-content>
              <template v-slot:header class="py-0">
                {{
                  $store.getters.message(
                    "config-view.setting-image-compression"
                  )
                }}
              </template>
              <image-compression-setting> </image-compression-setting>
            </v-expansion-panel-content>

            <v-expansion-panel-content v-if="configureCaptureSettings">
              <template v-slot:header class="py-0">
                {{
                  $store.getters.message("config-view.setting-inclusion-tags")
                }}
              </template>
              <coverage-setting :opened="coverageOpened"> </coverage-setting>
            </v-expansion-panel-content>

            <v-expansion-panel-content v-if="configureCaptureSettings">
              <template v-slot:header class="py-0">
                {{ $store.getters.message("config-view.setting-screen") }}
              </template>
              <screen-definition-setting> </screen-definition-setting>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-flex>
      </v-layout>
    </v-flex>

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import NumberField from "@/vue/molecules/NumberField.vue";
import { PlatformName, Browser } from "@/lib/common/enum/SettingsEnum";
import * as Util from "@/lib/common/util";
import CoverageSetting from "@/vue/pages/operationHistory/organisms/configViewer/CoverageSetting.vue";
import ScreenDefinitionSetting from "@/vue/pages/operationHistory/organisms/configViewer/ScreenDefinitionSetting.vue";
import ImageCompressionSetting from "@/vue/pages/operationHistory/organisms/configViewer/ImageCompressionSetting.vue";
import ErrorMessageDialog from "../../common/ErrorMessageDialog.vue";
@Component({
  components: {
    "number-field": NumberField,
    "coverage-setting": CoverageSetting,
    "screen-definition-setting": ScreenDefinitionSetting,
    "image-compression-setting": ImageCompressionSetting,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class ConfigView extends Vue {
  private errorMessageDialogOpened = false;
  private errorMessage = "";
  private panel: null | number = null;

  private platformNames: string[] = Util.getEnumValues(PlatformName);

  private browsers: string[] = [];

  private devices: {
    deviceName: string;
    modelNumber: string;
    osVersion: string;
  }[] = [];

  private get locale() {
    return this.$store.getters.getLocale();
  }

  @Watch("locale")
  private updateWindowTitle() {
    this.$store.dispatch("changeWindowTitle", {
      title: this.$store.getters.message("config-view.window-title"),
    });
  }

  private created() {
    this.updateWindowTitle();
    this.browsers = [...this.collectBrowsers(this.selectedPlatformName)];

    const testResultId = this.$route.query.testResultId as string;

    if (testResultId) {
      (async () => {
        try {
          if (this.$route.query.remoteRepository) {
            await this.$store.dispatch("connectRemoteUrl", {
              targetUrl: this.$route.query.remoteRepository,
            });

            await this.initialize();
          }

          await this.$store.dispatch("operationHistory/resume", {
            testResultId,
          });
        } catch (error) {
          if (error instanceof Error) {
            console.error(error);
            this.errorMessageDialogOpened = true;
            this.errorMessage = error.message;
          } else {
            throw error;
          }
        }
      })();
    }
  }

  private get coverageOpened() {
    return this.panel === 2;
  }

  private get otherThanWindows() {
    return this.selectedPlatformName !== this.platformNames[0];
  }

  private get selectedPlatformName(): string {
    return this.$store.state.captureControl.config.platformName;
  }

  private get selectedBrowser(): string {
    return this.$store.state.captureControl.config.browser;
  }

  private get selectedDevice(): {
    deviceName: string;
    modelNumber: string;
    osVersion: string;
  } {
    return this.$store.state.captureControl.config.device;
  }

  private get isDisabledDeviceConfig() {
    return this.selectedPlatformName === PlatformName.PC;
  }

  private get waitTimeForStartupReload() {
    return this.$store.state.captureControl.config.waitTimeForStartupReload;
  }

  private get configureCaptureSettings() {
    return this.$store.getters.getSetting("debug.configureCaptureSettings");
  }

  private async selectPlatform(platformName: string) {
    this.browsers = [...this.collectBrowsers(platformName)];
    const browser = this.browsers[0];

    this.devices = [...(await this.recognizeDevices(platformName))];

    await this.$store.dispatch("captureControl/writeDeviceSettings", {
      config: {
        platformName,
        browser,
        device: this.getDefaultDevice(this.devices),
      },
    });
  }

  private collectBrowsers(platformName: string) {
    if (platformName === PlatformName.Android) return [Browser.Chrome];
    if (platformName === PlatformName.iOS) return [Browser.Safari];

    return [Browser.Chrome, Browser.Edge];
  }

  private async selectBrowser(browser: string) {
    await this.$store.dispatch("captureControl/writeDeviceSettings", {
      config: { browser },
    });
  }

  private getDefaultDevice(
    devices: {
      deviceName: string;
      modelNumber: string;
      osVersion: string;
    }[]
  ) {
    console.log(devices);
    return devices.length > 0
      ? devices[0]
      : { deviceName: "", modelNumber: "", osVersion: "" };
  }

  private async updateDevices() {
    try {
      this.devices = [
        ...(await this.recognizeDevices(this.selectedPlatformName)),
      ];

      await this.$store.dispatch("captureControl/writeDeviceSettings", {
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

  private async selectDevice(device: {
    deviceName: string;
    modelNumber: string;
    osVersion: string;
  }) {
    await this.$store.dispatch("captureControl/writeDeviceSettings", {
      config: { device },
    });
  }

  private async updateWaitTimeForStartupReload(
    waitTimeForStartupReload: number
  ) {
    await this.$store.dispatch("captureControl/writeDeviceSettings", {
      config: { waitTimeForStartupReload },
    });
  }

  private async initialize(): Promise<void> {
    await this.$store.dispatch("operationHistory/readSettings");
    await this.$store.dispatch("testManagement/readDataFile");
  }
}
</script>

<style lang="sass" scoped>
.pb-18
  padding-bottom: 72px
</style>
