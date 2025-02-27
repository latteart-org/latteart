<!--
 Copyright 2025 NTT Corporation.

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
    <v-menu :close-on-content-click="false" persistent>
      <template #activator="{ props }">
        <v-btn
          id="optionFooterMenuButton"
          :disabled="isDisabled"
          variant="text"
          v-bind="props"
          icon="menu"
          class="ml-2"
          @click="changeOpenedFlag"
        />
      </template>
      <v-list>
        <run-auto-operation-button />
        <autofill-button />
        <test-hint-search-button />
        <extension-menus />
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import RunAutoOperationButton from "./RunAutoOperationButton.vue";
import AutofillButton from "./AutofillButton.vue";
import TestHintSearchButton from "./TestHintSearchButton.vue";
import ExtensionMenus from "../extensions/ExtensionMenus.vue";
import { useCaptureControlStore } from "@/stores/captureControl";

export default defineComponent({
  components: {
    "run-auto-operation-button": RunAutoOperationButton,
    "autofill-button": AutofillButton,
    "test-hint-search-button": TestHintSearchButton,
    "extension-menus": ExtensionMenus
  },
  setup() {
    const captureControlStore = useCaptureControlStore();

    const opened = ref(false);

    const isDisabled = computed((): boolean => {
      return (captureControlStore.isReplaying || captureControlStore.isRunning) && opened.value;
    });

    const changeOpenedFlag = () => {
      opened.value = opened.value ? false : true;
    };

    return { isDisabled, changeOpenedFlag };
  }
});
</script>
