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
  <v-row
    id="operation-list"
    align-content="space-around"
    justify="space-between"
    class="fill-height"
  >
    <v-col cols="12" align-self="center" style="height: 40px">
      <auto-operation-register-button v-if="!isViewerMode" />
    </v-col>
    <v-row
      align-content="space-around"
      justify="end"
      class="fill-height"
      style="height: calc(100% - 90px)"
      no-gutters
    >
      <v-col cols="12" :style="{ height: '100%' }">
        <v-container fluid fill-height>
          <v-data-table
            height="calc(100% - 59px)"
            :style="{ height: '100%', width: '100%' }"
            dense
            fixed-header
            :show-select="!isViewerMode"
            item-key="operation.sequence"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :custom-sort="(items) => items"
            must-sort
            :headers="headers"
            :items="displayedHistoryItems"
            v-model="checkedItems"
            :search="search"
            :page.sync="page"
            :items-per-page.sync="itemsPerPage"
            :footer-props="{ 'items-per-page-options': itemsPerPageOptions }"
            @click:row="(item) => onSelectOperations(item.index)"
            @contextmenu:row="(event, item) => contextmenu(item.index, event)"
          >
            <template
              v-slot:[`item.data-table-select`]="{ isSelected, select, item }"
            >
              <td :class="createCssClassForRow(item.index)">
                <v-simple-checkbox
                  :value="isSelected"
                  @input="select($event)"
                />
              </td>
            </template>

            <template v-slot:[`item.operation.sequence`]="{ item }">
              <td :class="createCssClassForRow(item.index)">
                {{ item.operation.sequence }}
              </td>
            </template>

            <template v-slot:[`item.notes`]="{ item }">
              <td :class="createCssClassForRow(item.index)">
                <v-icon
                  v-if="item.notes.intention"
                  :title="message('app.intention')"
                  color="blue"
                  >event_note</v-icon
                >
                <v-icon
                  v-if="item.notes.notices.length + item.notes.bugs.length > 0"
                  :title="message('app.note')"
                  color="purple lighten-3"
                  >announcement</v-icon
                >
              </td>
            </template>

            <template v-slot:[`item.operation.title`]="{ item }">
              <td
                :title="item.operation.title"
                :class="{ ...createCssClassForRow(item.index), ellipsis: true }"
              >
                {{ item.operation.title.substring(0, 60) }}
              </td>
            </template>

            <template v-slot:[`item.operation.elementInfo.tagname`]="{ item }">
              <td
                :title="item.operation.elementInfo.tagname"
                :class="{ ...createCssClassForRow(item.index), ellipsis: true }"
              >
                {{ item.operation.elementInfo.tagname }}
              </td>
            </template>

            <template
              v-slot:[`item.operation.elementInfo.attributes.name`]="{ item }"
            >
              <td
                :title="item.operation.elementInfo.attributes.name"
                :class="{ ...createCssClassForRow(item.index), ellipsis: true }"
              >
                {{ item.operation.elementInfo.attributes.name }}
              </td>
            </template>

            <template v-slot:[`item.operation.elementInfo.text`]="{ item }">
              <td
                :title="item.operation.elementInfo.text"
                :class="{ ...createCssClassForRow(item.index), ellipsis: true }"
              >
                {{ item.operation.elementInfo.text.substring(0, 60) }}
              </td>
            </template>

            <template v-slot:[`item.operation.type`]="{ item }">
              <td
                :title="item.operation.type"
                :class="{ ...createCssClassForRow(item.index), ellipsis: true }"
              >
                {{ item.operation.type }}
              </td>
            </template>

            <template v-slot:[`item.operation.inputValue`]="{ item }">
              <td
                :title="item.operation.inputValue"
                :class="{ ...createCssClassForRow(item.index), ellipsis: true }"
              >
                {{ item.operation.inputValue.substring(0, 60) }}
              </td>
            </template>

            <template v-slot:[`item.operation.timestamp`]="{ item }">
              <td
                :title="formatTimestamp(item.operation.timestamp)"
                :class="{ ...createCssClassForRow(item.index), ellipsis: true }"
              >
                {{ formatTimestamp(item.operation.timestamp) }}
              </td>
            </template>
          </v-data-table>
        </v-container>
      </v-col>
    </v-row>

    <v-col cols="12">
      <v-row
        id="operation-search"
        style="height: 50px"
        @keydown="cancelKeydown"
      >
        <span class="search-title pt-5 pl-4"
          ><v-icon>search</v-icon>{{ message("operation.search") }}</span
        >
        <v-checkbox
          class="search-checkbox pl-4"
          :label="message('operation.purpose')"
          v-model="isPurposeFilterEnabled"
        ></v-checkbox>
        <v-checkbox
          class="search-checkbox"
          :label="message('operation.notice')"
          v-model="isNoteFilterEnabled"
        ></v-checkbox>
        <v-text-field
          class="pl-4"
          v-model="search"
          :label="message('operation.query')"
        ></v-text-field>
      </v-row>
    </v-col>

    <operation-context-menu
      :opened="contextMenuOpened"
      :x="contextMenuX"
      :y="contextMenuY"
      :operationInfo="contextMenuInfo"
      @operationContextMenuClose="contextMenuOpened = false"
    />
  </v-row>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import {
  OperationHistory,
  MessageProvider,
} from "@/lib/operationHistory/types";
import OperationContextMenu from "@/components/pages/captureControl/historyView/OperationContextMenu.vue";
import { NoteForGUI } from "@/lib/operationHistory/NoteForGUI";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { TimestampImpl } from "@/lib/common/Timestamp";
import AutoOperationRegisterButton from "./AutoOperationRegisterButton.vue";
import { filterTableRows, sortTableRows } from "@/lib/common/table";

