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
  <div class="pb-1">
    <v-chip
      variant="elevated"
      v-for="(tag, index) in tags"
      :key="index"
      :color="getTagsColor(tag)"
      size="small"
      >{{ tag }}</v-chip
    >
  </div>
</template>

<script lang="ts">
import { defaultNoteTagColor, noteTagPreset } from "@/lib/operationHistory/NoteTagPreset";
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  props: {
    tags: { type: Array as PropType<string[]>, default: () => [], required: true }
  },
  setup() {
    const getTagsColor = (tag: string) => {
      return noteTagPreset.items.find((item) => item.text === tag)?.color ?? defaultNoteTagColor;
    };

    return {
      getTagsColor
    };
  }
});
</script>
