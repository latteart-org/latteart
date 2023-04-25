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
  <div
    class="overflow-y-auto"
    :style="{ height: '100%', 'overflow-y': 'scroll' }"
  >
    <v-data-table
      :value="selected"
      :headers="tableHeaders"
      :items="visibleItems"
      :options.sync="options"
      :hide-default-header="hideHeaders"
      :hide-default-footer="hideFooters"
      must-sort
    >
      <template v-slot:header="{ props }">
        <tr :style="{ height: '40px !important' }" class="v-data-table-header">
          <th class="check-col pl-4" v-if="!hideCheckBox">
            <v-checkbox
              v-model="selectedAll"
              :indeterminate="isPartiallyChecked"
              primary
              hide-details
              readonly
              @click.prevent="toggleAll"
              class="ml-1 mt-0"
            ></v-checkbox>
          </th>
          <th
            v-for="header in props.headers"
            :key="header.text"
            :width="header.width"
            :sortable="header.sortable"
            align="left"
            :class="[
              'pl-4',
              'column sortable',
              options.sortDesc ? 'desc' : 'asc',
              header.value === options.sortBy.at(0) ? 'active' : '',
              header.class ?? '',
            ]"
            @click="if (header.sortable !== false) changeSort(header.value);"
          >
            {{ header.text }}
            <v-icon
              v-if="header.sortable !== false"
              class="v-data-table-header__icon"
              small
              >arrow_upward</v-icon
            >
          </th>
        </tr>
      </template>

      <template v-slot:item="props">
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
              class="ml-1 mt-0"
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
  private readonly sortDesc!: boolean;
  @Prop({ type: Number, default: 1 })
  private readonly page!: number;
  @Prop({ type: Number, default: -1 })
  private readonly itemsPerPage!: number;
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
  private selectedAll = false;

  private options: {
    sortDesc?: boolean;
    page: number;
    itemsPerPage: number;
    sortBy?: string[];
  } = {
    sortDesc: this.sortDesc,
    page: this.page,
    itemsPerPage: this.itemsPerPage,
    sortBy: [this.sortBy],
  };

  @Watch("options.sortDesc")
  private notifySortDescChange() {
    this.$emit("changeSortDesc", this.options.sortDesc);
  }

  @Watch("options.page")
  private notifyPageChange() {
    this.$emit("changePage", this.options.page);
    this.lastCheckedRowIndex = -1;
    this.lastUncheckedRowIndex = -1;
  }

  @Watch("options.itemsPerPage")
  private notifyItemsPerPageChange() {
    this.$emit("changeItemsPerPage", this.options.itemsPerPage);
    this.lastCheckedRowIndex = -1;
    this.lastUncheckedRowIndex = -1;
  }

  @Watch("options.sortBy")
  private notifySortByChange() {
    this.$emit("changeSortBy", this.options.sortBy);
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

    const sortedItems = sortTableRows(filteredItems, `${this.options.sortBy}`);

    return this.options.sortDesc ? sortedItems.slice().reverse() : sortedItems;
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

  @Watch("options.itemsPerPage")
  @Watch("selectedItemIndexes")
  @Watch("visibleItemsStr")
  private resetPosition() {
    const currentItemIndex = this.selectedItemIndexes[0];

    const rowIndex = this.visibleItems.findIndex(
      ({ index }) => index === currentItemIndex
    );

    if (rowIndex !== -1) {
      const itemsPerPage =
        this.options.itemsPerPage > 0
          ? this.options.itemsPerPage
          : this.visibleItems.length;

      this.switchTablePage(rowIndex, itemsPerPage);
      this.scrollToTableRow(rowIndex, itemsPerPage);
    }
  }

  @Watch("checkedItemIndexes")
  private resetSelected() {
    this.selected = this.visibleItems.filter((item) => {
      return this.checkedItemIndexes.includes(item.index);
    });
    this.changeSelectedAll();
  }

  private switchTablePage(rowIndex: number, itemsPerPage: number) {
    this.options.page = Math.floor(rowIndex / itemsPerPage) + 1;
  }

  private scrollToTableRow(rowIndex: number, itemsPerPage: number) {
    this.$vuetify.goTo(30 * Math.floor(rowIndex % itemsPerPage), {
      container: ".overflow-y-auto",
      duration: 100,
    });
  }

  private selectCurrentPageRows() {
    if (this.options.itemsPerPage <= 0) {
      return this.visibleItems;
    }

    const filteredItems = this.visibleItems.filter((item, index) => {
      if (index < this.options.itemsPerPage * (this.options.page - 1)) {
        return false;
      }

      if (index >= this.options.itemsPerPage * this.options.page) {
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
    const destIndex = this.currentItemIndex + this.options.itemsPerPage;
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
    const destIndex = this.currentItemIndex - this.options.itemsPerPage;
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

  private changeSelectedAll(): void {
    this.selectedAll =
      this.selected.length > 0 &&
      this.visibleItems.length === this.selected.length;
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
    if (this.options.sortBy?.at(0) === column) {
      this.options.sortDesc = !this.options.sortDesc;
    } else {
      this.options.sortBy = [column];
      this.options.sortDesc = false;
    }
  }
}
</script>

<style lang="sass" scoped>
table tr
  transition: background 0s !important
  height: 30px !important

th
  font-size: 0.75rem

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
