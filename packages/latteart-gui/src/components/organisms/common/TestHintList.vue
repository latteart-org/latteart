<!--
 Copyright 2024 NTT Corporation.

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
  <v-container fluid class="pa-0">
    <v-card flat height="100%">
      <v-card-text>
        <v-row align="center">
          <slot name="actions"></slot>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            style="min-width: 50%"
            variant="underlined"
            :label="$t('test-hint.common.search')"
            clearable
          ></v-text-field>
        </v-row>

        <v-data-table
          v-model="selectedItemIds"
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          v-model:sort-by="syncSortBy"
          :headers="headers"
          :items="items"
          :search="search"
          :show-select="selectable"
          item-value="id"
          multi-sort
          :row-props="getRowClass"
        >
          <template v-if="editable" #[`item.actions`]="{ item }">
            <td :class="{ ellipsis: true }">
              <v-btn
                icon
                size="small"
                variant="text"
                @click="emitTestHintEditButtonClicked(item.id)"
              >
                <v-icon>edit</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                variant="text"
                @click="emitTestHintDeleteButtonClicked(item.id)"
              >
                <v-icon>delete</v-icon>
              </v-btn>
            </td>
          </template>
          <template #[`item.data-table-select`]="{ isSelected, toggleSelect, internalItem }">
            <v-checkbox-btn
              :model-value="isSelected([internalItem])"
              :onclick="withModifiers(() => toggleSelect(internalItem), ['stop'])"
              :title="$t('test-hint.search-dialog.ignore-check-box')"
            />
          </template>
          <template #[`item.value`]="{ item }">
            <div
              class="text-truncate"
              :style="{ 'max-width': '100%', width: 'inherit' }"
              :title="item.value"
            >
              {{ item.value }}
            </div>
          </template>
          <template #[`item.testMatrixName`]="{ item }">
            <div
              class="text-truncate"
              :style="{ 'max-width': '100%', width: 'inherit' }"
              :title="item.testMatrixName"
            >
              {{ item.testMatrixName }}
            </div>
          </template>
          <template #[`item.groupName`]="{ item }">
            <div
              class="text-truncate"
              :style="{ 'max-width': '100%', width: 'inherit' }"
              :title="item.groupName"
            >
              {{ item.groupName }}
            </div>
          </template>
          <template #[`item.testTargetName`]="{ item }">
            <div
              class="text-truncate"
              :style="{ 'max-width': '100%', width: 'inherit' }"
              :title="item.testTargetName"
            >
              {{ item.testTargetName }}
            </div>
          </template>
          <template #[`item.viewPointName`]="{ item }">
            <div
              class="text-truncate"
              :style="{ 'max-width': '100%', width: 'inherit' }"
              :title="item.viewPointName"
            >
              {{ item.viewPointName }}
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <information-message-dialog
      :opened="informationDialogOpened"
      :title="$t('common.confirm')"
      :message="$t('test-result-navigation-drawer.delete-test-result-succeeded')"
      @close="informationDialogOpened = false"
    />

    <error-message-dialog
      :opened="errorDialogOpened"
      :message="errorMessage"
      @close="errorDialogOpened = false"
    />
  </v-container>
</template>

<script lang="ts">
import { type TestHint, type TestHintProp } from "@/lib/operationHistory/types";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import InformationMessageDialog from "@/components/molecules/InformationMessageDialog.vue";
import { computed, defineComponent, ref, watch, type PropType, withModifiers } from "vue";
import { useRootStore } from "@/stores/root";

