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
  <v-container fluid class="fill-height py-0">
    <v-row justify="start" align="center" @keydown="cancelKeydown">
      <v-col>
        <url-text-field single-line hide-details />
      </v-col>
      <v-col>
        <test-result-name-text-field single-line hide-details />
      </v-col>

      <record-button />
      <pause-button />
      <menu-button />
    </v-row>
  </v-container>
</template>

<script lang="ts">
import PauseButton from "./PauseButton.vue";
import RecordButton from "./RecordButton.vue";
import TestResultNameTextField from "./TestResultNameTextField.vue";
import URLTextField from "./URLTextField.vue";
import MenuButton from "./MenuButton.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    "url-text-field": URLTextField,
    "test-result-name-text-field": TestResultNameTextField,
    "record-button": RecordButton,
    "pause-button": PauseButton,
    "menu-button": MenuButton
  },
  setup() {
    const cancelKeydown = (event: Event) => {
      event.stopPropagation();
    };

    return {
      cancelKeydown
    };
  }
});
</script>
