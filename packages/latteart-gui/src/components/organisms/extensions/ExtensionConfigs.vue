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
  <h2 v-if="configs.length > 0" class="pt-8 pb-2">{{ $t("extension-configs.title") }}</h2>
  <v-expansion-panels v-model="extensionSettingPanels" multiple class="py-0">
    <v-expansion-panel v-for="config in configs" :key="config.name">
      <v-expansion-panel-title> {{ $t(config.title) }}</v-expansion-panel-title>
      <v-expansion-panel-text>
        <component :is="config.name" />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { extensions } from "@/extensions";
export default defineComponent({
  setup() {
    const configs = extensions.flatMap(({ components }) => components.configs ?? []);
    const extensionSettingPanels = ref<number[]>(configs.map((_, index) => index));

    return { configs, extensionSettingPanels };
  }
});
</script>
