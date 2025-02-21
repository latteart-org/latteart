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
  <v-card class="pa-8" variant="flat" disabled>
    <v-row justify="start" class="fill-height">
      <v-col>
        <v-row>
          <v-col cols="12">
            <v-expansion-panels v-model="panels" multiple class="py-0">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  {{ $t("common.config-coverage-title") }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <coverage-config
                    :opened="coverageConfigOpened"
                    :include-tags="includeTags"
                    :default-tag-list="defaultTagList"
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
                    :opened="screenDefinitionConfigOpened"
                    :screen-definition="screenDefinition"
                  >
                  </screen-definition-config>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import CoverageConfig from "@/components/organisms/config/CoverageConfig.vue";
import ScreenDefinitionConfig from "@/components/organisms/config/ScreenDefinitionConfig.vue";
import { type ScreenDefinitionSetting } from "@/lib/common/settings/Settings";
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import { useRootStore } from "@/stores/root";

export default defineComponent({
  components: {
    "coverage-config": CoverageConfig,
    "screen-definition-config": ScreenDefinitionConfig
  },
  setup() {
    const rootStore = useRootStore();
    const route = useRoute();

    const panels = ref<number[]>([0, 1, 2]);
    const coverageConfigOpened = ref(true);
    const screenDefinitionConfigOpened = ref(true);

    const includeTags = ref<string[]>([]);
    const defaultTagList = ref<string[]>([]);
    const screenDefinition = ref<ScreenDefinitionSetting>({
      screenDefType: "title",
      conditionGroups: []
    });

    const updateWindowTitle = () => {
      rootStore.changeWindowTitle({
        title: rootStore.message(route.meta?.title ?? "")
      });
    };

    const initialize = () => {
      includeTags.value = rootStore.projectSettings.config.coverage.include.tags;
      defaultTagList.value = rootStore.projectSettings.defaultTagList;
      screenDefinition.value = rootStore.projectSettings.config.screenDefinition;
    };

    updateWindowTitle();
    initialize();

    return {
      panels,
      includeTags,
      defaultTagList,
      screenDefinition,
      coverageConfigOpened,
      screenDefinitionConfigOpened
    };
  }
});
</script>
