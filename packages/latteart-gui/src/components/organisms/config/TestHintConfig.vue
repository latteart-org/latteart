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
  <v-container class="mt-0 pt-0">
    <v-row>
      <v-col cols="12" class="py-0 my-0">
        <h4>{{ $t("test-hint-config.search-scope") }}</h4>
      </v-col>
      <v-col cols="12" class="pl-5">
        <v-text-field
          v-model="tempConfig.defaultSearchSeconds"
          hide-details
          variant="underlined"
          :label="$t('test-hint-config.default-search-seconds')"
          min="0"
          :suffix="$t('common.suffix')"
          type="number"
          @change="(e: any) => updateDefaultSearchSeconds(e.target._value)"
        />
        <span style="font-size: smaller">{{ $t("test-hint-config.info") }}</span>
      </v-col>
      <v-col cols="12" class="py-0 my-0">
        <h4>
          {{ $t("test-hint-config.matching-scope") }}
        </h4>
        <div>
          <v-radio-group
            hide-details
            :model-value="tempConfig.commentMatching.target"
            class="pr-0 my-0"
            @update:model-value="changeTarget"
          >
            <v-radio :label="$t('test-hint-config.all')" value="all"></v-radio>
            <v-radio
              :label="$t('test-hint-config.words-on-page-only')"
              value="wordsOnPageOnly"
            ></v-radio>
          </v-radio-group>
        </div>
      </v-col>
      <v-col cols="12" class="pl-5 py-0">
        <v-text-field
          hide-details
          variant="underlined"
          :disabled="tempConfig.commentMatching.target !== 'wordsOnPageOnly'"
          :label="$t('test-hint-config.extra-words')"
          :model-value="tempConfig.commentMatching.extraWords"
          @change="(e: any) => updateExtraWords(e.target._value)"
        ></v-text-field>
      </v-col>
      <v-col cols="12" class="pl-5">
        <v-text-field
          hide-details
          variant="underlined"
          :label="$t('test-hint-config.excluded-words')"
          :model-value="tempConfig.commentMatching.excludedWords"
          @change="(e: any) => updateExcludedWords(e.target._value)"
        ></v-text-field>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { type TestHintSetting } from "@/lib/common/settings/Settings";
import { defineComponent, ref, toRefs, watch, type PropType } from "vue";

type TempTestHintSetting = Omit<TestHintSetting, "commentMatching"> & {
  commentMatching: { target: "all" | "wordsOnPageOnly"; extraWords: string; excludedWords: string };
};

export default defineComponent({
  props: {
    opened: { type: Boolean, required: true },
    testHintSetting: { type: Object as PropType<TestHintSetting>, default: null }
  },
  emits: ["save-view-config"],
  setup(props, context) {
    const convertConfig = (setting: TestHintSetting) => {
      return {
        commentMatching: {
          target: setting.commentMatching.target,
          extraWords: setting.commentMatching.extraWords
            ? setting.commentMatching.extraWords.join(" ")
            : "",
          excludedWords: setting.commentMatching.excludedWords
            ? setting.commentMatching.excludedWords.join(" ")
            : ""
        },
        defaultSearchSeconds: setting.defaultSearchSeconds
      };
    };

    const tempConfig = ref<TempTestHintSetting>(convertConfig(props.testHintSetting));

    const updateTempConfig = () => {
      if (!props.opened) {
        tempConfig.value = convertConfig(props.testHintSetting);
      }
    };

    const saveViewConfig = () => {
      if (props.opened) {
        context.emit("save-view-config", {
          testHintSetting: {
            commentMatching: {
              target: tempConfig.value.commentMatching.target,
              extraWords:
                tempConfig.value.commentMatching.extraWords !== ""
                  ? tempConfig.value.commentMatching.extraWords.split(/\s/)
                  : [],
              excludedWords:
                tempConfig.value.commentMatching.excludedWords !== ""
                  ? tempConfig.value.commentMatching.excludedWords.split(/\s/)
                  : []
            },
            defaultSearchSeconds: tempConfig.value.defaultSearchSeconds
          }
        });
      }
    };

    const updateDefaultSearchSeconds = (seconds: string) => {
      const num = Number(seconds);
      const defaultSeconds = num < 0 ? 0 : num;
      tempConfig.value = { ...tempConfig.value, defaultSearchSeconds: defaultSeconds };
    };

    const changeTarget = (target: "all" | "wordsOnPageOnly" | null) => {
      if (target === null) {
        return;
      }

      tempConfig.value = {
        ...tempConfig.value,
        commentMatching: { ...tempConfig.value.commentMatching, target }
      };
    };

    const updateExtraWords = (text: string) => {
      tempConfig.value = {
        ...tempConfig.value,
        commentMatching: { ...tempConfig.value.commentMatching, extraWords: text }
      };
    };

    const updateExcludedWords = (text: string) => {
      tempConfig.value = {
        ...tempConfig.value,
        commentMatching: { ...tempConfig.value.commentMatching, excludedWords: text }
      };
    };

    const { testHintSetting } = toRefs(props);
    watch(testHintSetting, updateTempConfig);
    watch(tempConfig, saveViewConfig);

    return {
      tempConfig,
      updateDefaultSearchSeconds,
      changeTarget,
      updateExtraWords,
      updateExcludedWords
    };
  }
});
</script>
