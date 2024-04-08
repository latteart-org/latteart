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
  <v-container class="mt-0 pt-0">
    <v-row>
      <v-col cols="12">
        <v-checkbox
          v-model="isExcludeItemsEnabled"
          :label="store.getters.message('config-page.comparison-exclude-items-enabled')"
          hide-details
        >
        </v-checkbox>
      </v-col>
      <v-col cols="12" class="select-box">
        <v-select
          v-model="excludeItems"
          :items="tempExcludeItems"
          item-title="text"
          item-value="value"
          :menu-props="{ maxHeight: '400' }"
          :label="store.getters.message('config-page.comparison-exclude-items-value')"
          multiple
          @update:model-value="changeExcludeItems"
          :disabled="!isExcludeItemsEnabled"
          class="px-1"
        ></v-select>
      </v-col>
      <v-col cols="12">
        <v-checkbox
          v-model="isExcludeElementsEnabled"
          :label="store.getters.message('config-page.comparison-exclude-elements-enabled')"
          hide-details
        >
        </v-checkbox>
      </v-col>
      <v-col cols="12" class="select-box">
        <v-select
          v-model="excludeElements"
          :items="tempTags"
          :menu-props="{ maxHeight: '400' }"
          :label="store.getters.message('config-page.comparison-exclude-elements-tagname')"
          multiple
          @update:model-value="changeExcludeElements"
          :disabled="!isExcludeElementsEnabled"
          class="px-1"
        ></v-select>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { TestResultComparisonSetting } from "@/lib/common/settings/Settings";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    tags: {
      type: Array as PropType<string[]>,
      default: () => [],
      required: true
    },
    setting: {
      type: Object as PropType<TestResultComparisonSetting>,
      default: () => {
        /** nothing */
      },
      required: true
    }
  },
  setup(props, context) {
    const store = useStore();

    const excludeItemValues = ref<string[]>([]);
    const excludeElementTags = ref<string[]>([]);
    const tempSetting = ref<TestResultComparisonSetting>({
      excludeItems: { isEnabled: false, values: [] },
      excludeElements: { isEnabled: false, values: [] }
    });

    const updateTempSetting = () => {
      tempSetting.value = { ...props.setting };
    };

    const tempTags = computed(() => {
      return props.tags.sort();
    });

    const tempExcludeItems = computed((): { text: string; value: string }[] => {
      return [
        {
          text: `${store.getters.message("test-result-comparison-items.title")}`,
          value: "title"
        },
        {
          text: `${store.getters.message("test-result-comparison-items.url")}`,
          value: "url"
        },
        {
          text: `${store.getters.message("test-result-comparison-items.elementTexts")}`,
          value: "elementTexts"
        },
        {
          text: `${store.getters.message("test-result-comparison-items.screenshot")}`,
          value: "screenshot"
        }
      ];
    });

    const isExcludeItemsEnabled = computed({
      get: (): boolean => props.setting.excludeItems.isEnabled,
      set: (isEnabled: boolean) => {
        context.emit("save-config", {
          testResultComparison: {
            excludeItems: {
              isEnabled,
              values: props.setting.excludeItems.values
            },
            excludeElements: {
              isEnabled: props.setting.excludeElements.isEnabled,
              values: props.setting.excludeElements.values
            }
          }
        });
      }
    });

    const isExcludeElementsEnabled = computed({
      get: (): boolean => props.setting.excludeElements.isEnabled,
      set: (isEnabled: boolean) => {
        context.emit("save-config", {
          testResultComparison: {
            excludeItems: {
              isEnabled: props.setting.excludeItems.isEnabled,
              values: props.setting.excludeItems.values
            },
            excludeElements: {
              isEnabled,
              values: props.setting.excludeElements.values
            }
          }
        });
      }
    });

    const excludeItems = computed({
      get: (): string[] => props.setting.excludeItems.values,
      set: (items: string[]) => {
        excludeItemValues.value = items;
      }
    });

    const excludeElements = computed({
      get: (): string[] => props.setting.excludeElements.values.map(({ tagname }) => tagname),
      set: (tags: string[]) => {
        excludeElementTags.value = tags;
      }
    });

    const changeExcludeItems = () => {
      const tmpList = excludeItemValues.value.filter((tag) => {
        return tag !== "";
      });

      context.emit("save-config", {
        testResultComparison: {
          excludeItems: {
            isEnabled: props.setting.excludeItems.isEnabled,
            values: tmpList
          },
          excludeElements: {
            isEnabled: props.setting.excludeElements.isEnabled,
            values: props.setting.excludeElements.values
          }
        }
      });
    };

    const changeExcludeElements = () => {
      const tmpList = excludeElementTags.value
        .filter((tag) => {
          return tag !== "";
        })
        .map((tag) => {
          return { tagname: tag };
        });

      context.emit("save-config", {
        testResultComparison: {
          excludeItems: {
            isEnabled: props.setting.excludeItems.isEnabled,
            values: props.setting.excludeItems.values
          },
          excludeElements: {
            isEnabled: props.setting.excludeElements.isEnabled,
            values: tmpList
          }
        }
      });
    };

    const { setting } = toRefs(props);
    watch(setting, updateTempSetting);

    return {
      store,
      tempTags,
      tempExcludeItems,
      isExcludeItemsEnabled,
      isExcludeElementsEnabled,
      excludeItems,
      excludeElements,
      changeExcludeItems,
      changeExcludeElements
    };
  }
});
</script>

<style lang="sass" scoped>
.select-box
  padding-left: 1.5em
</style>
