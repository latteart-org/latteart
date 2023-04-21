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
  <v-dialog
    v-model="dialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-app-bar dark color="primary">
        <v-btn icon dark @click="close">
          <v-icon>close</v-icon>
        </v-btn>
        <v-app-bar-title>{{
          $store.getters.message("config-view.settings")
        }}</v-app-bar-title>
        <v-spacer></v-spacer>
      </v-app-bar>

      <v-container>
        <v-row>
          <v-col cols="12">
            <v-expansion-panels v-model="panel">
              <v-expansion-panel>
                <v-expansion-panel-header class="py-0">
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
                <v-expansion-panel-header class="py-0">
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
                <v-expansion-panel-header class="py-0">
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
                <v-expansion-panel-header class="py-0">
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
            </v-expansion-panels>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import CoverageConfig from "./CoverageConfig.vue";
import ScreenDefinitionConfig from "./ScreenDefinitionConfig.vue";
import { Component, Vue } from "vue-property-decorator";
import {
  ProjectSettings,
  CoverageSetting,
  ImageCompressionSetting,
  ScreenDefinitionSetting,
} from "@/lib/common/settings/Settings";
import {
  AutofillSetting,
  AutoOperationSetting,
} from "@/lib/operationHistory/types";
import { default as AutofillSettingComponent } from "./AutofillSetting.vue";
import { default as AutoOperationSettingComponent } from "./AutoOperationSetting.vue";
import { RootState } from "@/store";

@Component({
  components: {
    "coverage-config": CoverageConfig,
    "screen-definition-config": ScreenDefinitionConfig,
    "autofill-setting": AutofillSettingComponent,
    "auto-operation-setting": AutoOperationSettingComponent,
  },
})
export default class ConfigViewer extends Vue {
  private panel: null | number = null;

  private get config(): ProjectSettings["config"] {
    return this.$store.state.projectSettings.config;
  }

  private get includeTags(): string[] {
    return this.config?.coverage.include.tags ?? [];
  }
  private get defaultTagList(): string[] {
    return this.$store.state.projectSettings.defaultTagList;
  }

  private get dialog() {
    if (!this.$store.state.openedConfigViewer) {
      this.panel = null;
    }
    return this.$store.state.openedConfigViewer;
  }

  private set dialog(isOpen: boolean) {
    this.$store.commit("closeConfigViewer");
  }

  private get coverageOpened() {
    return this.panel === 0;
  }

  private get screenDefinitionSettingOpened() {
    return this.panel === 1;
  }

  private get autofillSettingOpened() {
    return this.panel === 2;
  }

  private get autoOperationSettingOpened() {
    return this.panel === 3;
  }

  private get screenDefinition(): ScreenDefinitionSetting {
    return (
      this.config.screenDefinition ?? {
        screenDefType: "title",
        conditionGroups: [],
      }
    );
  }

  private get autofillSetting(): AutofillSetting {
    const viewSettings = (this.$store.state as RootState).viewSettings;

    if (!this.config?.autofillSetting || !viewSettings?.autofill) {
      return {
        autoPopupRegistrationDialog: false,
        autoPopupSelectionDialog: false,
        conditionGroups: [],
      };
    }

    return { ...this.config.autofillSetting, ...viewSettings.autofill };
  }

  private get autoOperationSetting(): AutoOperationSetting {
    return (
      this.config?.autoOperationSetting ?? {
        conditionGroups: [],
      }
    );
  }

  private async close() {
    this.dialog = false;
  }

  private toBack() {
    this.$router.back();
  }

  private async saveConfig(config: {
    autofillSetting?: AutofillSetting;
    autoOperationSetting?: AutoOperationSetting;
    screenDefinition?: ScreenDefinitionSetting;
    coverage?: CoverageSetting;
    imageCompression?: ImageCompressionSetting;
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
