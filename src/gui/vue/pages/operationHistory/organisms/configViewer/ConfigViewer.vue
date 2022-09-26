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
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="close">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>{{
          $store.getters.message("config-view.settings")
        }}</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>

      <v-container grid-list-md text-xs-center>
        <v-layout row wrap>
          <v-flex xs12>
            <v-expansion-panel v-model="panel">
              <v-expansion-panel-content>
                <template v-slot:header class="py-0">
                  {{
                    $store.getters.message("config-view.setting-inclusion-tags")
                  }}
                </template>
                <coverage-setting
                  :opened="coverageOpened"
                  :include-tags="includeTags"
                  :default-tag-list="defaultTagList"
                  @save-config="saveConfig"
                >
                </coverage-setting>
              </v-expansion-panel-content>
              <v-expansion-panel-content>
                <template v-slot:header class="py-0">
                  {{ $store.getters.message("config-view.setting-screen") }}
                </template>
                <screen-definition-setting
                  :screenDefinition="screenDefinition"
                  @save-config="saveConfig"
                >
                </screen-definition-setting>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import CoverageSetting from "./CoverageSetting.vue";
import ScreenDefinitionSetting from "./ScreenDefinitionSetting.vue";
import { Component, Vue } from "vue-property-decorator";
import Settings, {
  Coverage,
  ImageCompression,
  ScreenDefinition,
} from "@/lib/common/settings/Settings";
import { AutofillSetting } from "@/lib/operationHistory/types";
import { ScreenDefType } from "@/lib/common/enum/SettingsEnum";

@Component({
  components: {
    "coverage-setting": CoverageSetting,
    "screen-definition-setting": ScreenDefinitionSetting,
  },
})
export default class ConfigViewer extends Vue {
  private panel: null | number = null;
  private settings: Settings | null = null;

  private async created() {
    this.settings = await this.$store.dispatch("operationHistory/fetchConfig");
  }

  private get includeTags(): string[] {
    return this.settings?.config.coverage.include.tags ?? [];
  }
  private get defaultTagList(): string[] {
    return this.$store.state.operationHistory.defaultTagList;
  }

  private get dialog() {
    return this.$store.state.openedConfigViewer;
  }

  private set dialog(isOpen: boolean) {
    this.$store.commit("closeConfigViewer");
  }

  private get coverageOpened() {
    return this.panel === 0;
  }

  private get screenDefinition(): ScreenDefinition {
    return (
      this.settings?.config.screenDefinition ?? {
        screenDefType: ScreenDefType.Title,
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
    screenDefinition?: ScreenDefinition;
    coverage?: Coverage;
    imageCompression?: ImageCompression;
  }) {
    await this.$store.dispatch("operationHistory/writeSettings", { config });

    if (config.screenDefinition || config.coverage) {
      this.$store.commit("operationHistory/setCanUpdateModels", {
        canUpdateModels: true,
      });
    }
  }
}
</script>
