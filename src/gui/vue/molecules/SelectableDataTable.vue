<!--
 Copyright 2021 NTT Corporation.

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
  <v-data-table
    :headers="headers"
    :items="visibleItems"
    :pagination.sync="pagination"
  >
    <template v-slot:items="{ item }">
      <tr
        :key="item.index"
        :class="{
          selected: selectedItemIndexes.includes(item.index),
          'py-0': true,
          'my-0': true,
          disabled: disabledItemIndexes.includes(item.index),
        }"
        @click.exact="selectItems(item.index)"
        @click.shift="
          selectItems(
            ...getIndexesFromRange(
              selectedItemIndexes[0] || item.index,
              item.index
            )
          )
        "
        @contextmenu="contextmenu(item.index, $event)"
      >
        <slot name="row" :columns="item.columns"></slot>
      </tr>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class SelectableDataTable<T> extends Vue {
  @Prop({ type: Array, default: () => [] })
  private readonly selectedItemIndexes!: number[];
  @Prop({ type: Array, default: () => [] })
  private readonly disabledItemIndexes!: number[];
  @Prop({ type: Array, default: () => [] }) private readonly headers!: {
    text: string;
    value: string;
    class?: string;
    width?: string;
    sortable?: boolean;
  }[];
  @Prop({ type: Array, default: () => [] }) private readonly items!: T[];
  @Prop({ type: Array, default: () => [] })
  private readonly filteringPredicates!: ((item: T) => boolean)[];

  private pagination: {
    descending: boolean;
    page: number;
    rowsPerPage: number;
    sortBy?: string;
    totalItems?: number;
  } = {
    descending: true,
    page: 1,
    rowsPerPage: 10,
  };

  private get visibleItems() {
    const tableItems = this.items.map((columns, index) => {
      return { index, columns };
    });

    return tableItems.filter(({ columns }) => {
      return this.filteringPredicates.every((filteringPredicate) => {
        return filteringPredicate(columns);
      });
    });
  }

  created(): void {
    this.$nextTick(() => {
      this.switchPage();
    });
  }

  mounted(): void {
    document.addEventListener("keydown", this.keyDown);
  }

  beforeDestroy(): void {
    document.removeEventListener("keydown", this.keyDown);
  }

  @Watch("pagination.rowsPerPage")
  @Watch("selectedItemIndexes")
  private switchPage() {
    const currentItemIndex = this.selectedItemIndexes[0];

    const rowIndex = this.visibleItems.findIndex(
      ({ index }) => index === currentItemIndex
    );

    if (rowIndex !== -1) {
      this.pagination.page =
        Math.floor(rowIndex / this.pagination.rowsPerPage) + 1;
    }
  }

  private selectItems(...indexes: number[]) {
    this.$emit("selectItems", ...indexes);
  }

  private getIndexesFromRange(startIndex: number, endIndex: number) {
    if (startIndex < endIndex) {
      return Array(endIndex - startIndex + 1)
        .fill(0)
        .map((_, index) => index + startIndex);
    }

    if (startIndex > endIndex) {
      return Array(startIndex - endIndex + 1)
        .fill(0)
        .map((_, index) => index + endIndex)
        .reverse();
    }

    return [startIndex];
  }

  private contextmenu(itemIndex: number, event: MouseEvent) {
    event.preventDefault();
    this.$emit("contextmenu", {
      itemIndex,
      x: event.clientX,
      y: event.clientY,
    });
  }

  private keyDown(event: KeyboardEvent): void {
    const currentItemIndex = this.visibleItems.findIndex(
      ({ index }) => index === this.selectedItemIndexes[0]
    );

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const destItem = this.visibleItems[currentItemIndex - 1];

      if (destItem) {
        this.selectItems(destItem.index);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const destItem = this.visibleItems[currentItemIndex + 1];

      if (destItem) {
        this.selectItems(destItem.index);
      }
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      const destIndex = currentItemIndex + this.pagination.rowsPerPage;
      const destItem = this.visibleItems[
        destIndex > this.visibleItems.length - 1
          ? this.visibleItems.length - 1
          : destIndex
      ];

      if (destItem) {
        this.selectItems(destItem.index);
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const destIndex = currentItemIndex - this.pagination.rowsPerPage;
      const destItem = this.visibleItems[destIndex < 0 ? 0 : destIndex];

      if (destItem) {
        this.selectItems(destItem.index);
      }
    } else {
      return;
    }
  }
}
</script>

<style lang="sass" scoped>
table tr
  transition: background 0s !important

.selected
  background-color: lemonchiffon !important
  font-weight: bold
  color: chocolate

.disabled
  color: #888
  font-style: italic
  background-color: rgba(0,0,0,0.12)
</style>
