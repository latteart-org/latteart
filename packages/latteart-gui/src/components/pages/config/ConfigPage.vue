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
      <v-row justify="start" class="fill-height">
        <v-col>
          <v-row>
            <v-col cols="12">
              <v-card class="pa-6">
                <v-card-text>
                  <v-select
                    :label="$store.getters.message('manage-header.locale')"
                    :items="locales"
                    :value="initLocale"
                    v-on:change="changeLocale"
                  ></v-select>

                  <remote-access-field
                    color="primary"
                    hide-details
                  ></remote-access-field>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-expansion-panels multiple v-model="panels" class="py-0">
                <v-expansion-panel>
                  <v-expansion-panel-header>
                    {{
                      $store.getters.message(
                        "config-page.setting-image-compression"
                      )
                    }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <capture-media-config
                      :captureMediaSetting="captureMediaSetting"
                      :opened="captureMediaSettingOpened"
                      :isCapturing="isCapturing"
                      @save-config="saveConfig"
                    >
                    </capture-media-config>
                  </v-expansion-panel-content>
                </v-expansion-panel>

                <v-expansion-panel>
                  <v-expansion-panel-header>
                    {{
                      $store.getters.message(
                        "config-page.setting-inclusion-tags"
                      )
                    }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <coverage-config
                      :opened="coverageOpened"
                      :include-tags="includeTags"
                      :default-tag-list="defaultTagList"
                      @save-config="saveConfig"
                    >
                    </coverage-config>
                  </v-expansion-panel-content>
                </v-expansion-panel>

                <v-expansion-panel>
                  <v-expansion-panel-header>
                    {{ $store.getters.message("config-page.setting-screen") }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <screen-definition-config
                      :opened="screenDefinitionSettingOpened"
                      :screenDefinition="screenDefinition"
                      @save-config="saveConfig"
                    >
                    </screen-definition-config>
                  </v-expansion-panel-content>
                </v-expansion-panel>

                <v-expansion-panel>
                  <v-expansion-panel-header>
                    {{ $store.getters.message("config-page.setting-autofill") }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <autofill-setting
                      :opened="autofillSettingOpened"
                      :autofillSetting="autofillSetting"
                      @save-config="saveConfig"
                    >
                    </autofill-setting>
                  </v-expansion-panel-content>
                </v-expansion-panel>

                <v-expansion-panel>
                  <v-expansion-panel-header>
                    {{
                      $store.getters.message(
                        "config-page.setting-auto-operation"
                      )
                    }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <auto-operation-setting
                      :opened="autoOperationSettingOpened"
                      :autoOperationSetting="autoOperationSetting"
                      @save-config="saveConfig"
                    >
                    </auto-operation-setting>
                  </v-expansion-panel-content>
                </v-expansion-panel>

                <v-expansion-panel>
                  <v-expansion-panel-header>
                    {{
                      $store.getters.message(
                        "config-page.setting-test-result-comparison"
                      )
                    }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <compare-config
                      :tags="defaultTagList"
                      :setting="testResultComparisonSetting"
                      @save-config="saveConfig"
                    >
                    </compare-config>
                  </v-expansion-panel-content>
                </v-expansion-panel>

                <v-expansion-panel>
                  <v-expansion-panel-header>
                    {{
                      $store.getters.message(
                        "config-page.setting-experimental-features"
                      )
                    }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <experimental-feature-config
                      :experimentalFeatureSetting="experimentalFeatureSetting"
                      :opened="experimentalFeatureSettingOpened"
                      :isCapturing="isCapturing"
                      :isReplaying="isReplaying"
                      @save-config="saveConfig"
                    >
                    </experimental-feature-config>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-col>

        <error-message-dialog
          :opened="errorMessageDialogOpened"
          :message="errorMessage"
          @close="errorMessageDialogOpened = false"
        />
      </v-row>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import NumberField from "@/components/molecules/NumberField.vue";
import CoverageConfig from "@/components/organisms/config/CoverageConfig.vue";
import ScreenDefinitionConfig from "@/components/organisms/config/ScreenDefinitionConfig.vue";
import CaptureMediaConfig from "@/components/organisms/config/CaptureMediaConfig.vue";
import ErrorMessageDialog from "../../molecules/ErrorMessageDialog.vue";
import {
  CoverageSetting,
  ScreenDefinitionSetting,
  DeviceSettings,
  ProjectSettings,
  ViewSettings,
  TestResultComparisonSetting,
  CaptureMediaSetting,
  ExperimentalFeatureSetting,
} from "@/lib/common/settings/Settings";
import { default as AutofillSettingComponent } from "@/components/organisms/config/AutofillConfig.vue";
import {
  AutofillSetting,
  AutoOperationSetting,
} from "@/lib/operationHistory/types";
import { default as AutoOperationSettingComponent } from "@/components/organisms/config/AutoOperationConfig.vue";
import { RootState } from "@/store";
import CompareConfig from "@/components/organisms/config/CompareConfig.vue";
import ExperimentalFeatureConfig from "@/components/organisms/config/ExperimentalFeatureConfig.vue";
import RemoteAccessField from "@/components/organisms/config/RemoteAccessField.vue";

@Component({
  components: {
    "number-field": NumberField,
    "coverage-config": CoverageConfig,
    "screen-definition-config": ScreenDefinitionConfig,
    "capture-media-config": CaptureMediaConfig,
    "autofill-setting": AutofillSettingComponent,
    "compare-config": CompareConfig,
    "auto-operation-setting": AutoOperationSettingComponent,
    "experimental-feature-config": ExperimentalFeatureConfig,
    "error-message-dialog": ErrorMessageDialog,
    "remote-access-field": RemoteAccessField,
  },
})
export default class ConfigPage extends Vue {
  private errorMessageDialogOpened = false;
  private errorMessage = "";
  private panels: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  public locales: string[] = ["ja", "en"];

  public get initLocale(): string {
    return this.$store.getters.getLocale();
  }

  public changeLocale(locale: string): void {
    this.$store.dispatch("changeLocale", { locale });
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

  private get projectSettings(): ProjectSettings | undefined {
    return (this.$store.state as RootState).projectSettings;
  }

  private get viewSettings(): ViewSettings | undefined {
    return (this.$store.state as RootState).viewSettings;
  }

  private get deviceSettings(): DeviceSettings | undefined {
    return (this.$store.state as RootState).deviceSettings;
  }

  private get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  private get isReplaying(): boolean {
    return this.$store.state.captureControl.isReplaying;
  }

  private get locale() {
    return this.$store.getters.getLocale();
  }

  private get captureMediaSetting(): CaptureMediaSetting {
    return (
      this.config?.captureMediaSetting ?? {
        mediaType: "image",
        imageCompression: { format: "png" },
      }
    );
  }

  private get includeTags(): string[] {
    return this.config?.coverage.include.tags ?? [];
  }

  private get defaultTagList(): string[] {
    return this.$store.state.projectSettings.defaultTagList;
  }

  private get screenDefinition(): ScreenDefinitionSetting {
    return (
      this.config?.screenDefinition ?? {
        screenDefType: "title",
        conditionGroups: [],
      }
    );
  }

  private get autofillSetting(): AutofillSetting {
    if (!this.config?.autofillSetting || !this.viewSettings?.autofill) {
      return {
        autoPopupRegistrationDialog: false,
        autoPopupSelectionDialog: false,
        conditionGroups: [],
      };
    }

    return { ...this.config.autofillSetting, ...this.viewSettings.autofill };
  }

  private get autoOperationSetting(): AutoOperationSetting {
    return (
      this.config?.autoOperationSetting ?? {
        conditionGroups: [],
      }
    );
  }

  private get testResultComparisonSetting(): TestResultComparisonSetting {
    return (this.$store.state as RootState).projectSettings.config
      .testResultComparison;
  }

  private get experimentalFeatureSetting(): ExperimentalFeatureSetting {
    return (
      this.config?.experimentalFeatureSetting ?? { captureArch: "polling" }
    );
  }

  @Watch("locale")
  private updateWindowTitle() {
    this.$store.dispatch("changeWindowTitle", {
      title: this.$store.getters.message(this.$route.meta?.title ?? ""),
    });
  }

  private get config() {
    return this.projectSettings?.config;
  }

  private async created() {
    this.updateWindowTitle();
    this.browsers = [...this.collectBrowsers(this.selectedPlatformName)];

    await this.$store.dispatch("readSettings");
    await this.$store.dispatch("readViewSettings");
  }

  private get captureMediaSettingOpened() {
    return this.panels.includes(1);
  }

  private get coverageOpened() {
    return this.panels.includes(2);
  }

  private get screenDefinitionSettingOpened() {
    return this.panels.includes(3);
  }

  private get autofillSettingOpened() {
    return this.panels.includes(4);
  }

  private get autoOperationSettingOpened() {
    return this.panels.includes(5);
  }

  private get experimentalFeatureSettingOpened() {
    return this.panels.includes(7);
  }

  private get otherThanWindows() {
    return this.selectedPlatformName !== this.platformNames[0];
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

  private get isDisabledDeviceConfig() {
    return this.selectedPlatformName === "PC";
  }

  private get waitTimeForStartupReload() {
    return this.deviceSettings?.waitTimeForStartupReload ?? 0;
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

  private async selectBrowser(browser: string) {
    await this.$store.dispatch("writeDeviceSettings", {
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

  private saveConfig(config: {
    autofillSetting?: AutofillSetting;
    autoOperationSetting?: AutoOperationSetting;
    screenDefinition?: ScreenDefinitionSetting;
    coverage?: CoverageSetting;
    captureMediaSetting?: CaptureMediaSetting;
    testResultComparison?: TestResultComparisonSetting;
    experimentalFeatureSetting?: ExperimentalFeatureSetting;
  }) {
    const projectConfig = {
      ...config,
      autofillSetting: config.autofillSetting
        ? {
            conditionGroups: config.autofillSetting.conditionGroups,
          }
        : undefined,
    };
    this.$store.dispatch("writeConfig", {
      config: projectConfig,
    });

    if (config.autofillSetting) {
      this.$store.dispatch("writeViewSettings", {
        viewSettings: {
          autofill: {
            autoPopupRegistrationDialog:
              config.autofillSetting.autoPopupRegistrationDialog,
            autoPopupSelectionDialog:
              config.autofillSetting.autoPopupSelectionDialog,
          },
        },
      });
    }

    if (config.screenDefinition || config.coverage) {
      this.$store.commit("operationHistory/setCanUpdateModels", {
        canUpdateModels: true,
      });
    }
  }
}
</script>

<style lang="sass" scoped>
.pb-18
  padding-bottom: 72px
</style>
