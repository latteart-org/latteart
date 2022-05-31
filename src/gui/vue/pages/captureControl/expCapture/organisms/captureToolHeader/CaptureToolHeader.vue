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
  <v-layout justify-start align-center row>
    <url-text-field />
    <test-result-name-text-field />

    <div>
      <v-layout>
        <record-button />
        <pause-button />
        <clear-history-button />
        <load-history-button />
        <test-result-file-import-button />
        <generate-test-script-button />
        <test-result-file-export-button />
        <replay-history-button />
      </v-layout>
    </div>

    <v-flex shrink pa-1 pl-3>
      <locale-select-box />
    </v-flex>

    <remote-access-field color="inherit" />
  </v-layout>
</template>

<script lang="ts">
import RemoteAccessField from "@/vue/pages/common/organisms/RemoteAccessField.vue";
import { Component, Vue } from "vue-property-decorator";
import ClearHistoryButton from "./ClearHistoryButton.vue";
import GenerateTestScriptButton from "./GenerateTestScriptButton.vue";
import LoadHistoryButton from "./LoadHistoryButton.vue";
import LocaleSelectBox from "./LocaleSelectBox.vue";
import PauseButton from "./PauseButton.vue";
import RecordButton from "./RecordButton.vue";
import ReplayHistoryButton from "./ReplayHistoryButton.vue";
import TestResultFileExportButton from "./TestResultFileExportButton.vue";
import TestResultFileImportButton from "./TestResultFileImportButton.vue";
import TestResultNameTextField from "./TestResultNameTextField.vue";
import URLTextField from "./URLTextField.vue";

@Component({
  components: {
    "url-text-field": URLTextField,
    "test-result-name-text-field": TestResultNameTextField,
    "record-button": RecordButton,
    "pause-button": PauseButton,
    "clear-history-button": ClearHistoryButton,
    "load-history-button": LoadHistoryButton,
    "test-result-file-import-button": TestResultFileImportButton,
    "generate-test-script-button": GenerateTestScriptButton,
    "test-result-file-export-button": TestResultFileExportButton,
    "replay-history-button": ReplayHistoryButton,
    "locale-select-box": LocaleSelectBox,
    "remote-access-field": RemoteAccessField,
  },
})
export default class CaptureToolHeader extends Vue {}
</script>
