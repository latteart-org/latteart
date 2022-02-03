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
  <v-layout
    id="operation-list"
    align-space-around
    justify-space-between
    column
    fill-height
  >
    <v-layout align-center style="height: 40px">
      <v-btn @click="resetFilter" color="info" small>{{
        message("operation.reset")
      }}</v-btn>
    </v-layout>
    <v-layout
      align-space-around
      justify-end
      column
      fill-height
      style="height: calc(100% - 90px)"
    >
      <v-flex
        xs12
        :style="{ height: '100%', 'overflow-y': 'scroll' }"
        ref="tableWrapper"
      >
        <v-data-table
          :headers="headers"
          :custom-filter="filterBySequence"
          :search="search"
          :items="displayedHistory"
          :pagination.sync="pagination"
        >
          <template v-slot:items="props">
            <tr
              @click.exact="
                onSelectOperation(props.item.operation.sequence);
                selectedSequences = [];
              "
              @click.shift="
                onSelectOperationRange(props.item.operation.sequence)
              "
              @contextmenu="
                openOperationContextMenu(
                  props.item.operation.sequence,
                  selectedSequences,
                  $event
                )
              "
              :class="{
                selected:
                  selectedOperationSequence === props.item.operation.sequence ||
                  selectedSequences.includes(props.item.operation.sequence),
                'py-0': true,
                'my-0': true,
                'disabled-operation': operationIsDisabled(
                  props.item.operation.sequence
                ),
              }"
              :key="props.index"
              :id="`operation-list-row-${props.item.operation.sequence}`"
              :ref="'rows_' + props.index + '_' + props.item.operation.sequence"
            >
              <td class="seq-col">
                {{ props.item.operation.sequence }}
              </td>
              <td class="icon-col">
                <v-icon
                  v-if="hasIntention(props.item.intention)"
                  :title="message('app.intention')"
                  class="mx-1"
                  color="blue"
                  >event_note</v-icon
                >
                <v-icon
                  v-if="hasNote(props.item.notices, props.item.bugs)"
                  :title="message('app.note')"
                  class="mx-1"
                  color="purple lighten-3"
                  >announcement</v-icon
                >
              </td>
              <td :title="props.item.operation.title" class="ellipsis">
                {{
                  props.item.operation.title
                    ? props.item.operation.title.substring(0, 60)
                    : ""
                }}
              </td>
              <td
                :title="
                  !!props.item.operation.elementInfo
                    ? props.item.operation.elementInfo.tagname
                    : ''
                "
                class="ellipsis"
              >
                {{
                  !!props.item.operation.elementInfo
                    ? props.item.operation.elementInfo.tagname
                    : ""
                }}
              </td>
              <td
                :title="
                  !!props.item.operation.elementInfo
                    ? props.item.operation.elementInfo.attributes.name || ''
                    : ''
                "
                class="ellipsis"
              >
                {{
                  !!props.item.operation.elementInfo
                    ? props.item.operation.elementInfo.attributes.name || ""
                    : ""
                }}
              </td>
              <td
                :title="
                  !!props.item.operation.elementInfo
                    ? props.item.operation.elementInfo.text || ''
                    : ''
                "
                class="ellipsis"
              >
                {{
                  !!props.item.operation.elementInfo
                    ? props.item.operation.elementInfo.text
                      ? props.item.operation.elementInfo.text.substring(0, 60)
                      : ""
                    : ""
                }}
              </td>
              <td :title="props.item.operation.type" class="ellipsis">
                {{ props.item.operation.type }}
              </td>
              <td :title="props.item.operation.inputValue" class="ellipsis">
                {{ props.item.operation.inputValue.substring(0, 60) }}
              </td>
              <td
                :title="formatTimestamp(props.item.operation.timestamp)"
                class="ellipsis"
              >
                {{ formatTimestamp(props.item.operation.timestamp) }}
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>

    <v-layout id="operation-search" style="height: 50px">
      <v-text-field
        v-model="search"
        prepend-inner-icon="search"
        :label="message('operation.query')"
      ></v-text-field>
    </v-layout>

    <operation-context-menu
      :opened="contextMenuOpened"
      :x="contextMenuX"
      :y="contextMenuY"
      :operationInfo="contextMenuInfo"
      @operationContextMenuClose="contextMenuOpened = false"
    />
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import {
  OperationWithNotes,
  OperationHistory,
  MessageProvider,
  ElementInfo,
} from "@/lib/operationHistory/types";
import moment from "moment";
import OperationContextMenu from "@/vue/pages/captureControl/historyView/OperationContextMenu.vue";
import { Note } from "@/lib/operationHistory/Note";
import { Operation } from "@/lib/operationHistory/Operation";