type ElementInfoForDisplay = {
  tagname: string;
  text: string;
  xpath: string;
  iframeIndex?: number;
  attributes: { [key: string]: string };
};

type OperationForDisplay = Omit<OperationForGUI, "elementInfo"> & {
  elementInfo: ElementInfoForDisplay;
};

type HistoryItemForDisplay = {
  index: number;
  operation: OperationForDisplay;
  notes: {
    bugs: NoteForGUI[];
    notices: NoteForGUI[];
    intention: NoteForGUI | null;
  };
};

@Component({
  components: {
    "operation-context-menu": OperationContextMenu,
    "auto-operation-register-button": AutoOperationRegisterButton,
  },
})
export default class OperationList extends Vue {
  @Prop({ type: Array, default: [] })
  public readonly history!: OperationHistory;
  @Prop({ type: Number, default: -1 })
  public readonly selectedOperationSequence!: number;
  @Prop({
    type: Function,
    default: () => {
      /* Do nothing */
    },
  })
  public readonly onSelectOperation!: (sequence: number) => void;
  @Prop({ type: Array, default: [] })
  public readonly displayedOperations!: number[];
  @Prop({ type: Function }) public readonly message!: MessageProvider;
  @Prop({ type: Boolean, default: false })
  public readonly operationContextEnabled!: boolean;

  private isViewerMode = (this as any).$isViewerMode
    ? (this as any).$isViewerMode
    : false;

  private selectedSequences: number[] = [];
  private checkedSequences: number[] = [];

  private isPurposeFilterEnabled = false;
  private isNoteFilterEnabled = false;

  private contextMenuOpened = false;
  private contextMenuX = -1;
  private contextMenuY = -1;
  private contextMenuInfo: { sequence: number; selectedSequences: number[] } = {
    sequence: -1,
    selectedSequences: [],
  };

  private checkedItems: HistoryItemForDisplay[] = [];
  private search = "";
  private page: number = 1;
  private itemsPerPage: number = 100;
  private itemsPerPageOptions: number[] = [100, 200, 500, 1000];
  private sortBy = "operation.sequence";
  private sortDesc = false;

  private get headers(): {
    text: string;
    value: string;
    class?: string;
    width?: string;
    sortable?: boolean;
  }[] {
    return [
      {
        text: this.message("operation.sequence"),
        value: "operation.sequence",
        width: "70",
        class: "seq-col",
      },
      {
        text: "",
        value: "notes",
        class: "icon-col",
        width: "90",
        sortable: false,
      },
      { text: this.message("operation.title"), value: "operation.title" },
      {
        text: this.message("operation.tagname"),
        value: "operation.elementInfo.tagname",
      },
      {
        text: this.message("operation.name"),
        value: "operation.elementInfo.attributes.name",
      },
      {
        text: this.message("operation.text"),
        value: "operation.elementInfo.text",
      },
      { text: this.message("operation.type"), value: "operation.type" },
      { text: this.message("operation.input"), value: "operation.inputValue" },
      {
        text: this.message("operation.timestamp"),
        value: "operation.timestamp",
      },
    ];
  }

  created() {
    this.initializeSelectedSequences();
  }

  mounted(): void {
    document.addEventListener("keydown", this.keyDown);
  }

  beforeDestroy(): void {
    document.removeEventListener("keydown", this.keyDown);
  }

  private createCssClassForRow(itemIndex: number) {
    return {
      selected: this.selectedOperationIndexes.includes(itemIndex),
      marked: this.autoOperationIndexes.includes(itemIndex),
      disabled: this.disabledOperationIndexes.includes(itemIndex),
    };
  }

