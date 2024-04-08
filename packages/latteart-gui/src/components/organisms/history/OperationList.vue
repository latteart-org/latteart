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
            v-model:sort-by="sortBy"
            v-model:sort-desc="sortDesc"
            :custom-sort="(items) => items"
            must-sort
            :headers="headers"
            :items="displayedHistoryItems"
            v-model="checkedItems"
            :search="search"
            v-model:page="page"
            v-model:items-per-page="itemsPerPage"
            :footer-props="{ 'items-per-page-options': itemsPerPageOptions }"
            @click:row="(item) => onSelectOperations(item.index)"
            @contextmenu:row="
              (event, item) => contextmenu(item.item.operation.sequence, event, item)
            "
          >
            <template v-slot:[`item.data-table-select`]="{ isSelected, select, item }">
              <td :class="createCssClassForRow(item.index)">
                <v-checkbox-btn :value="isSelected" @input="select($event)" />
              </td>
            </template>

            <template v-slot:[`item.operation.sequence`]="{ item }">
              <td
                :class="[createCssClassForRow(item.index), `sequence_${item.operation.sequence}`]"
              >
                {{ item.operation.sequence }}
              </td>
            </template>

            <template v-slot:[`item.notes`]="{ item }">
              <td :class="createCssClassForRow(item.index)">
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

            <template v-slot:[`item.operation.elementInfo.attributes.name`]="{ item }">
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
      <v-row id="operation-search" style="height: 50px" @keydown="cancelKeydown">
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
import { OperationHistory, MessageProvider } from "@/lib/operationHistory/types";
import OperationContextMenu from "./OperationContextMenu.vue";
import { NoteForGUI } from "@/lib/operationHistory/NoteForGUI";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { TimestampImpl } from "@/lib/common/Timestamp";
import AutoOperationRegisterButton from "./AutoOperationRegisterButton.vue";
import { filterTableRows, sortTableRows } from "@/lib/common/table";
import { OperationHistoryState } from "@/store/operationHistory";
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
import { useStore } from "@/store";
import { useVuetify } from "@/composables/useVuetify";
import type { PropType } from "vue";

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
  props: {
    history: {
      type: Array as PropType<OperationHistory>,
      default: [],
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
      default: [],
      required: true
    },
    message: { type: Function as PropType<MessageProvider>, required: true },
    operationContextEnabled: { type: Boolean, default: false, required: true }
  },
  components: {
    "operation-context-menu": OperationContextMenu,
    "auto-operation-register-button": AutoOperationRegisterButton
  },
  setup(props) {
    const store = useStore();
    const vuetify = useVuetify();

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

    const checkedItems = ref<HistoryItemForDisplay[]>([]);
    const search = ref("");
    const page = ref<number>(1);
    const itemsPerPage = ref<number>(100);
    const itemsPerPageOptions = ref<number[]>([100, 200, 500, 1000]);
    const sortBy = ref("operation.sequence");
    const sortDesc = ref(false);

    const headers = computed(
      (): {
        text: string;
        value: string;
        class?: string;
        width?: string;
        sortable?: boolean;
      }[] => {
        return [
          {
            text: props.message("operation.sequence"),
            value: "operation.sequence",
            width: "70",
            class: "seq-col"
          },
          {
            text: "",
            value: "notes",
            class: "icon-col",
            width: "90",
            sortable: false
          },
          { text: props.message("operation.title"), value: "operation.title" },
          {
            text: props.message("operation.tagname"),
            value: "operation.elementInfo.tagname"
          },
          {
            text: props.message("operation.name"),
            value: "operation.elementInfo.attributes.name"
          },
          {
            text: props.message("operation.text"),
            value: "operation.elementInfo.text"
          },
          { text: props.message("operation.type"), value: "operation.type" },
          {
            text: props.message("operation.input"),
            value: "operation.inputValue"
          },
          {
            text: props.message("operation.timestamp"),
            value: "operation.timestamp"
          }
        ];
      }
    );

    const createCssClassForRow = (itemIndex: number) => {
      return {
        selected: selectedOperationIndexes.value.includes(itemIndex),
        marked: autoOperationIndexes.value.includes(itemIndex),
        disabled: disabledOperationIndexes.value.includes(itemIndex)
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

      page.value = Math.floor(index / itemsPerPage.value) + 1;

      nextTick(() => {
        const seqElement = document.querySelector(
          `.sequence_${props.selectedOperationInfo.sequence}`
        );

        const dataTableElement = document.querySelector(".v-data-table__wrapper");
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
      console.log(autoOperationIndexes);
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

      return sortTableRows(filteredItems, sortBy.value, sortDesc.value);
    });

    const getCheckedItems = computed((): { index: number; operation: OperationForGUI }[] => {
      return ((store.state as any).operationHistory as OperationHistoryState).checkedOperations;
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
      const checkedOperations = checkedItems.value.map(({ index, operation }) => {
        return { index, operation };
      });
      store.commit("operationHistory/setCheckedOperations", {
        checkedOperations
      });
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
        itemsPerPage.value > 0 ? itemsPerPage.value : displayedHistoryItems.value.length;

      page.value = Math.floor(itemIndex / perPage) + 1;
    };

    const scrollToTableRow = (itemIndex: number) => {
      const perPage =
        itemsPerPage.value > 0 ? itemsPerPage.value : displayedHistoryItems.value.length;
      const rowIndex = Math.floor(itemIndex % perPage);
      const rowHeight = 29;
      const rowTop = rowIndex * rowHeight;
      const rowBottom = rowTop + rowHeight;
      const container = document.querySelector(".v-data-table__wrapper:first-child");
      const scrollTop = container?.scrollTop ?? 0;
      const clientHeight = container?.clientHeight ?? 0;
      const scrollBottom = scrollTop + (clientHeight - 32);

      const destScrollTop =
        rowTop < scrollTop
          ? rowTop
          : rowBottom > scrollBottom
            ? scrollTop + rowBottom - scrollBottom
            : scrollTop;

      vuetify.goTo(destScrollTop, {
        container: ".v-data-table__wrapper:first-child",
        duration: 100
      });
    };

    const pageForward = () => {
      const destIndex = currentItemIndex.value + itemsPerPage.value;
      const destItem =
        displayedHistoryItems.value[
          destIndex > displayedHistoryItems.value.length - 1
            ? displayedHistoryItems.value.length - 1
            : destIndex
        ];

      if (destItem) {
        onSelectOperations(destItem.index);
        page.value++;
        nextTick(() => {
          resetPosition();
        });
      }
    };

    const pageBack = () => {
      const destIndex = currentItemIndex.value - itemsPerPage.value;
      const destItem = displayedHistoryItems.value[destIndex < 0 ? 0 : destIndex];

      if (destItem) {
        onSelectOperations(destItem.index);
        page.value--;
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
      sortDesc,
      headers,
      createCssClassForRow,
      formatTimestamp,
      onSelectOperations,
      displayedHistoryItems,
      contextmenu,
      cancelKeydown
    };
  }
});
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
