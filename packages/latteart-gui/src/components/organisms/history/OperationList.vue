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
    <v-row align-content="space-around" justify="end" style="height: calc(100% - 90px)" no-gutters>
      <v-col cols="12" :style="{ height: '100%' }">
        <v-container fluid class="fill-height">
          <v-data-table
            v-model:sort-by="sortBy"
            v-model="checkedItems"
            v-model:page="page"
            v-model:items-per-page="itemsPerPage"
            :row-props="appendClass"
            height="calc(100% - 59px)"
            :style="{ height: '100%', width: '100%' }"
            density="compact"
            fixed-header
            :show-select="!isViewerMode"
            item-key="operation.sequence"
            :custom-sort="(items: any) => items"
            must-sort
            :headers="headers"
            :items="displayedHistoryItems"
            :search="search"
            :footer-props="{ 'items-per-page-options': itemsPerPageOptions }"
            @click:row="(_: any, obj: any) => onSelectOperations(obj.item.index)"
            @contextmenu:row="
              (event: MouseEvent, item: any) => contextmenu(item.item.operation.sequence, event)
            "
          >
            <template #[`header.data-table-select`]>
              <v-checkbox-btn
                :model-value="checkboxStatus.allChecked"
                :true-value="true"
                :false-value="false"
                :indeterminate="checkboxStatus.indeterminate"
                @input="checkAllItems"
              />
            </template>
            <template #[`item.data-table-select`]="props">
              <td>
                <v-checkbox-btn
                  :model-value="checkedItems.includes(props.item.index)"
                  :true-value="true"
                  :false-value="false"
                  class="item-checkbox"
                  @input="updateCheckedItem(props.item.index)"
                />
              </td>
            </template>

            <template #[`item.operation.sequence`]="{ item }">
              <td :class="`sequence_${item.operation.sequence}`">
                {{ item.operation.sequence }}
              </td>
            </template>

            <template #[`item.notes`]="{ item }">
              <td>
                <v-icon v-if="item.notes.intention" :title="message('app.intention')" color="blue"
                  >event_note</v-icon
                >
                <v-icon
                  v-if="item.notes.notices.length + item.notes.bugs.length > 0"
                  :title="message('app.note')"
                  color="purple-lighten-3"
                  >announcement</v-icon
                >
              </td>
            </template>

            <template #[`item.operation.title`]="{ item }">
              <td :title="item.operation.title" :class="{ ellipsis: true }">
                {{ item.operation.title.substring(0, 60) }}
              </td>
            </template>

            <template #[`item.operation.elementInfo.tagname`]="{ item }">
              <td :title="item.operation.elementInfo.tagname" :class="{ ellipsis: true }">
                {{ item.operation.elementInfo.tagname }}
              </td>
            </template>

            <template #[`item.operation.elementInfo.attributes.name`]="{ item }">
              <td :title="item.operation.elementInfo.attributes.name" :class="{ ellipsis: true }">
                {{ item.operation.elementInfo.attributes.name }}
              </td>
            </template>

            <template #[`item.operation.elementInfo.text`]="{ item }">
              <td :title="item.operation.elementInfo.text" :class="{ ellipsis: true }">
                {{ item.operation.elementInfo.text.substring(0, 60) }}
              </td>
            </template>

            <template #[`item.operation.type`]="{ item }">
              <td :title="item.operation.type" :class="{ ellipsis: true }">
                {{ item.operation.type }}
              </td>
            </template>

            <template #[`item.operation.inputValue`]="{ item }">
              <td :title="item.operation.inputValue" :class="{ ellipsis: true }">
                {{ item.operation.inputValue.substring(0, 60) }}
              </td>
            </template>

            <template #[`item.operation.timestamp`]="{ item }">
              <td :title="formatTimestamp(item.operation.timestamp)" :class="{ ellipsis: true }">
                {{ formatTimestamp(item.operation.timestamp) }}
              </td>
            </template>
          </v-data-table>
        </v-container>
      </v-col>
    </v-row>

    <v-col cols="12">
      <v-row id="operation-search" style="height: 50px" @keydown="cancelKeydown">
        <span class="search-title pt-5 pl-4"
          ><v-icon>search</v-icon>{{ message("operation.search") }}</span
        >
        <v-checkbox
          v-model="isPurposeFilterEnabled"
          class="search-checkbox pl-4"
          :label="message('operation.purpose')"
        ></v-checkbox>
        <v-checkbox
          v-model="isNoteFilterEnabled"
          class="search-checkbox"
          :label="message('operation.notice')"
        ></v-checkbox>
        <v-text-field
          v-model="search"
          variant="underlined"
          class="pl-4"
          :label="message('operation.query')"
        ></v-text-field>
      </v-row>
    </v-col>

    <operation-context-menu
      :opened="contextMenuOpened"
      :x="contextMenuX"
      :y="contextMenuY"
      :operation-info="contextMenuInfo"
      @operation-context-menu-close="contextMenuOpened = false"
    />
  </v-row>