  @Watch("selectedOperationSequence")
  private initializeSelectedSequences() {
    this.selectedSequences = [this.selectedOperationSequence];
  }

  private formatTimestamp(epochMilliseconds: string) {
    return new TimestampImpl(epochMilliseconds).format("HH:mm:ss");
  }

  private onSelectOperations(...indexes: number[]) {
    this.selectedSequences = indexes.map((index) => index + 1);

    this.onSelectOperation(this.selectedSequences[0]);
  }

  private openOperationContextMenu(target: {
    itemIndex: number;
    x: number;
    y: number;
  }) {
    if ((this as any).$isViewerMode || !this.operationContextEnabled) {
      return;
    }

    this.contextMenuOpened = false;

    // for close and  open animation.
    this.$nextTick(() => {
      this.resetPosition();
      setTimeout(() => {
        this.contextMenuX = target.x;
        this.contextMenuY = target.y;
        this.contextMenuInfo = {
          sequence: target.itemIndex + 1,
          selectedSequences: this.selectedSequences,
        };
        this.contextMenuOpened = true;
      }, 100);
    });
  }

  private get selectedOperationIndexes() {
    return this.selectedSequences.map((sequence) => sequence - 1);
  }

  private get autoOperationIndexes() {
    const autoOperationIndexes = [];
    for (const [index, { operation }] of this.history.entries()) {
      if (operation.isAutomatic) {
        autoOperationIndexes.push(index);
      }
    }
    console.log(autoOperationIndexes);
    return autoOperationIndexes;
  }

  private get disabledOperationIndexes() {
    const disabledIndexes = [];
    let isCounting = false;

    for (const [index, { operation }] of this.history.entries()) {
      if (operation.type === "pause_capturing") {
        isCounting = true;
        continue;
      }

      if (["resume_capturing", "start_capturing"].includes(operation.type)) {
        isCounting = false;
        continue;
      }

      if (isCounting) {
        disabledIndexes.push(index);
      }
    }

    return disabledIndexes;
  }

  private get displayedHistoryItems(): HistoryItemForDisplay[] {
    const items = this.history.map((operationWithNotes, index) => {
      const elementInfo = operationWithNotes.operation.elementInfo;

      const elementInfoForDisplay: ElementInfoForDisplay = {
        tagname: elementInfo?.tagname ?? "",
        text: elementInfo ? elementInfo.text ?? elementInfo.value ?? "" : "",
        attributes: { ...elementInfo?.attributes },
        xpath: elementInfo?.xpath ?? "",
        iframeIndex: elementInfo?.iframe?.index,
      };

      const operation: OperationForDisplay = {
        ...operationWithNotes.operation,
        inputValue: operationWithNotes.operation.inputValue,
        elementInfo: elementInfoForDisplay,
      };

      const notes = {
        bugs: operationWithNotes.bugs ?? [],
        notices: operationWithNotes.notices ?? [],
        intention: operationWithNotes.intention,
      };

      return { index, operation, notes };
    });

    const filteredItems = filterTableRows(items, [
      this.displayedOperationFilterPredicate,
      this.textFilterPredicate,
      this.noteFilterPredicate,
    ]);

    return sortTableRows(filteredItems, this.sortBy, this.sortDesc);
  }

  private get getCheckedItems(): {
    index: number;
    operation: OperationForGUI;
  }[] {
    return this.$store.state.operationHistory.checkedOperations;
  }

  private displayedOperationFilterPredicate(item: HistoryItemForDisplay) {
    if (this.displayedOperations.length === 0) {
      return true;
    }

    return this.displayedOperations.includes(item.operation.sequence);
  }

  private noteFilterPredicate(item: HistoryItemForDisplay): boolean {
    if (!this.isNoteFilterEnabled && !this.isPurposeFilterEnabled) {
      return true;
    }
    if (this.isNoteFilterEnabled && (item.notes.notices?.length ?? 0 > 0)) {
      return true;
    }
    if (this.isPurposeFilterEnabled && item.notes.intention) {
      return true;
    }

    return false;
  }

  private textFilterPredicate(item: HistoryItemForDisplay): boolean {
    const search = this.search;

    if (
      item.operation.sequence.toString().toLowerCase().indexOf(search) !== -1
    ) {
      return true;
    }
    if (item.operation.title.indexOf(search) !== -1) {
      return true;
    }
    const elementInfo = item.operation.elementInfo;
    if (elementInfo !== null) {
      if (elementInfo.tagname && elementInfo.tagname.indexOf(search) !== -1) {
        return true;
      }
      if (
        elementInfo.attributes.name &&
        elementInfo.attributes.name.indexOf(search) !== -1
      ) {
        return true;
      }
      if (elementInfo.text && elementInfo.text.indexOf(search) !== -1) {
        return true;
      }
    }
    if (item.operation.type.indexOf(search) !== -1) {
      return true;
    }
    if (item.operation.input.indexOf(search) !== -1) {
      return true;
    }
    return false;
  }

