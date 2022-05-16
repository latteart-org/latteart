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
  <div class="scroll-y" :style="{ height: '100%', 'overflow-y': 'scroll' }">
    <v-data-table
      :headers="tableHeaders"
      :items="visibleItems"
      :pagination.sync="pagination"
      :hide-headers="hideHeaders"
      :hide-actions="hideFooters"
      must-sort
    >
      <template v-slot:items="{ index, item }">
        <tr
          :key="index"
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
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { filterTableRows, sortTableRows } from "@/lib/common/table";

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
  @Prop({ type: Boolean, default: true }) private readonly shortcut!: boolean;
  @Prop({ type: Boolean, default: false })
  private readonly descending!: boolean;
  @Prop({ type: Number, default: 1 })
  private readonly page!: number;
  @Prop({ type: Number, default: -1 })
  private readonly rowsPerPage!: number;
  @Prop({ type: String, default: "" })
  private readonly sortBy!: string;
  @Prop({ type: Boolean, default: false })
  private readonly hideHeaders!: boolean;
  @Prop({ type: Boolean, default: false })
  private readonly hideFooters!: boolean;

  private pagination: {
    descending?: boolean;
    page: number;
    rowsPerPage: number;
    sortBy?: string;
  } = {
    descending: this.descending,
    page: this.page,
    rowsPerPage: this.rowsPerPage,
    sortBy: this.sortBy,
  };

  @Watch("pagination.descending")
  private notifyDescendingChange() {
    this.$emit("changeDescending", this.pagination.descending);
  }

  @Watch("pagination.page")
  private notifyPageChange() {
    this.$emit("changePage", this.pagination.page);
  }

  @Watch("pagination.rowsPerPage")
  private notifyRowsPerPageChange() {
    this.$emit("changeRowsPerPage", this.pagination.rowsPerPage);
  }

  @Watch("pagination.sortBy")
  private notifySortByChange() {
    this.$emit("changeSortBy", this.pagination.sortBy);
  }

  private get tableHeaders() {
    return this.headers.map((header) => {
      return {
        ...header,
        value: header.value,
      };
    });
  }

  private get visibleItems() {
    const tableItems = this.items.map((columns, index) => {
      return { index, columns };
    });

    const filteredItems = filterTableRows(tableItems, this.filteringPredicates);

    const sortedItems = sortTableRows(
      filteredItems,
      `${this.pagination.sortBy}`
    );

    return this.pagination.descending
      ? sortedItems.slice().reverse()
      : sortedItems;
  }

  private get visibleItemsStr() {
    return JSON.stringify(this.visibleItems);
  }

  created(): void {
    this.$nextTick(() => {
      this.resetPosition();
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
  @Watch("visibleItemsStr")
  private resetPosition() {
    const currentItemIndex = this.selectedItemIndexes[0];

    const rowIndex = this.visibleItems.findIndex(
      ({ index }) => index === currentItemIndex
    );

    if (rowIndex !== -1) {
      const rowsPerPage =
        this.pagination.rowsPerPage > 0
          ? this.pagination.rowsPerPage
          : this.visibleItems.length;

      this.switchTablePage(rowIndex, rowsPerPage);
      this.scrollToTableRow(rowIndex, rowsPerPage);
    }
  }

  private switchTablePage(rowIndex: number, rowsPerPage: number) {
    this.pagination.page = Math.floor(rowIndex / rowsPerPage) + 1;
  }

  private scrollToTableRow(rowIndex: number, rowsPerPage: number) {
    this.$vuetify.goTo(30 * Math.floor(rowIndex % rowsPerPage), {
      container: ".scroll-y",
      duration: 100,
    });
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
    if (!this.shortcut) {
      return;
    }

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
      const destItem =
        this.visibleItems[
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
  height: 30px !important

.selected
  background-color: lemonchiffon !important
  font-weight: bold
  color: chocolate

.disabled
  color: #888
  font-style: italic
  background-color: rgba(0,0,0,0.12)
</style>
