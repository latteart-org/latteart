<!--
 Copyright 2024 NTT Corporation.

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
  <v-container fluid class="pa-8">
    <v-row justify="start" class="fill-height">
      <v-col>
        <v-row>
          <v-col cols="12">
            <v-card class="pa-6">
              <v-card-text>
                <v-select
                  variant="underlined"
                  :label="$t('config-page.locale')"
                  :items="locales"
                  :model-value="initLocale"
                  @update:model-value="changeLocale"
                ></v-select>

                <remote-access-field color="primary" hide-details></remote-access-field>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-expansion-panels v-model="panels" multiple class="py-0">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  {{ $t("config-page.setting-image-compression") }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <capture-media-config
                    :capture-media-setting="captureMediaSetting"
                    :opened="captureMediaSettingOpened"
                    :is-capturing="isCapturing"
                    @save-config="saveUserSetting"
                  >
                  </capture-media-config>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title>
                  {{ $t("common.config-coverage-title") }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <coverage-config
                    :opened="coverageOpened"
                    :include-tags="includeTags"
                    :default-tag-list="defaultTagList"
                    @save-config="saveConfig"
                  >
                  </coverage-config>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title>
                  {{ $t("common.config-screen-def-title") }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <screen-definition-config
                    :opened="screenDefinitionSettingOpened"
                    :screen-definition="screenDefinition"
                    @save-config="saveConfig"
                  >
                  </screen-definition-config>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title>
                  {{ $t("config-page.setting-autofill") }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <autofill-setting
                    :opened="autofillSettingOpened"
                    :autofill-setting="autofillSetting"
                    @save-config="saveUserSetting"
                  >
                  </autofill-setting>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title>
                  {{ $t("config-page.setting-auto-operation") }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <auto-operation-setting
                    :opened="autoOperationSettingOpened"
                    :auto-operation-setting="autoOperationSetting"
                    @save-config="saveUserSetting"
                  >
                  </auto-operation-setting>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title>
                  {{ $t("config-page.setting-test-result-comparison") }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <compare-config
                    :tags="defaultTagList"
                    :setting="testResultComparisonSetting"
                    @save-config="saveConfig"
                  >
                  </compare-config>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title>
                  {{ $t("config-page.setting-test-hint") }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <test-hint-config
                    :test-hint-setting="testHintSetting"
                    :opened="testHintSettingOpened"
                    @save-view-config="saveUserSetting"
                  >
                  </test-hint-config>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title>
                  {{ $t("config-page.setting-experimental-features") }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <experimental-feature-config
                    :experimental-feature-setting="experimentalFeatureSetting"
                    :opened="experimentalFeatureSettingOpened"
                    :is-capturing="isCapturing"
                    :is-replaying="isReplaying"
                    @save-config="saveConfig"
                  >
                  </experimental-feature-config>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <extension-configs />
            </v-expansion-panels>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import CoverageConfig from "@/components/organisms/config/CoverageConfig.vue";
import ScreenDefinitionConfig from "@/components/organisms/config/ScreenDefinitionConfig.vue";
import CaptureMediaConfig from "@/components/organisms/config/CaptureMediaConfig.vue";
import {
  type CoverageSetting,
  type ScreenDefinitionSetting,
  type ProjectSettings,
  type TestResultComparisonSetting,
  type CaptureMediaSetting,
  type TestHintSetting,
  type ExperimentalFeatureSetting,
  type UserSettings,
  type AutofillSetting,
  type AutoOperationSetting
} from "@/lib/common/settings/Settings";
import { default as AutofillSettingComponent } from "@/components/organisms/config/AutofillConfig.vue";
import { default as AutoOperationSettingComponent } from "@/components/organisms/config/AutoOperationConfig.vue";
import CompareConfig from "@/components/organisms/config/CompareConfig.vue";
import ExperimentalFeatureConfig from "@/components/organisms/config/ExperimentalFeatureConfig.vue";
import RemoteAccessField from "@/components/organisms/config/RemoteAccessField.vue";
import { computed, defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import ExtensionConfigs from "@/components/organisms/extensions/ExtensionConfigs.vue";
import TestHintConfig from "@/components/organisms/config/TestHintConfig.vue";

export default defineComponent({
  components: {
    "coverage-config": CoverageConfig,
    "screen-definition-config": ScreenDefinitionConfig,
    "capture-media-config": CaptureMediaConfig,
    "autofill-setting": AutofillSettingComponent,
    "compare-config": CompareConfig,
    "auto-operation-setting": AutoOperationSettingComponent,
    "experimental-feature-config": ExperimentalFeatureConfig,
    "remote-access-field": RemoteAccessField,
    "extension-configs": ExtensionConfigs,
    "test-hint-config": TestHintConfig
  },
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();

    const route = useRoute();

    const panels = ref<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    const locales = ref<string[]>(["ja", "en"]);

    const initLocale = computed((): string => {
      return rootStore.getLocale();
    });

    const changeLocale = (locale: string): void => {
      rootStore.changeLocale({ locale });
    };

    const projectSettings = computed((): ProjectSettings | undefined => {
      return rootStore.projectSettings;
    });

    const userSettings = computed((): UserSettings | undefined => {
      return rootStore.userSettings;
    });

    const isCapturing = computed((): boolean => {
      return captureControlStore.isCapturing;
    });

    const isReplaying = computed((): boolean => {
      return captureControlStore.isReplaying;
    });

    const locale = computed(() => {
      return rootStore.getLocale();
    });

    const captureMediaSetting = computed((): CaptureMediaSetting => {
      return (
        captureMediaSettings.value ?? {
          mediaType: "image",
          imageCompression: { format: "png" }
        }
      );
    });

    const includeTags = computed((): string[] => {
      return config.value?.coverage.include.tags ?? [];
    });

    const defaultTagList = computed((): string[] => {
      return rootStore.projectSettings.defaultTagList;
    });

    const screenDefinition = computed((): ScreenDefinitionSetting => {
      return (
        config.value?.screenDefinition ?? {
          screenDefType: "title",
          conditionGroups: []
        }
      );
    });

    const autofillSetting = computed((): AutofillSetting => {
      if (!userSettings.value?.autofillSetting) {
        return {
          autoPopupRegistrationDialog: true,
          autoPopupSelectionDialog: true,
          conditionGroups: []
        };
      }

      return {
        ...userSettings.value.autofillSetting
      };
    });

    const autoOperationSetting = computed((): AutoOperationSetting => {
      return userSettings.value?.autoOperationSetting ?? { conditionGroups: [] };
    });

    const testResultComparisonSetting = computed((): TestResultComparisonSetting => {
      return rootStore.projectSettings.config.testResultComparison;
    });

    const testHintSetting = computed((): TestHintSetting => {
      if (!userSettings.value?.testHintSetting) {
        return {
          commentMatching: {
            target: "all",
            extraWords: [],
            excludedWords: []
          },
          defaultSearchSeconds: 30
        };
      }

      return {
        ...userSettings.value.testHintSetting
      };
    });

    const experimentalFeatureSetting = computed((): ExperimentalFeatureSetting => {
      return config.value?.experimentalFeatureSetting ?? { captureArch: "polling" };
    });

    const updateWindowTitle = () => {
      rootStore.changeWindowTitle({
        title: rootStore.message(route.meta?.title ?? "")
      });
    };

    const config = computed(() => {
      return projectSettings.value?.config;
    });

    const captureMediaSettings = computed(() => {
      return rootStore.userSettings.captureMediaSetting;
    });

    const captureMediaSettingOpened = computed(() => {
      return panels.value.includes(1);
    });

    const coverageOpened = computed(() => {
      return panels.value.includes(2);
    });

    const screenDefinitionSettingOpened = computed(() => {
      return panels.value.includes(3);
    });

    const autofillSettingOpened = computed(() => {
      return panels.value.includes(4);
    });

    const autoOperationSettingOpened = computed(() => {
      return panels.value.includes(5);
    });

    const testHintSettingOpened = computed(() => {
      return panels.value.includes(7);
    });

    const experimentalFeatureSettingOpened = computed(() => {
      return panels.value.includes(8);
    });

    const saveUserSetting = (userSettings: {
      autofillSetting?: AutofillSetting;
      autoOperationSetting?: AutoOperationSetting;
      captureMediaSetting?: CaptureMediaSetting;
      testHintSetting?: TestHintSetting;
    }) => {
      rootStore.writeUserSettings({ userSettings });
    };

    const saveConfig = (config: {
      screenDefinition?: ScreenDefinitionSetting;
      coverage?: CoverageSetting;
      captureMediaSetting?: CaptureMediaSetting;
      testResultComparison?: TestResultComparisonSetting;
      experimentalFeatureSetting?: ExperimentalFeatureSetting;
    }) => {
      const projectConfig = {
        ...config
      };
      rootStore.writeConfig({ config: projectConfig });

      if (config.screenDefinition || config.coverage) {
        operationHistoryStore.canUpdateModels = true;
      }
    };

    watch(locale, updateWindowTitle);

    (async () => {
      updateWindowTitle();

      await rootStore.readSettings();
    })();

    return {
      panels,
      locales,
      initLocale,
      changeLocale,
      isCapturing,
      isReplaying,
      captureMediaSetting,
      includeTags,
      defaultTagList,
      screenDefinition,
      autofillSetting,
      autoOperationSetting,
      testResultComparisonSetting,
      testHintSetting,
      experimentalFeatureSetting,
      captureMediaSettingOpened,
      coverageOpened,
      screenDefinitionSettingOpened,
      autofillSettingOpened,
      autoOperationSettingOpened,
      testHintSettingOpened,
      experimentalFeatureSettingOpened,
      saveConfig,
      saveUserSetting
    };
  }
});
</script>

<style lang="sass" scoped>
.pb-18
  padding-bottom: 72px
</style>