  @Watch("getCheckedItems")
  private clearCheckedItems(
    newValue: {
      index: number;
      operation: OperationForGUI;
    }[]
  ): void {
    if (newValue.length === 0 && this.checkedItems.length !== 0) {
      this.checkedItems = [];
    }
  }

  @Watch("checkedItems")
  private updateCheckedOperationList(): void {
    const checkedOperations = this.checkedItems.map(({ index, operation }) => {
      return { index, operation };
    });
    this.$store.commit("operationHistory/setCheckedOperations", {
      checkedOperations,
    });
  }

  private contextmenu(itemIndex: number, event: MouseEvent) {
    event.preventDefault();
    this.openOperationContextMenu({
      itemIndex: (this.page - 1) * this.itemsPerPage + itemIndex,
      x: event.clientX,
      y: event.clientY,
    });
  }

  private cancelKeydown(event: Event) {
    event.stopPropagation();
  }

  private keyDown(event: KeyboardEvent): void {
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
    const destItem = this.displayedHistoryItems[this.currentItemIndex - 1];

    if (destItem) {
      this.onSelectOperations(destItem.index);
      this.switchTablePage(destItem.index);
    }
  }

  private next() {
    const destItem = this.displayedHistoryItems[this.currentItemIndex + 1];

    if (destItem) {
      this.onSelectOperations(destItem.index);
      this.switchTablePage(destItem.index);
    }
  }

  private switchTablePage(itemIndex: number) {
    const itemsPerPage =
      this.itemsPerPage > 0
        ? this.itemsPerPage
        : this.displayedHistoryItems.length;

    this.page = Math.floor(itemIndex / itemsPerPage) + 1;
  }

  private scrollToTableRow(itemIndex: number) {
    const itemsPerPage =
      this.itemsPerPage > 0
        ? this.itemsPerPage
        : this.displayedHistoryItems.length;

    const rowHeight = 29;

    this.$vuetify.goTo(rowHeight * Math.floor(itemIndex % itemsPerPage), {
      container: ".v-data-table__wrapper:first-child",
      duration: 100,
    });
  }

  private pageForward() {
    const destIndex = this.currentItemIndex + this.itemsPerPage;
    const destItem =
      this.displayedHistoryItems[
        destIndex > this.displayedHistoryItems.length - 1
          ? this.displayedHistoryItems.length - 1
          : destIndex
      ];

    if (destItem) {
      this.onSelectOperations(destItem.index);
      this.page++;
    }
  }

  private pageBack() {
    const destIndex = this.currentItemIndex - this.itemsPerPage;
    const destItem = this.displayedHistoryItems[destIndex < 0 ? 0 : destIndex];

    if (destItem) {
      this.onSelectOperations(destItem.index);
      this.page--;
    }
  }

  private get currentItemIndex() {
    return this.displayedHistoryItems.findIndex(
      ({ index }) => index === this.selectedOperationIndexes[0]
    );
  }

  private get displayedHistoryStr() {
    return JSON.stringify(this.displayedHistoryItems);
  }

  @Watch("itemsPerPage")
  @Watch("selectedOperationIndexes")
  @Watch("displayedHistoryStr")
  private resetPosition() {
    const currentItemIndex = this.selectedOperationIndexes[0];

    const itemIndex = this.displayedHistoryItems.findIndex(
      ({ index }) => index === currentItemIndex
    );

    if (itemIndex !== -1) {
      this.switchTablePage(itemIndex);
      this.scrollToTableRow(itemIndex);
    }
  }
}
</script>

<style lang="sass" scoped>
td
  height: inherit !important

.ellipsis
  overflow: hidden
  white-space: nowrap
  text-overflow: ellipsis
  max-width: 150px

#operation-list
  position: relative

#operation-search
  position: relative

.icon-col
  padding: 0 !important

.seq-col
  padding-right: 0px !important

.search-checkbox
  flex: none
  transform: scale(0.9)

.search-title
  color: rgba(0,0,0,0.54)
</style>

<style lang="sass">
#operation-search
  .v-text-field__details
    display: none

.icon-col
  padding: 0 !important

.seq-col
  padding-right: 8px !important

.marked
  color: #44A
  background-color: #F3F3FF

.disabled
  color: #888
  font-style: italic
  background-color: rgba(0,0,0,0.12)

.selected
  background-color: lemonchiffon !important
  font-weight: bold
  color: chocolate
</style>
