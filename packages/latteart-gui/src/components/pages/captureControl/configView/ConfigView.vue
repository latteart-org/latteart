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
  <v-row justify="start" class="fill-height">
    <v-col class="pt-3 px-3">
      <p class="subtitle-1">
        {{ $store.getters.message("config-view.target") }}
      </p>
      <v-row>
        <v-col cols="12" class="pb-18 pr-1">
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
          <v-expansion-panels v-model="panel" class="py-0">
            <v-expansion-panel>
              <v-expansion-panel-header>
                {{ $store.getters.message("config-view.setting-device") }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
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
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header>
                {{
                  $store.getters.message(
                    "config-view.setting-image-compression"
                  )
                }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <image-compression-config
                  :imageCompression="imageCompression"
                  :opened="imageCompressionSettingOpened"
                  @save-config="saveConfig"
                >
                </image-compression-config>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header>
                {{
                  $store.getters.message("config-view.setting-inclusion-tags")
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
                {{ $store.getters.message("config-view.setting-screen") }}
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
                {{ $store.getters.message("config-view.setting-autofill") }}
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
                  $store.getters.message("config-view.setting-auto-operation")
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
                    "config-view.setting-test-result-comparison"
                  )
                }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <compare-setting
                  :tags="defaultTagList"
                  :setting="testResultComparisonSetting"
                  @save-config="saveConfig"
                >
                </compare-setting>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header>{{
                $store.getters.message(
                  "config-view.setting-misoperation-prevention"
                )
              }}</v-expansion-panel-header>
              <v-expansion-panel-content>
                <misoperation-prevention-config
                  :misoperationPrevention="misoperationPrevention"
                  :opened="misoperationPreventionSettingOpened"
                  @save-config="saveConfig"
                ></misoperation-prevention-config>
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
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import NumberField from "@/components/molecules/NumberField.vue";
import CoverageConfig from "@/components/pages/operationHistory/organisms/configViewer/CoverageConfig.vue";
import ScreenDefinitionConfig from "@/components/pages/operationHistory/organisms/configViewer/ScreenDefinitionConfig.vue";
import ImageCompressionConfig from "@/components/pages/operationHistory/organisms/configViewer/ImageCompressionConfig.vue";
import ErrorMessageDialog from "../../common/ErrorMessageDialog.vue";
import {
  CoverageSetting,
  ImageCompressionSetting,
  ScreenDefinitionSetting,
  DeviceSettings,
  ProjectSettings,
  ViewSettings,
  TestResultComparisonSetting,
  MisoperationPreventionSetting,
} from "@/lib/common/settings/Settings";
import { default as AutofillSettingComponent } from "../../operationHistory/organisms/configViewer/AutofillSetting.vue";
import {
  AutofillSetting,
  AutoOperationSetting,
} from "@/lib/operationHistory/types";
import { default as AutoOperationSettingComponent } from "../../operationHistory/organisms/configViewer/AutoOperationSetting.vue";
import { RootState } from "@/store";
import CompareSetting from "../../operationHistory/organisms/configViewer/CompareSetting.vue";
import MisoperationPreventionConfig from "../../operationHistory/organisms/configViewer/MisoperationPreventionConfig.vue";

@Component({
  components: {
    "number-field": NumberField,
    "coverage-config": CoverageConfig,
    "screen-definition-config": ScreenDefinitionConfig,
    "image-compression-config": ImageCompressionConfig,
    "autofill-setting": AutofillSettingComponent,
    "compare-setting": CompareSetting,
    "auto-operation-setting": AutoOperationSettingComponent,
    "error-message-dialog": ErrorMessageDialog,
    "misoperation-prevention-config": MisoperationPreventionConfig,
  },
})
export default class ConfigView extends Vue {
  private errorMessageDialogOpened = false;
  private errorMessage = "";
  private panel: null | number = null;

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

  private get locale() {
    return this.$store.getters.getLocale();
  }

  private get imageCompression(): ImageCompressionSetting {
    return this.config?.imageCompression ?? { format: "png" };
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

  private get misoperationPrevention(): MisoperationPreventionSetting {
    return (
      this.config?.misoperationPrevention ?? {
        isShieldEnabled: true,
      }
    );
  }

  @Watch("locale")
  private updateWindowTitle() {
    this.$store.dispatch("changeWindowTitle", {
      title: this.$store.getters.message("config-view.window-title"),
    });
  }

  private get config() {
    return this.projectSettings?.config;
  }

  private async created() {
    this.updateWindowTitle();
    this.browsers = [...this.collectBrowsers(this.selectedPlatformName)];

    const testResultId = this.$route.query.testResultId as string;

    if (testResultId) {
      try {
        if (this.$route.query.repository) {
          await this.$store.dispatch("connectRepository", {
            targetUrl: this.$route.query.repository,
          });

          await this.$store.dispatch("testManagement/readProject");
        }

        await this.loadTestResults(testResultId);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error);
          this.errorMessageDialogOpened = true;
          this.errorMessage = error.message;
        } else {
          throw error;
        }
      }
    }
    await this.$store.dispatch("readSettings");
    await this.$store.dispatch("readViewSettings");
  }

  private async loadTestResults(...testResultIds: string[]) {
    try {
      await this.$store.dispatch("operationHistory/loadTestResultSummaries", {
        testResultIds,
      });

      await this.$store.dispatch("operationHistory/loadTestResult", {
        testResultId: testResultIds[0],
      });

      this.$store.commit("operationHistory/setCanUpdateModels", {
        setCanUpdateModels: false,
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
  }

  private get imageCompressionSettingOpened() {
    return this.panel === 1;
  }

  private get coverageOpened() {
    return this.panel === 2;
  }

  private get screenDefinitionSettingOpened() {
    return this.panel === 3;
  }

  private get autofillSettingOpened() {
    return this.panel === 4;
  }

  private get autoOperationSettingOpened() {
    return this.panel === 5;
  }

  private get misoperationPreventionSettingOpened() {
    return this.panel === 7;
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
    imageCompression?: ImageCompressionSetting;
    testResultComparison?: TestResultComparisonSetting;
    misoperationPrevention?: MisoperationPreventionSetting;
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

    if (config.misoperationPrevention && this.isCapturing) {
      this.$store.dispatch("captureControl/setShieldEnabled", {
        isShieldEnabled: config.misoperationPrevention.isShieldEnabled,
      });
    }
  }
}
</script>

<style lang="sass" scoped>
.pb-18
  padding-bottom: 72px
</style>
