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
  <v-combobox
    :label="label"
    v-model="selectedTags"
    :hide-no-data="!search"
    :items="tagSelectionItems"
    v-model:search="search"
    multiple
  >
    <template v-slot:no-data>
      <v-list-item>
        <v-list-item-title>
          No results matching "<strong>{{ search }}</strong
          >". Press <kbd>enter</kbd> to create a new one
        </v-list-item-title>
      </v-list-item>
    </template>
    <template v-slot:selection="{ item }">
      <v-chip :color="getChipColor(item.raw)" size="small" variant="elevated">
        <span class="pr-2">{{ item.raw }} </span>
      </v-chip>
    </template>
  </v-combobox>
</template>

<script lang="ts">
import { defaultNoteTagColor, noteTagPreset } from "@/lib/operationHistory/NoteTagPreset";
import { defineComponent, ref, watch, type PropType } from "vue";

export default defineComponent({
  props: {
    label: { type: String, default: "", required: true },
    modelValue: { type: Array as PropType<string[]>, default: () => [], required: true }
  },
  emits: ["update:modelValue"],
  setup(_, context) {
    const selectedTags = ref<string[]>([]);
    const search = ref(null);
    const tagSelectionItems = ref(noteTagPreset.items.map(({ text }) => text));

    const getChipColor = (text: string) => {
      return noteTagPreset.items.find((item) => item.text === text)?.color ?? defaultNoteTagColor;
    };

    watch(selectedTags, (newTags) => {
      context.emit("update:modelValue", newTags);
    });

    return {
      search,
      selectedTags,
      tagSelectionItems,
      getChipColor
    };
  }
});
</script>
