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
  <div>
    <v-menu offset-y>
      <template v-slot:activator="{ on }">
        <v-btn
          v-if="!isViewerMode"
          id="optionMenuButton"
          flat
          v-on="on"
          icon
          large
          >...</v-btn
        >
      </template>
      <v-list>
        <test-result-import-button />
        <test-tesult-export-button />
        <config-import-button />
        <config-export-button v-slot:default="slotProps">
          <v-list-tile
            @click="slotProps.obj.execute"
            :disabled="slotProps.obj.isDisabled"
          >
            <v-list-tile-title>{{
              $store.getters.message("config-io.export-config")
            }}</v-list-tile-title>
          </v-list-tile>
        </config-export-button>
        <generate-test-script-button />
        <replay-button />
        <screenshots-download-button v-slot:default="slotProps">
          <v-list-tile
            @click="slotProps.obj.execute"
            :disabled="slotProps.obj.isDisabled"
          >
            <v-list-tile-title>{{
              $store.getters.message("history-view.export-screenshots")
            }}</v-list-tile-title>
          </v-list-tile>
        </screenshots-download-button>
        <compare-history-button />
        <delete-test-result-button />
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import TestResultFileExportButton from "./TestResultFileExportButton.vue";
import ReplayHistoryButton from "./ReplayHistoryButton.vue";
import GenerateTestScriptButton from "./GenerateTestScriptButton.vue";
import TestResultFileImportButton from "./TestResultFileImportButton.vue";
import ScreenshotsDownloadButton from "@/components/pages/operationHistory/organisms/ScreenshotsDownloadButton.vue";
import DeleteTestResultButton from "./DeleteTestResultButton.vue";
import ConfigImportButton from "@/components/pages/common/ConfigImportButton.vue";
import ConfigExportButton from "@/components/pages/common/ConfigExportButton.vue";
import CompareHistoryButton from "./CompareHistoryButton.vue";

@Component({
  components: {
    "replay-button": ReplayHistoryButton,
    "test-tesult-export-button": TestResultFileExportButton,
    "generate-test-script-button": GenerateTestScriptButton,
    "test-result-import-button": TestResultFileImportButton,
    "screenshots-download-button": ScreenshotsDownloadButton,
    "delete-test-result-button": DeleteTestResultButton,
    "config-import-button": ConfigImportButton,
    "config-export-button": ConfigExportButton,
    "compare-history-button": CompareHistoryButton,
  },
})
export default class MenuButton extends Vue {
  private get isViewerMode() {
    return (this as any).$isViewerMode ? (this as any).$isViewerMode : false;
  }
}
</script>
