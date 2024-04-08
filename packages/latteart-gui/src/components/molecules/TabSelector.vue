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
  <v-tabs bg-color="#424242" slider-color="yellow" show-arrows :model-value="selectedItemIndex">
    <v-tab dark v-for="item in items" :key="item.id" @click="select(item.id)">
      {{ wordOmitted(item.name, 10) }}
    </v-tab>
  </v-tabs>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from "vue";

export default defineComponent({
  props: {
    items: {
      type: Array as PropType<{ id: string; name: string }[]>,
      default: () => []
    },
    selectedItemId: { type: String, default: "" }
  },
  setup(props, context) {
    const selectedItemIndex = computed(() => {
      const index = props.items.findIndex((item) => item.id === props.selectedItemId);

      return index < 0 ? null : index;
    });

    const select = (id: string): void => {
      context.emit("select", id);
    };

    const wordOmitted = (word: string, length: number): string => {
      if (word.length > length) {
        return `${word.substr(0, length)}...`;
      }

      return word;
    };

    return { selectedItemIndex, select, wordOmitted };
  }
});
</script>
