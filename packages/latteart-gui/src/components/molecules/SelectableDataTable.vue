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
      :value="selected"
      :headers="tableHeaders"
      :items="visibleItems"
      :pagination.sync="pagination"
      :hide-headers="hideHeaders"
      :hide-actions="hideFooters"
      must-sort
      select-all
    >
      <template v-slot:headers="props">
        <tr :style="{ height: '40px !important' }">
          <th class="check-col" v-if="!hideCheckBox">
            <v-checkbox
              :input-value="props.all"
              :indeterminate="isPartiallyChecked"
              primary
              hide-details
              @click.stop="toggleAll"
            ></v-checkbox>
          </th>
          <th
            v-for="header in props.headers"
            :key="header.text"
            :width="header.width"
            :sortable="header.sortable"
            align="left"
            :class="[
              'column sortable',
              pagination.descending ? 'desc' : 'asc',
              header.value === pagination.sortBy ? 'active' : '',
              header.class ?? '',
            ]"
            @click="changeSort(header.value)"
          >
            {{ header.text }}
            <v-icon small>arrow_upward</v-icon>
          </th>
        </tr>
      </template>

      <template v-slot:items="props">
        <tr
          :key="props.item.index"
          :class="{
            selected: selectedItemIndexes.includes(props.item.index),
            'py-0': true,
            'my-0': true,
            marked: markedItemIndexes.includes(props.item.index),
            disabled: disabledItemIndexes.includes(props.item.index),
          }"
          @click="selectItems(props.item.index)"
          @contextmenu="contextmenu(props.item.index, $event)"
        >
          <td class="check-col check-item" v-if="!hideCheckBox">
            <v-checkbox
              class="mr-1"
              hide-details
              :input-value="
                selected.find(({ index }) => {
                  return index === props.item.index;
                }) !== undefined
              "
              @click.exact.stop="
                () => changeItemCheckStatuses(props.item.index)
              "
              @click.shift.stop="
                () => changeItemCheckStatuses(props.item.index, true)
              "
            ></v-checkbox>
          </td>
          <slot name="row" :columns="props.item.columns"></slot>
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
  private readonly checkedItemIndexes!: number[];
  @Prop({ type: Array, default: () => [] })
  private readonly markedItemIndexes!: number[];
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
  @Prop({ type: Boolean, default: false })
  private readonly hideCheckBox!: boolean;

  private selected: { index: number; columns: T }[] = [];
  private lastCheckedRowIndex = -1;
  private lastUncheckedRowIndex = -1;

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
    this.lastCheckedRowIndex = -1;
    this.lastUncheckedRowIndex = -1;
  }

  @Watch("pagination.rowsPerPage")
  private notifyRowsPerPageChange() {
    this.$emit("changeRowsPerPage", this.pagination.rowsPerPage);
    this.lastCheckedRowIndex = -1;
    this.lastUncheckedRowIndex = -1;
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

  private get currentItemIndex() {
    return this.visibleItems.findIndex(
      ({ index }) => index === this.selectedItemIndexes[0]
    );
  }

  private get visibleItemsStr() {
    return JSON.stringify(this.visibleItems);
  }

  private get isPartiallyChecked() {
    return (
      this.selected.length > 0 &&
      this.visibleItems.length > this.selected.length
    );
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

  @Watch("checkedItemIndexes")
  private resetSelected() {
    this.selected = this.visibleItems.filter((item) => {
      return this.checkedItemIndexes.includes(item.index);
    });
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

  private selectCurrentPageRows() {
    if (this.pagination.rowsPerPage <= 0) {
      return this.visibleItems;
    }

    const filteredItems = this.visibleItems.filter((item, index) => {
      if (index < this.pagination.rowsPerPage * (this.pagination.page - 1)) {
        return false;
      }

      if (index >= this.pagination.rowsPerPage * this.pagination.page) {
        return false;
      }

      return true;
    });

    return filteredItems;
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

    const keyToAction = new Map([
      ["ArrowUp", this.prev],
      ["ArrowDown", this.next],
      ["ArrowRight", this.pageForward],
      ["ArrowLeft", this.pageBack],
    ]);

    const action = keyToAction.get(event.key) ?? (() => undefined);

    action();
  }

  private prev() {
    const destItem = this.visibleItems[this.currentItemIndex - 1];

    if (destItem) {
      this.selectItems(destItem.index);
    }
  }

  private next() {
    const destItem = this.visibleItems[this.currentItemIndex + 1];

    if (destItem) {
      this.selectItems(destItem.index);
    }
  }

  private pageForward() {
    const destIndex = this.currentItemIndex + this.pagination.rowsPerPage;
    const destItem =
      this.visibleItems[
        destIndex > this.visibleItems.length - 1
          ? this.visibleItems.length - 1
          : destIndex
      ];

    if (destItem) {
      this.selectItems(destItem.index);
    }
  }

  private pageBack() {
    const destIndex = this.currentItemIndex - this.pagination.rowsPerPage;
    const destItem = this.visibleItems[destIndex < 0 ? 0 : destIndex];

    if (destItem) {
      this.selectItems(destItem.index);
    }
  }

  private changeItemCheckStatuses(index: number, isMultiple = false) {
    const range = (a: number, b: number) => {
      return b > a
        ? [...Array(b - a + 1).keys()].map((k) => k + a)
        : [...Array(a - b + 1).keys()].map((k) => k + b);
    };

    const isChecked =
      this.selected.find((item) => item.index === index) != undefined;

    if (isChecked) {
      const indexes =
        isMultiple && this.lastUncheckedRowIndex >= 0
          ? range(index, this.lastUncheckedRowIndex)
          : [index];

      this.uncheckRows(...indexes);
      this.lastUncheckedRowIndex = index;
    } else {
      const indexes =
        isMultiple && this.lastCheckedRowIndex >= 0
          ? range(index, this.lastCheckedRowIndex)
          : [index];

      this.checkRows(...indexes);
      this.lastCheckedRowIndex = index;
    }
  }

  private toggleAll() {
    const currentPageRows = this.selectCurrentPageRows();
    const currentPageRowIndexes = currentPageRows.map(({ index }) => index);
    const allPageCheckedRowIndexes = this.selected.map(({ index }) => index);

    if (
      currentPageRowIndexes.every((index) =>
        allPageCheckedRowIndexes.includes(index)
      )
    ) {
      this.uncheckRows(...currentPageRows.map(({ index }) => index));
    } else {
      this.checkRows(...currentPageRows.map(({ index }) => index));
    }

    this.lastCheckedRowIndex = -1;
    this.lastUncheckedRowIndex = -1;
  }

  private checkRows(...targetRowIndexes: number[]) {
    const targetRows = this.visibleItems.filter(({ index }) =>
      targetRowIndexes.includes(index)
    );
    const otherSelectedRows = this.selected.filter(
      ({ index }) => !targetRowIndexes.includes(index)
    );

    this.toggleRows(...otherSelectedRows, ...targetRows);
  }

  private uncheckRows(...targetRowIndexes: number[]) {
    const otherSelectedRows = this.selected.filter(
      ({ index }) => !targetRowIndexes.includes(index)
    );

    this.toggleRows(...otherSelectedRows);
  }

  private toggleRows(...targetRows: { index: number; columns: T }[]) {
    this.selected = targetRows.slice();

    const checkedIndexes = this.selected.map((item) => {
      return item.index;
    });

    this.$emit("checkItems", checkedIndexes);
  }

  private changeSort(column: string) {
    if (this.pagination.sortBy === column) {
      this.pagination.descending = !this.pagination.descending;
    } else {
      this.pagination.sortBy = column;
      this.pagination.descending = false;
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

.marked
  color: #44A
  background-color: #F3F3FF

.disabled
  color: #888
  font-style: italic
  background-color: rgba(0,0,0,0.12)

.check-col
  padding-right: 0 !important
  width: 30px

.check-item
  height: 30px
</style>
