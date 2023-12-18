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
                    :label="store.getters.message('manage-header.locale')"
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
                      store.getters.message(
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
                      store.getters.message(
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
                    {{ store.getters.message("config-page.setting-screen") }}
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
                    {{ store.getters.message("config-page.setting-autofill") }}
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
                      store.getters.message(
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
                      store.getters.message(
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
                      store.getters.message(
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
      </v-row>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import NumberField from "@/components/molecules/NumberField.vue";
import CoverageConfig from "@/components/organisms/config/CoverageConfig.vue";
import ScreenDefinitionConfig from "@/components/organisms/config/ScreenDefinitionConfig.vue";
import CaptureMediaConfig from "@/components/organisms/config/CaptureMediaConfig.vue";
import {
  CoverageSetting,
  ScreenDefinitionSetting,
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
import CompareConfig from "@/components/organisms/config/CompareConfig.vue";
import ExperimentalFeatureConfig from "@/components/organisms/config/ExperimentalFeatureConfig.vue";
import RemoteAccessField from "@/components/organisms/config/RemoteAccessField.vue";
import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "@/store";
import { useRoute } from "vue-router/composables";
import { CaptureControlState } from "@/store/captureControl";

export default defineComponent({
  components: {
    "number-field": NumberField,
    "coverage-config": CoverageConfig,
    "screen-definition-config": ScreenDefinitionConfig,
    "capture-media-config": CaptureMediaConfig,
    "autofill-setting": AutofillSettingComponent,
    "compare-config": CompareConfig,
    "auto-operation-setting": AutoOperationSettingComponent,
    "experimental-feature-config": ExperimentalFeatureConfig,
    "remote-access-field": RemoteAccessField,
  },
  setup() {
    const store = useStore();
    const route = useRoute();

    const panels = ref<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]);

    const locales = ref<string[]>(["ja", "en"]);

    const initLocale = computed((): string => {
      return store.getters.getLocale();
    });

    const changeLocale = (locale: string): void => {
      store.dispatch("changeLocale", { locale });
    };

    const projectSettings = computed((): ProjectSettings | undefined => {
      return store.state.projectSettings;
    });

    const viewSettings = computed((): ViewSettings | undefined => {
      return store.state.viewSettings;
    });

    const isCapturing = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState)
        .isCapturing;
    });

    const isReplaying = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState)
        .isReplaying;
    });

    const locale = computed(() => {
      return store.getters.getLocale();
    });

    const captureMediaSetting = computed((): CaptureMediaSetting => {
      return (
        config.value?.captureMediaSetting ?? {
          mediaType: "image",
          imageCompression: { format: "png" },
        }
      );
    });

    const includeTags = computed((): string[] => {
      return config.value?.coverage.include.tags ?? [];
    });

    const defaultTagList = computed((): string[] => {
      return store.state.projectSettings.defaultTagList;
    });

    const screenDefinition = computed((): ScreenDefinitionSetting => {
      return (
        config.value?.screenDefinition ?? {
          screenDefType: "title",
          conditionGroups: [],
        }
      );
    });

    const autofillSetting = computed((): AutofillSetting => {
      if (!config.value?.autofillSetting || !viewSettings.value?.autofill) {
        return {
          autoPopupRegistrationDialog: false,
          autoPopupSelectionDialog: false,
          conditionGroups: [],
        };
      }

      return {
        ...config.value.autofillSetting,
        ...viewSettings.value.autofill,
      };
    });

    const autoOperationSetting = computed((): AutoOperationSetting => {
      return config.value?.autoOperationSetting ?? { conditionGroups: [] };
    });

    const testResultComparisonSetting = computed(
      (): TestResultComparisonSetting => {
        return store.state.projectSettings.config.testResultComparison;
      }
    );

    const experimentalFeatureSetting = computed(
      (): ExperimentalFeatureSetting => {
        return (
          config.value?.experimentalFeatureSetting ?? { captureArch: "polling" }
        );
      }
    );

    const updateWindowTitle = () => {
      store.dispatch("changeWindowTitle", {
        title: store.getters.message(route.meta?.title ?? ""),
      });
    };

    const config = computed(() => {
      return projectSettings.value?.config;
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

    const experimentalFeatureSettingOpened = computed(() => {
      return panels.value.includes(7);
    });

    const saveConfig = (config: {
      autofillSetting?: AutofillSetting;
      autoOperationSetting?: AutoOperationSetting;
      screenDefinition?: ScreenDefinitionSetting;
      coverage?: CoverageSetting;
      captureMediaSetting?: CaptureMediaSetting;
      testResultComparison?: TestResultComparisonSetting;
      experimentalFeatureSetting?: ExperimentalFeatureSetting;
    }) => {
      const projectConfig = {
        ...config,
        autofillSetting: config.autofillSetting
          ? { conditionGroups: config.autofillSetting.conditionGroups }
          : undefined,
      };
      store.dispatch("writeConfig", { config: projectConfig });

      if (config.autofillSetting) {
        store.dispatch("writeViewSettings", {
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
        store.commit("operationHistory/setCanUpdateModels", {
          canUpdateModels: true,
        });
      }
    };

    watch(locale, updateWindowTitle);

    (async () => {
      updateWindowTitle();

      await store.dispatch("readSettings");
      await store.dispatch("readViewSettings");
    })();

    return {
      store,
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
      experimentalFeatureSetting,
      captureMediaSettingOpened,
      coverageOpened,
      screenDefinitionSettingOpened,
      autofillSettingOpened,
      autoOperationSettingOpened,
      experimentalFeatureSettingOpened,
      saveConfig,
    };
  },
});
</script>

<style lang="sass" scoped>
.pb-18
  padding-bottom: 72px
</style>