</template>

<script lang="ts">
import type { OperationHistory, MessageProvider } from "@/lib/operationHistory/types";
import OperationContextMenu from "./OperationContextMenu.vue";
import { NoteForGUI } from "@/lib/operationHistory/NoteForGUI";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { TimestampImpl } from "@/lib/common/Timestamp";
import AutoOperationRegisterButton from "./AutoOperationRegisterButton.vue";
import { filterTableRows, sortTableRows } from "@/lib/common/table";
import {
  computed,
  defineComponent,
  ref,
  toRefs,
  nextTick,
  inject,
  onMounted,
  onBeforeUnmount,
  watch
} from "vue";
import type { PropType } from "vue";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useGoTo } from "vuetify";

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

export default defineComponent({
  components: {
    "operation-context-menu": OperationContextMenu,
    "auto-operation-register-button": AutoOperationRegisterButton
  },
  props: {
    history: {
      type: Array as PropType<OperationHistory>,
      default: () => [],
      required: true
    },
    selectedOperationInfo: {
      type: Object as PropType<{ sequence: number; doScroll: boolean }>,
      required: true
    },
    onSelectOperation: {
      type: Function as PropType<(sequence: number, doScroll: boolean) => void>,
      default: () => {
        /* Do nothing */
      },
      required: true
    },
    displayedOperations: {
      type: Array as PropType<number[]>,
      default: () => [],
      required: true
    },
    message: { type: Function as PropType<MessageProvider>, required: true },
    operationContextEnabled: { type: Boolean, default: false, required: true }
  },
  setup(props) {
    const operationHistoryStore = useOperationHistoryStore();

    const isViewerMode = inject("isViewerMode") ?? false;

    const selectedSequences = ref<number[]>([]);

    const isPurposeFilterEnabled = ref(false);
    const isNoteFilterEnabled = ref(false);

    const contextMenuOpened = ref(false);
    const contextMenuX = ref(-1);
    const contextMenuY = ref(-1);
    const contextMenuInfo = ref<{
      sequence: number;
      selectedSequences: number[];
    }>({
      sequence: -1,
      selectedSequences: []
    });

    const checkedItems = ref<number[]>([]);
    const search = ref("");
    const page = ref<number>(1);
    const itemsPerPage = ref<number>(100);
    const itemsPerPageOptions = ref<number[]>([100, 200, 500, 1000]);
    const sortBy = ref<{ key: string; order: "asc" | "desc" }[]>([
      { key: "operation.sequence", order: "asc" }
    ]);

    const numberOfDisplayedItems = computed(() => {
      return itemsPerPage.value === -1 ? displayedHistoryItems.value.length : itemsPerPage.value;
    });

    const updateCheckedItem = (index: number) => {
      if (!checkedItems.value.includes(index)) {
        checkedItems.value = [...checkedItems.value, index];
      } else {
        checkedItems.value = checkedItems.value.filter((n) => n !== index);
      }
    };

    const checkAllItems = () => {
      const start = (page.value - 1) * numberOfDisplayedItems.value;
      const _end = start + (numberOfDisplayedItems.value - 1);
      const end =
        _end > displayedHistoryItems.value.length ? displayedHistoryItems.value.length - 1 : _end;
      const items: number[] = [];
      const add = !checkboxStatus.value.allChecked;
      for (let i = start; i <= end; i++) {
        const index = displayedHistoryItems.value[i].index;
        if (!checkedItems.value.includes(index)) {
          if (add) {
            items.push(index);
          }
        } else {
          if (!add) {
            items.push(index);
          }
        }
      }
      checkedItems.value = add
        ? [...checkedItems.value, ...items]
        : checkedItems.value.filter((n) => !items.includes(n));
    };

    const checkboxStatus = computed(() => {
      const start = (page.value - 1) * numberOfDisplayedItems.value;
      const _end = start + (numberOfDisplayedItems.value - 1);
      const end =
        _end > displayedHistoryItems.value.length ? displayedHistoryItems.value.length - 1 : _end;
      let include = false;
      let notInclude = false;
      for (let i = start; i <= end; i++) {
        const index = displayedHistoryItems.value[i].index;
        if (checkedItems.value.includes(index)) {
          include = true;
        } else {
          notInclude = true;
        }
        if (include && notInclude) {
          break;
        }
      }
      return {
        allChecked: !notInclude,
        indeterminate: include && notInclude
      };
    });

    const headers = computed(
      (): {
        title: string;
        value: string;
        width?: string;
        sortable?: boolean;
      }[] => {
        return [
          {
            title: props.message("operation.sequence"),
            value: "operation.sequence",
            width: "70"
          },
          {
            title: "",
            value: "notes",
            width: "90",
            sortable: false
          },
          { title: props.message("operation.title"), value: "operation.title", sortable: true },
          {
            title: props.message("operation.tagname"),
            value: "operation.elementInfo.tagname",
            sortable: true
          },
          {
            title: props.message("operation.name"),
            value: "operation.elementInfo.attributes.name",
            sortable: true
          },
          {
            title: props.message("operation.text"),
            value: "operation.elementInfo.text",
            sortable: true
          },
          { title: props.message("operation.type"), value: "operation.type", sortable: true },
          {
            title: props.message("operation.input"),
            value: "operation.inputValue",
            sortable: true
          },
          {
            title: props.message("operation.timestamp"),
            value: "operation.timestamp",
            sortable: true
          }
        ];
      }
    );

    const appendClass = (obj: any) => {
      return {
        class: `${selectedOperationIndexes.value.includes(obj.item.index) ? "selected" : ""} ${
          autoOperationIndexes.value.includes(obj.item.index) ? "marked" : ""
        } ${disabledOperationIndexes.value.includes(obj.item.index) ? "disabled" : ""}`
      };
    };

    const initializeSelectedSequences = () => {
      selectedSequences.value = [props.selectedOperationInfo.sequence];
      if (!props.selectedOperationInfo.doScroll) {
        return;
      }

      const index = displayedHistoryItems.value.findIndex(
        (item) => item.operation.sequence === props.selectedOperationInfo.sequence
      );
      if (index === undefined) {
        return;
      }

      page.value = Math.floor(index / numberOfDisplayedItems.value) + 1;

      nextTick(() => {
        const seqElement = document.querySelector(
          `.sequence_${props.selectedOperationInfo.sequence}`
        );

        const dataTableElement = document.querySelector(".v-table__wrapper");
        if (seqElement && dataTableElement) {
          dataTableElement.scrollTop = (seqElement as HTMLElement).offsetTop - 32;
        }
      });
    };

    const formatTimestamp = (epochMilliseconds: string) => {
      return new TimestampImpl(epochMilliseconds).format("HH:mm:ss");
    };

    const onSelectOperations = (...indexes: number[]) => {
      selectedSequences.value = indexes.map((index) => index + 1);

      props.onSelectOperation(selectedSequences.value[0], false);
    };

    const openOperationContextMenu = (target: { itemIndex: number; x: number; y: number }) => {
      if (isViewerMode || !props.operationContextEnabled) {
        return;
      }

      contextMenuOpened.value = false;

      // for close and  open animation.
      nextTick(() => {
        setTimeout(() => {
          contextMenuX.value = target.x;
          contextMenuY.value = target.y;
          contextMenuInfo.value = {
            sequence: target.itemIndex + 1,
            selectedSequences: selectedSequences.value
          };
          contextMenuOpened.value = true;
        }, 100);
      });
    };

    const selectedOperationIndexes = computed(() => {
      return selectedSequences.value.map((sequence) => sequence - 1);
    });

    const autoOperationIndexes = computed(() => {
      const autoOperationIndexes = [];
      for (const [index, { operation }] of props.history.entries()) {
        if (operation.isAutomatic) {
          autoOperationIndexes.push(index);
        }
      }
      return autoOperationIndexes;
    });

    const disabledOperationIndexes = computed(() => {
      const disabledIndexes = [];
      let isCounting = false;

      for (const [index, { operation }] of props.history.entries()) {
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
    });

    const displayedHistoryItems = computed((): HistoryItemForDisplay[] => {
      const items = props.history.map((operationWithNotes, index) => {
        const elementInfo = operationWithNotes.operation.elementInfo;

        const elementInfoForDisplay: ElementInfoForDisplay = {
          tagname: elementInfo?.tagname ?? "",
          text: elementInfo ? elementInfo.text ?? elementInfo.value ?? "" : "",
          attributes: { ...elementInfo?.attributes },
          xpath: elementInfo?.xpath ?? "",
          iframeIndex: elementInfo?.iframe?.index
        };

        const operation: OperationForDisplay = {
          ...operationWithNotes.operation,
          inputValue: operationWithNotes.operation.inputValue,
          elementInfo: elementInfoForDisplay
        };

        const notes = {
          bugs: operationWithNotes.bugs ?? [],
          notices: operationWithNotes.notices ?? [],
          intention: operationWithNotes.intention
        };

        return { index, operation, notes };
      });

      const filteredItems = filterTableRows(items, [
        displayedOperationFilterPredicate,
        textFilterPredicate,
        noteFilterPredicate
      ]);

      return sortTableRows(filteredItems, sortBy.value);
    });

    const getCheckedItems = computed((): { index: number; operation: OperationForGUI }[] => {
      return operationHistoryStore.checkedOperations;
    });

    const displayedOperationFilterPredicate = (item: HistoryItemForDisplay) => {
      if (props.displayedOperations.length === 0) {
        return true;
      }

      return props.displayedOperations.includes(item.operation.sequence);
    };

    const noteFilterPredicate = (item: HistoryItemForDisplay): boolean => {
      if (!isNoteFilterEnabled.value && !isPurposeFilterEnabled.value) {
        return true;
      }
      if (isNoteFilterEnabled.value && (item.notes.notices?.length ?? 0 > 0)) {
        return true;
      }
      if (isPurposeFilterEnabled.value && item.notes.intention) {
        return true;
      }

      return false;
    };

    const textFilterPredicate = (item: HistoryItemForDisplay): boolean => {
      const searchText = search.value;

      if (item.operation.sequence.toString().toLowerCase().indexOf(searchText) !== -1) {
        return true;
      }
      if (item.operation.title.indexOf(searchText) !== -1) {
        return true;
      }
      const elementInfo = item.operation.elementInfo;
      if (elementInfo !== null) {
        if (elementInfo.tagname && elementInfo.tagname.indexOf(searchText) !== -1) {
          return true;
        }
        if (elementInfo.attributes.name && elementInfo.attributes.name.indexOf(searchText) !== -1) {
          return true;
        }
        if (elementInfo.text && elementInfo.text.indexOf(searchText) !== -1) {
          return true;
        }
      }
      if (item.operation.type.indexOf(searchText) !== -1) {
        return true;
      }
      if (item.operation.input.indexOf(searchText) !== -1) {
        return true;
      }
      return false;
    };

    const clearCheckedItems = (
      newValue: {
        index: number;
        operation: OperationForGUI;
      }[]
    ): void => {
      if (newValue.length === 0 && checkedItems.value.length !== 0) {
        checkedItems.value = [];
      }
    };

    const updateCheckedOperationList = (): void => {
      const checkedOperations = displayedHistoryItems.value
        .filter((_, index) => {
          return checkedItems.value.includes(index);
        })
        .map((v) => {
          return { index: v.index, operation: v.operation };
        });

      operationHistoryStore.checkedOperations = checkedOperations;
    };

    const contextmenu = (itemSequence: number, event: MouseEvent) => {
      event.preventDefault();
      openOperationContextMenu({
        itemIndex: itemSequence - 1,
        x: event.clientX,
        y: event.clientY
      });
    };

    const cancelKeydown = (event: Event) => {
      event.stopPropagation();
    };

    const keyDown = (event: KeyboardEvent): void => {
      const keyToAction = new Map([
        ["ArrowUp", prev],
        ["ArrowDown", next],
        ["ArrowRight", pageForward],
        ["ArrowLeft", pageBack]
      ]);

      const action = keyToAction.get(event.key) ?? (() => undefined);

      action();
    };

    const prev = () => {
      const destItem = displayedHistoryItems.value[currentItemIndex.value - 1];

      if (destItem) {
        onSelectOperations(destItem.index);
        switchTablePage(destItem.index);
        resetPosition();
      }
    };

    const next = () => {
      const destItem = displayedHistoryItems.value[currentItemIndex.value + 1];

      if (destItem) {
        onSelectOperations(destItem.index);
        switchTablePage(destItem.index);
        resetPosition();
      }
    };

    const switchTablePage = (itemIndex: number) => {
      const perPage =
        numberOfDisplayedItems.value > 0
          ? numberOfDisplayedItems.value
          : displayedHistoryItems.value.length;

      page.value = Math.floor(itemIndex / perPage) + 1;
    };

    const goto = useGoTo({
      container: ".v-table__wrapper:first-child",
      duration: 100
    });

    const scrollToTableRow = (itemIndex: number) => {
      const perPage =
        numberOfDisplayedItems.value > 0
          ? numberOfDisplayedItems.value
          : displayedHistoryItems.value.length;
      const rowIndex = Math.floor(itemIndex % perPage);
      const rowHeight = 32;
      const rowTop = rowIndex * rowHeight;
      const rowBottom = rowTop + rowHeight;
      const container = document.querySelector(".v-table__wrapper:first-child");
      const scrollTop = container?.scrollTop ?? 0;
      const clientHeight = container?.clientHeight ?? 0;
      const scrollBottom = scrollTop + (clientHeight - 40);

      const destScrollTop =
        rowTop < scrollTop
          ? rowTop
          : rowBottom > scrollBottom
            ? scrollTop + rowBottom - scrollBottom
            : scrollTop;

      goto(destScrollTop);
    };

    const pageForward = () => {
      const destIndex = currentItemIndex.value + numberOfDisplayedItems.value;
      const destItem =
        displayedHistoryItems.value[
          destIndex > displayedHistoryItems.value.length - 1
            ? displayedHistoryItems.value.length - 1
            : destIndex
        ];

      if (destItem) {
        if (
          page.value >
          Math.floor(displayedHistoryItems.value.length / numberOfDisplayedItems.value) + 1
        ) {
          page.value++;
        }
        onSelectOperations(destItem.index);
        nextTick(() => {
          resetPosition();
        });
      }
    };

    const pageBack = () => {
      const destIndex = currentItemIndex.value - numberOfDisplayedItems.value;
      const destItem = displayedHistoryItems.value[destIndex < 0 ? 0 : destIndex];

      if (destItem) {
        if (page.value > 1) {
          page.value--;
        }
        onSelectOperations(destItem.index);
        nextTick(() => {
          resetPosition();
        });
      }
    };

    const currentItemIndex = computed(() => {
      return displayedHistoryItems.value.findIndex(
        ({ index }) => index === selectedOperationIndexes.value[0]
      );
    });

    const displayedHistoryStr = computed(() => {
      return JSON.stringify(displayedHistoryItems.value);
    });

    const resetPosition = () => {
      const currentIndex = selectedOperationIndexes.value[0];

      const itemIndex = displayedHistoryItems.value.findIndex(
        ({ index }) => index === currentIndex
      );

      if (itemIndex !== -1) {
        switchTablePage(itemIndex);
        scrollToTableRow(itemIndex);
      }
    };

    onMounted((): void => {
      document.addEventListener("keydown", keyDown);
    });

    onBeforeUnmount((): void => {
      document.removeEventListener("keydown", keyDown);
    });

    const { selectedOperationInfo } = toRefs(props);
    watch(selectedOperationInfo, initializeSelectedSequences);
    watch(getCheckedItems, clearCheckedItems);
    watch(checkedItems, updateCheckedOperationList);
    watch(itemsPerPage, resetPosition);
    watch(displayedHistoryStr, resetPosition);

    initializeSelectedSequences();

    return {
      selectedSequences,
      checkAllItems,
      checkboxStatus,
      appendClass,
      isViewerMode,
      isPurposeFilterEnabled,
      isNoteFilterEnabled,
      contextMenuOpened,
      contextMenuX,
      contextMenuY,
      contextMenuInfo,
      checkedItems,
      search,
      page,
      itemsPerPage,
      itemsPerPageOptions,
      sortBy,
      headers,
      formatTimestamp,
      onSelectOperations,
      displayedHistoryItems,
      contextmenu,
      cancelKeydown,
      updateCheckedItem,
      currentItemIndex
    };
  }
});
</script>

<style lang="sass" scoped>
:deep(.v-data-table__tr)
  height: 32px !important

:deep(.v-data-table__td)
  height: 32px !important

.item-checkbox
  --v-selection-control-size: 26px !important
  margin-left: 7px

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

.v-data-table__td .v-data-table-column--align-start
  padding: 0
</style>