@Component({
  components: {
    "operation-context-menu": OperationContextMenu,
  },
})
export default class OperationList extends Vue {
  @Prop({ type: Array, default: [] })
  public readonly history!: OperationHistory;
  @Prop({ type: Number, default: -1 })
  public readonly selectedOperationSequence!: number;
  @Prop({ type: Function, default: -1 }) public readonly onSelectOperation!: (
    sequence: string
  ) => void;
  @Prop({ type: Array, default: [] })
  public readonly displayedOperations!: number[];
  @Prop({ type: Function }) public readonly onResetFilter!: () => void;
  @Prop({ type: Function }) public readonly message!: MessageProvider;
  @Prop({ type: Boolean, default: false })
  public readonly operationContextEnabled!: boolean;

  private rowsInfo: { index: number; sequence: number }[] = [];
  private beforeTableOperationAtPageDownOrPageUp:
    | null
    | "ArrowUp"
    | "ArrowDown"
    | "ArrowLeft"
    | "ArrowRight" = null;
  private pageDownOrPageUpByTableOperation: null | "pageUp" | "pageDown" = null;
  private beforeIndex = -1;

  private search = "";
  private selectedSequences: number[] = [];
  private pagination: {
    descending: boolean;
    page: number;
    rowsPerPage: number;
    sortBy: string;
    totalItems?: number;
  } = {
    sortBy: "operation.sequence",
    descending: true,
    page: 1,
    rowsPerPage: 10,
  };
  private contextMenuOpened = false;
  private contextMenuX = -1;
  private contextMenuY = -1;
  private contextMenuInfo: { sequence: number; selectedSequences: number[] } = {
    sequence: -1,
    selectedSequences: [],
  };

  mounted(): void {
    document.addEventListener("keydown", this.keyDown);
  }

  beforeDestroy(): void {
    document.removeEventListener("keydown", this.keyDown);
  }

