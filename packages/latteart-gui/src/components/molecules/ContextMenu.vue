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
  <v-menu
    v-model="show"
    :position-x="x"
    :position-y="y"
    :top="top"
    :persistent="false"
    close-on-content-click
  >
    <v-list>
      <v-list-item v-for="item in items" :key="item.label" @click="item.onClick">
        <v-list-item-title>{{ item.label }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true },
    x: { type: Number, default: 0, required: true },
    y: { type: Number, default: 0, required: true },
    top: { type: Boolean, default: false },
    items: {
      type: Array as PropType<{ label: string; onClick: () => void }[]>,
      default: [],
      required: true
    }
  },
  setup(props, context) {
    const store = useStore();

    const show = computed({
      get: () => props.opened,
      set: (opened) => {
        if (!opened) {
          context.emit("contextMenuClose");
        }
      }
    });

    return { store, show };
  }
});
</script>

<style lang="sass">
.v-list__tile
  font-size: 12px
  height: auto
  padding: 4px 16px

.v-list__tile__title
  height: auto
  line-height: normal
</style>
