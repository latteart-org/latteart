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
            v-model="selectedPlatformName"
          ></v-select>
          <v-select
            :label="$store.getters.message('config-view.browser')"
            :items="browsers"
            v-model="selectedBrowser"
          ></v-select>
          <number-field
            arrowOnly
            @updateNumberFieldValue="updateNumberFieldValue"
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
                  @click="connectDevices"
                  :disabled="isDisabledDeviceConfig"
                  >{{
                    $store.getters.message("config-view.update-device")
                  }}</v-btn
                >
                <v-select
                  :label="$store.getters.message('config-view.select-device')"
                  v-model="selectedDevice"
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

  private get browsers(): string[] {
    switch (this.selectedPlatformName) {
      case PlatformName.Android:
        return [Browser.Chrome];
      case PlatformName.iOS:
        return [Browser.Safari];
      default:
        return [Browser.Chrome];
    }
  }

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
  }

  private get coverageOpened() {
    return this.panel === 2;
  }

  private get otherThanWindows() {
    return this.selectedPlatformName !== this.platformNames[0];
  }

  private connectDevices() {
    (async () => {
      try {
        await this.$store.dispatch("captureControl/updateDevices", {
          platformName: this.selectedPlatformName,
        });
      } catch (error) {
        this.errorMessageDialogOpened = true;
        this.errorMessage = error.message;
      }
    })();
  }

  private get devices() {
    return this.$store.getters["captureControl/getDevices"]();
  }

  private get selectedPlatformName(): string {
    return this.$store.state.captureControl.config.platformName;
  }

  private set selectedPlatformName(platformName: string) {
    this.$store.commit("captureControl/setPlatformName", { platformName });
    this.selectedBrowser = this.browsers[0];
    this.connectDevices();
  }

  private get selectedBrowser(): string {
    return this.$store.state.captureControl.config.browser;
  }

  private set selectedBrowser(browser: string) {
    this.$store.commit("captureControl/setBrowser", { browser });
  }

  private get selectedDevice(): {
    deviceName: string;
    modelNumber: string;
    osVersion: string;
  } {
    return this.$store.state.captureControl.config.device;
  }

  private set selectedDevice(device: {
    deviceName: string;
    modelNumber: string;
    osVersion: string;
  }) {
    this.$store.commit("captureControl/setDevice", { device });
  }

  private get isDisabledDeviceConfig() {
    return this.selectedPlatformName === PlatformName.PC;
  }

  private get waitTimeForStartupReload() {
    return this.$store.state.captureControl.config.waitTimeForStartupReload;
  }

  private set waitTimeForStartupReload(waitTimeForStartupReload: number) {
    this.$store.commit("captureControl/setWaitTimeForStartupReload", {
      waitTimeForStartupReload,
    });
  }

  private updateNumberFieldValue(data: { id: string; value: number }) {
    this.waitTimeForStartupReload = data.value;
  }

  private get configureCaptureSettings() {
    return this.$store.getters.getSetting("debug.configureCaptureSettings");
  }
}
</script>

<style lang="sass" scoped>
.pb-18
  padding-bottom: 72px
</style>