  updated(): void {
    this.$nextTick().then(() => {
      this.setRowsInfo();
      this.setSelectedOperationSequenceAtChangingPage();
    });
  }

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
        value: "",
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
      { text: this.message("operation.input"), value: "operation.input" },
      {
        text: this.message("operation.timestamp"),
        value: "operation.timestamp",
      },
    ];
  }

  @Watch("displayedOperations")
  private onChagneDisplayedOperations() {
    // If the displayed operation is narrowed down, be sure to view the first page.
    this.pagination.page = 1;
  }

  private setRowsInfo(): void {
    const result = [];
    for (const key in this.$refs) {
      if (this.$refs[key] && key.startsWith("rows_")) {
        const indexAndSeq = key.split("_");
        result.push({
          index: Number(indexAndSeq[1]),
          sequence: Number(indexAndSeq[2]),
        });
      }
    }
    this.rowsInfo = result;
  }

  private setSelectedOperationSequenceAtChangingPage(): void {
    const current = this.rowsInfo.find((rowInfo) => {
      return rowInfo.sequence === this.selectedOperationSequence;
    });
    if (current) {
      return;
    }
    let target;
    switch (this.beforeTableOperationAtPageDownOrPageUp) {
      case "ArrowUp":
        target = this.rowsInfo[this.rowsInfo.length - 1].sequence;
        break;
      case "ArrowDown":
        target = this.rowsInfo[0].sequence;
        break;
      case "ArrowLeft":
        target = this.rowsInfo[this.beforeIndex].sequence;
        break;
      case "ArrowRight":
        target = this.rowsInfo[this.beforeIndex]
          ? this.rowsInfo[this.beforeIndex].sequence
          : this.rowsInfo[this.rowsInfo.length - 1].sequence;
        break;
      default:
        return;
    }
    if (!target) {
      return;
    }

    this.$store.commit("operationHistory/selectOperation", {
      sequence: target,
    });

    this.$nextTick(() => {
      const tableWrapper = this.$refs.tableWrapper as HTMLElement;
      const row = document.getElementById(
        `operation-list-row-${this.selectedOperationSequence}`
      );
      if (!row) {
        return;
      }

      switch (this.beforeTableOperationAtPageDownOrPageUp) {
        case "ArrowUp":
          if (this.pageDownOrPageUpByTableOperation === "pageDown") {
            this.showRowBottom(tableWrapper, row);
          } else {
            if (!this.appearCurrentRow(tableWrapper, row)) {
              this.showRowTop(tableWrapper, row);
            }
          }
          break;
        case "ArrowDown":
          if (this.pageDownOrPageUpByTableOperation === "pageUp") {
            this.showRowTop(tableWrapper, row);
          } else {
            if (!this.appearCurrentRow(tableWrapper, row)) {
              this.showRowBottom(tableWrapper, row);
            }
          }
          break;
        case "ArrowLeft":
          // none
          break;
        case "ArrowRight":
          if (!this.rowsInfo[this.beforeIndex]) {
            this.showRowBottom(tableWrapper, row);
          }
          break;
        default:
          return;
      }
      this.beforeIndex = -1;
      this.beforeTableOperationAtPageDownOrPageUp = null;
      this.pageDownOrPageUpByTableOperation = null;
    });
  }

  private appearCurrentRow(
    tableWrapper: HTMLElement,
    row: HTMLElement
  ): boolean {
    const showedTopLine = tableWrapper.scrollTop;
    const showedBottomLine = showedTopLine + tableWrapper.clientHeight;

    const rowTopline = row.offsetTop;
    const rowBottomLine = rowTopline + row.clientHeight;

    return showedTopLine <= rowTopline && rowBottomLine <= showedBottomLine;
  }

  private showRowTop(tableWrapper: HTMLElement, row: HTMLElement): void {
    tableWrapper.scrollTop = row.offsetTop;
  }

  private showRowBottom(tableWrapper: HTMLElement, row: HTMLElement): void {
    tableWrapper.scrollTop =
      row.offsetTop - (tableWrapper.clientHeight - row.clientHeight);
  }

  private pageUp() {
    if (!this.pagination.totalItems) {
      return;
    }
    if (
      Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage) <=
      this.pagination.page
    ) {
      return;
    }
    this.pagination = { ...this.pagination, page: this.pagination.page + 1 };
    this.pageDownOrPageUpByTableOperation = "pageUp";
  }

  private pageDown() {
    if (this.pagination.page <= 1) {
      return;
    }
    this.pagination = { ...this.pagination, page: this.pagination.page - 1 };
    this.pageDownOrPageUpByTableOperation = "pageDown";
  }

  private keyDown(event: KeyboardEvent): void {
    event.preventDefault();
    const getIndex = (rowInfo: { index: number; sequence: number }) => {
      return rowInfo.sequence === this.selectedOperationSequence;
    };

    let target;
    if (event.key === "ArrowUp") {
      this.beforeTableOperationAtPageDownOrPageUp = "ArrowUp";
      const currentIndex = this.rowsInfo.findIndex(getIndex);
      if (this.rowsInfo[currentIndex - 1]) {
        target = this.rowsInfo[currentIndex - 1].sequence;
      } else {
        this.pageDown();
        return;
      }
    } else if (event.key === "ArrowDown") {
      this.beforeTableOperationAtPageDownOrPageUp = "ArrowDown";
      const currentIndex = this.rowsInfo.findIndex(getIndex);
      if (this.rowsInfo[currentIndex + 1]) {
        target = this.rowsInfo[currentIndex + 1].sequence;
      } else {
        this.pageUp();
        return;
      }
    } else if (event.key === "ArrowLeft") {
      this.beforeTableOperationAtPageDownOrPageUp = "ArrowLeft";
      this.beforeIndex = this.rowsInfo.findIndex(getIndex);
      this.pageDown();
      return;
    } else if (event.key === "ArrowRight") {
      this.beforeTableOperationAtPageDownOrPageUp = "ArrowRight";
      this.beforeIndex = this.rowsInfo.findIndex(getIndex);
      this.pageUp();
      return;
    } else {
      return;
    }

    this.$store.commit("operationHistory/selectOperation", {
      sequence: target,
    });
    this.$nextTick().then(() => {
      const tableWrapper = this.$refs.tableWrapper as HTMLElement;
      const row = document.getElementById(
        `operation-list-row-${this.selectedOperationSequence}`
      );

      if (row && !this.appearCurrentRow(tableWrapper, row)) {
        if (this.beforeTableOperationAtPageDownOrPageUp === "ArrowUp") {
          this.showRowTop(tableWrapper, row);
        } else if (
          this.beforeTableOperationAtPageDownOrPageUp === "ArrowDown"
        ) {
          this.showRowBottom(tableWrapper, row);
        }
      }
      this.beforeTableOperationAtPageDownOrPageUp = null;
    });
  }

  private hasIntention(intention: Note | null): boolean {
    return !!intention;
  }

  private hasNote(notices: Note[] | null, bugs: Note[] | null): boolean {
    if (!!notices && notices.length > 0) {
      return true;
    }
    if (!!bugs && bugs.length > 0) {
      return true;
    }
    return false;
  }

  private formatTimestamp(epochMilliseconds: string) {
    return moment(Number(epochMilliseconds)).format("HH:mm:ss");
  }

  private filterBySequence(items: OperationHistory) {
    if (this.displayedOperations.length === 0) {
      return items.filter((item) => {
        if (this.isTextContains(this.search, item)) {
          return true;
        }
        return false;
      });
    }
    return items.filter((item) => {
      if (this.displayedOperations.indexOf(item.operation.sequence) !== -1) {
        if (this.isTextContains(this.search, item)) {
          return true;
        }
      }
      return false;
    });
  }

  private isTextContains(search: string, item: OperationWithNotes): boolean {
    if (item.operation.sequence.toString().indexOf(search) !== -1) {
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

  private resetFilter() {
    this.onResetFilter();
  }

  private onSelectOperationRange(sequence: string) {
    this.selectedSequences = [];
    if (
      !this.selectedOperationSequence ||
      this.selectedOperationSequence <= 0
    ) {
      this.onSelectOperation(sequence);
      return;
    }
    const currentSequence = Number(sequence);
    if (currentSequence < this.selectedOperationSequence) {
      for (let i = currentSequence; i <= this.selectedOperationSequence; i++) {
        this.selectedSequences.push(i);
      }
    } else if (this.selectedOperationSequence < currentSequence) {
      for (let i = this.selectedOperationSequence; i <= currentSequence; i++) {
        this.selectedSequences.push(i);
      }
    }
  }

  private openOperationContextMenu(
    sequence: number,
    selectedSequences: number[],
    e: MouseEvent
  ) {
    if ((this as any).$isViewerMode || !this.operationContextEnabled) {
      return;
    }

    e.preventDefault();
    this.contextMenuOpened = false;

    // for close and  open animation.
    this.$nextTick(() => {
      setTimeout(() => {
        this.contextMenuX = e.clientX;
        this.contextMenuY = e.clientY;
        this.contextMenuInfo = { sequence, selectedSequences };
        this.contextMenuOpened = true;
      }, 100);
    });
  }

  private operationIsDisabled(sequence: number) {
    return this.history
      .filter(({ operation }) => {
        return ["pause_capturing", "resume_capturing"].includes(operation.type);
      })
      .reduce((acc: number[][], { operation }) => {
        if (operation.type === "pause_capturing") {
          acc.push([]);
        }

        acc[acc.length - 1].push(operation.sequence);

        return acc;
      }, [])
      .some(([begin, end]) => {
        return sequence > begin && (end === undefined || sequence < end);
      });
  }

  private get displayedHistory(): OperationHistory {
    return this.history.map((operationWithNotes) => {
      if (!operationWithNotes.operation.elementInfo) {
        return operationWithNotes;
      }

      const elementInfo = operationWithNotes.operation.elementInfo;

      const elementInfoForDisplay: ElementInfo = {
        tagname: elementInfo.tagname,
        text: elementInfo.text
          ? elementInfo.text
          : elementInfo.value
          ? elementInfo.value
          : "",
        xpath: elementInfo.xpath,
        value: elementInfo.value,
        checked: elementInfo.checked,
        attributes: elementInfo.attributes,
      };

      return {
        operation: Operation.createFromOtherOperation({
          other: operationWithNotes.operation,
          overrideParams: {
            elementInfo: elementInfoForDisplay,
          },
        }),
        bugs: operationWithNotes.bugs,
        notices: operationWithNotes.notices,
        intention: operationWithNotes.intention,
      };
    });
  }
}
</script>

<style lang="sass" scoped>
table tr
  transition: background 0s !important

td
  height: 30px !important

.ellipsis
  overflow: hidden
  white-space: nowrap
  text-overflow: ellipsis
  max-width: 150px
.selected
  background-color: lemonchiffon !important

  td
    font-weight: bold
    color: chocolate

#operation-list
  position: relative

#operation-search
  position: relative

.disabled-operation
  color: #888
  font-style: italic
  background-color: rgba(0,0,0,0.12)

.icon-col
  padding: 0 !important

.seq-col
  padding-right: 8px !important
</style>

<style lang="sass">
#operation-search
  .v-text-field__details
    display: none

.icon-col
  padding: 0 !important

.seq-col
  padding-right: 8px !important
</style>
