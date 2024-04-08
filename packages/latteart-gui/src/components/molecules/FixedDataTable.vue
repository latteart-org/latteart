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
  <v-data-table :items="items" :headers="addedPaddingCellheaders" :items-per-page="itemPerPage">
    <template v-for="(slot, name) of $slots" #[name]="props">
      <slot :name="name" v-bind="props"></slot>
    </template>
    <template #bottom v-if="hideActions" />
  </v-data-table>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from "vue";

export default defineComponent({
  props: {
    items: { type: Array, default: () => [] },
    headers: {
      type: Array as PropType<
        {
          value?: string;
          align?: "start" | "end" | "center" | undefined;
          sortable?: boolean;
          headerProps?: { [x: string]: string };
          title?: string;
          width?: string;
        }[]
      >,
      default: () => []
    },
    hideActions: { type: Boolean, default: false },
    itemPerPage: { type: Number, default: -1 },
    gridColumnNumber: { type: Number, default: 7 }
  },
  setup(props) {
    const addedPaddingCellheaders = computed(
      (): {
        value?: string;
        align?: "start" | "end" | "center" | undefined;
        sortable?: boolean;
        headerProps?: { [x: string]: string };
        title?: string;
        width?: string;
      }[] => {
        const result = props.headers.map((header) => header);
        if (result.length < props.gridColumnNumber) {
          result.push({ sortable: false });
        }

        return result;
      }
    );

    return { addedPaddingCellheaders };
  }
});
</script>
