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
  <v-container class="mt-0 pt-0">
    <v-layout row wrap>
      <v-flex xs12>
        <v-checkbox
          v-model="isExcludeItemsEnabled"
          :label="
            $store.getters.message(
              'config-view.comparison-exclude-items-enabled'
            )
          "
          hide-details
        >
        </v-checkbox>
      </v-flex>
      <v-flex xs12 class="select-box">
        <v-select
          v-model="excludeItems"
          :items="tempExcludeItems"
          item-text="text"
          item-value="value"
          :menu-props="{ maxHeight: '400' }"
          :label="
            $store.getters.message('config-view.comparison-exclude-items-value')
          "
          multiple
          @change="changeExcludeItems"
          :disabled="!isExcludeItemsEnabled"
          class="px-1"
        ></v-select>
      </v-flex>
      <v-flex xs12>
        <v-checkbox
          v-model="isExcludeElementsEnabled"
          :label="
            $store.getters.message(
              'config-view.comparison-exclude-elements-enabled'
            )
          "
          hide-details
        >
        </v-checkbox>
      </v-flex>
      <v-flex xs12 class="select-box">
        <v-select
          v-model="excludeElements"
          :items="tempTags"
          :menu-props="{ maxHeight: '400' }"
          :label="
            $store.getters.message(
              'config-view.comparison-exclude-elements-tagname'
            )
          "
          multiple
          @change="changeExcludeElements"
          :disabled="!isExcludeElementsEnabled"
          class="px-1"
        ></v-select>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { TestResultComparisonSetting } from "@/lib/common/settings/Settings";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class CompareSetting extends Vue {
  @Prop({ type: Array, default: () => [] }) public readonly tags!: string[];
  @Prop({
    type: Object,
    default: () => {
      /** nothing */
    },
  })
  public readonly setting!: TestResultComparisonSetting;
  private excludeItemValues: string[] = [];
  private excludeElementTags: string[] = [];
  private tempSetting: TestResultComparisonSetting = {
    excludeItems: {
      isEnabled: false,
      values: [],
    },
    excludeElements: {
      isEnabled: false,
      values: [],
    },
  };

  @Watch("setting")
  private updateTempSetting() {
    this.tempSetting = { ...this.setting };
  }

  private get tempTags() {
    return this.tags.sort();
  }

  private get tempExcludeItems(): { text: string; value: string }[] {
    return [
      {
        text: `${this.$store.getters.message(
          "test-result-comparison-items.title"
        )}`,
        value: "title",
      },
      {
        text: `${this.$store.getters.message(
          "test-result-comparison-items.url"
        )}`,
        value: "url",
      },
      {
        text: `${this.$store.getters.message(
          "test-result-comparison-items.elementTexts"
        )}`,
        value: "elementTexts",
      },
      {
        text: `${this.$store.getters.message(
          "test-result-comparison-items.screenshot"
        )}`,
        value: "screenshot",
      },
    ];
  }

  private get isExcludeItemsEnabled(): boolean {
    return this.setting.excludeItems.isEnabled;
  }

  private set isExcludeItemsEnabled(isEnabled: boolean) {
    this.$emit("save-config", {
      testResultComparison: {
        excludeItems: {
          isEnabled,
          values: this.setting.excludeItems.values,
        },
        excludeElements: {
          isEnabled: this.setting.excludeElements.isEnabled,
          values: this.setting.excludeElements.values,
        },
      },
    });
  }

  private get isExcludeElementsEnabled(): boolean {
    return this.setting.excludeElements.isEnabled;
  }

  private set isExcludeElementsEnabled(isEnabled: boolean) {
    this.$emit("save-config", {
      testResultComparison: {
        excludeItems: {
          isEnabled: this.setting.excludeItems.isEnabled,
          values: this.setting.excludeItems.values,
        },
        excludeElements: {
          isEnabled,
          values: this.setting.excludeElements.values,
        },
      },
    });
  }

  private get excludeItems(): string[] {
    return this.setting.excludeItems.values;
  }

  private set excludeItems(excludeItemValues: string[]) {
    this.excludeItemValues = excludeItemValues;
  }

  private get excludeElements(): string[] {
    return this.setting.excludeElements.values.map(({ tagname }) => tagname);
  }

  private set excludeElements(excludeElementTags: string[]) {
    this.excludeElementTags = excludeElementTags;
  }

  private changeExcludeItems() {
    const tmpList = this.excludeItemValues.filter((tag) => {
      return tag !== "";
    });

    this.$emit("save-config", {
      testResultComparison: {
        excludeItems: {
          isEnabled: this.setting.excludeItems.isEnabled,
          values: tmpList,
        },
        excludeElements: {
          isEnabled: this.setting.excludeElements.isEnabled,
          values: this.setting.excludeElements.values,
        },
      },
    });
  }

  private changeExcludeElements() {
    const tmpList = this.excludeElementTags
      .filter((tag) => {
        return tag !== "";
      })
      .map((tag) => {
        return { tagname: tag };
      });

    this.$emit("save-config", {
      testResultComparison: {
        excludeItems: {
          isEnabled: this.setting.excludeItems.isEnabled,
          values: this.setting.excludeItems.values,
        },
        excludeElements: {
          isEnabled: this.setting.excludeElements.isEnabled,
          values: tmpList,
        },
      },
    });
  }
}
</script>

<style lang="sass" scoped>
.select-box
  padding-left: 1.5em
</style>