export default defineComponent({
  components: {
    "information-message-dialog": InformationMessageDialog,
    "error-message-dialog": ErrorMessageDialog
  },
  props: {
    testHintProps: {
      type: Array as PropType<TestHintProp[]>,
      default: () => [],
      required: true
    },
    testHints: {
      type: Array as PropType<TestHint[]>,
      default: () => [],
      required: true
    },
    editable: {
      type: Boolean,
      default: false,
      required: false
    },
    selectable: {
      type: Boolean,
      default: false,
      required: false
    },
    checkedTestHintIds: {
      type: Array as PropType<string[]>,
      default: () => [],
      required: false
    },
    testHintMatchCounts: {
      type: Array as PropType<{ id: string; matchCount: number }[]>,
      default: () => [],
      required: false
    }
  },
  emits: [
    "click:edit-test-hint-button",
    "click:delete-test-hint-button",
    "change:test-hints-selection"
  ],
  setup(props, context) {
    const rootStore = useRootStore();

    const confirmDialogOpened = ref(false);
    const informationDialogOpened = ref(false);

    const errorDialogOpened = ref(false);
    const errorMessage = ref("");

    const search = ref("");
    const page = ref<number>(1);
    const itemsPerPage = ref<number>(10);
    const syncSortBy = ref<
      {
        readonly key: string;
        readonly order: "desc" | "asc";
      }[]
    >([
      { key: "isChecked", order: "asc" },
      { key: "matchCount", order: "desc" }
    ]);
    const selectedItemIds = ref<string[]>([...props.checkedTestHintIds]);

    const headers = computed(() => {
      const customColumns = props.testHintProps.map((customProp) => {
        return {
          title: customProp.name,
          value: customProp.id,
          width: "170",
          sortable: true
        };
      });

      return [
        ...(props.editable
          ? [
              {
                title: "",
                value: "actions",
                width: "112px",
                sortable: false
              }
            ]
          : []),
        {
          title: rootStore.message("test-hint.common.hint-text"),
          value: "value",
          sortable: true,
          cellProps: { class: "text-truncate", style: "max-width: 450px" }
        },
        ...customColumns,
        {
          title: rootStore.message("test-hint.common.test-matrix"),
          value: "testMatrixName",
          width: "170",
          sortable: true,
          cellProps: { class: "text-truncate", style: "max-width: 170px" }
        },
        {
          title: rootStore.message("test-hint.common.group"),
          value: "groupName",
          width: "170",
          sortable: true,
          cellProps: { class: "text-truncate", style: "max-width: 170px" }
        },
        {
          title: rootStore.message("test-hint.common.test-target"),
          value: "testTargetName",
          width: "170",
          sortable: true,
          cellProps: { class: "text-truncate", style: "max-width: 170px" }
        },
        {
          title: rootStore.message("test-hint.common.view-point"),
          value: "viewPointName",
          width: "170",
          sortable: true,
          cellProps: { class: "text-truncate", style: "max-width: 170px" }
        }
        // {
        //   title: rootStore.message("test-hint.common.comment-words"),
        //   value: "commentWords",
        //   sortable: false
        // },
        // {
        //   title: rootStore.message("test-hint.common.screen-elements"),
        //   value: "operationElements",
        //   sortable: false
        // },
        // {
        //   title: rootStore.message("test-hint.common.match-count"),
        //   value: "matchCount",
        //   sortable: false
        // }
      ];
    });

    const items = computed(() => {
      return props.testHints.map((testHint) => {
        const { customs, ...other } = testHint;
        return {
          isChecked: props.checkedTestHintIds.includes(other.id),
          matchCount:
            props.testHintMatchCounts.find(({ id }) => id === testHint.id)?.matchCount ?? 0,
          ...other,
          commentWords: other.commentWords.join(" "),
          operationElements: other.operationElements
            .map(({ tagname, type, text }) => {
              return `[${tagname}, ${type}, ${text}]`;
            })
            .join(" "),
          ...Object.fromEntries(
            customs.map((custom) => {
              const customProp = props.testHintProps.find(({ id }) => id === custom.propId);
              const value = customProp
                ? customProp.type === "list"
                  ? customProp.listItems?.find(({ key }) => key === custom.value)?.value ?? ""
                  : custom.value
                : "";
              return [custom.propId, value];
            })
          )
        };
      });
    });

    const getRowClass = ({ item }: { item: { id: string } }) => {
      return {
        class: `${selectedItemIds.value.includes(item.id) ? "checked" : ""}`
      };
    };

    const emitTestHintEditButtonClicked = (testHintId: string) => {
      context.emit("click:edit-test-hint-button", testHintId);
    };

    const emitTestHintDeleteButtonClicked = (testHintId: string) => {
      context.emit("click:delete-test-hint-button", testHintId);
    };

    watch(selectedItemIds, (selectedTestHintIds) => {
      context.emit("change:test-hints-selection", selectedTestHintIds);
    });

    return {
      confirmDialogOpened,
      informationDialogOpened,
      errorDialogOpened,
      errorMessage,
      selectedItemIds,
      search,
      page,
      itemsPerPage,
      syncSortBy,
      headers,
      items,
      getRowClass,
      emitTestHintEditButtonClicked,
      emitTestHintDeleteButtonClicked,
      withModifiers
    };
  }
});
</script>

<style lang="sass" scoped>
:deep(.checked)
  background-color: gray !important
</style>
