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
  <v-row class="px-4">
    <div class="head-label">
      {{ $t("coverage-config.include-coverage") }}
    </div>
    <v-col v-if="displayedTagList.length <= 0">
      <v-card color="#EEE">
        <v-card-text>
          <v-row align="center">
            <v-col class="ma-3"> NO DATA </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col v-for="tag in displayedTagList" :key="tag" cols="1" style="width: 150px" class="pa-1">
      <v-card class="ma-1 pa-1" color="#EEE">
        <v-card-text class="my-0 py-0">
          <v-row align="center" class="ma-0 pa-0">
            <v-col cols="7" class="tagName ma-0 pa-0">
              {{ tag }}
            </v-col>
            <v-col cols="5" class="ma-0 pa-0">
              <v-checkbox
                v-model="tempIncludeTags"
                :value="tag"
                readonly
                hide-details
                @click="changeValue(tag)"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from "vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, required: true },
    includeTags: { type: Array as PropType<string[]>, required: true },
    defaultTagList: { type: Array as PropType<string[]>, required: true }
  },
  emits: ["save-config"],
  setup(props, context) {
    const tempIncludeTags = ref(props.includeTags);

    const displayedTagList = computed(() => {
      const sortFunc = (a: string, b: string) => {
        if (a < b) {
          return -1;
        } else if (a > b) {
          return 1;
        }
        return 0;
      };

      return [
        ...Array.from(tempIncludeTags.value).sort(sortFunc),
        ...props.defaultTagList
          .filter((defaultTag) => !tempIncludeTags.value.includes(defaultTag))
          .sort(sortFunc)
      ];
    });

    const changeValue = (tag: string): void => {
      if (props.opened) {
        const hasTag = tempIncludeTags.value.includes(tag);
        const tags = hasTag
          ? tempIncludeTags.value.filter((t) => t !== tag)
          : [...tempIncludeTags.value, tag];
        context.emit("save-config", { coverage: { include: { tags } } });
        tempIncludeTags.value = tags;
      }
    };

    return {
      tempIncludeTags,
      displayedTagList,
      changeValue
    };
  }
});
</script>

<style lang="sass" scoped>
.tagName
  word-break: break-all

.head-label
  width: 100%
  padding-left: 5px
</style>
