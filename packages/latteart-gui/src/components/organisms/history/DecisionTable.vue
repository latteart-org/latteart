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
  <v-row id="decision-table" justify="space-between" class="fill-height pr-2">
    <v-col cols="12" class="pb-0">
      <v-checkbox
        v-model="shouldGrayOutNotInputValueCell"
        density="comfortable"
        class="checkbox-gray-out"
        :label="message('input-value.gray-out-not-input-value-cell')"
        hide-details
      ></v-checkbox>
    </v-col>
    <v-col cols="12" class="py-0">
      <v-checkbox
        v-model="shouldHideHiddenElements"
        density="comfortable"
        class="checkbox-hide-elements"
        :label="message('input-value.hide-hidden-elements')"
        hide-details
      ></v-checkbox>
    </v-col>
    <v-col cols="12" class="py-0">
      <v-text-field
        v-model="search"
        variant="underlined"
        prepend-inner-icon="search"
        :label="message('operation.query')"
        hide-details
      ></v-text-field>
    </v-col>
    <v-col
      cols="12"
      :style="{
        height: '100%',
        'overflow-y': 'scroll',
        'padding-bottom': '150px'
      }"
    >
      <v-data-table
        v-model:items-per-page="pagination"
        :headers="headers"
        :custom-filter="filterByWord"
        :items="inputValues"
        :search="search"
        class="elevation-1"
      >
        <template #headers="{ columns }">
          <tr class="tr-times">
            <th
              v-for="(header, index) in columns"
              :key="index"
              :style="
                index <= 2
                  ? { borderBottom: '1px solid rgba(0,0,0,0.12)' }
                  : { borderBottom: '0px' }
              "
              :class="{ 'column-width': index <= 2, 'text-center': true }"
              :rowspan="index <= 2 ? 2 : 1"
            >
              {{ header.title }}
              <v-icon
                v-if="index > 2 && !isViewerMode && hasInputElements(header.headerProps?.index)"
                class="mx-1"
                color="blue-lighten-3"
                @click="registerAutofillSetting(header.headerProps?.index)"
                >control_point</v-icon
              >
              <v-icon
                v-if="header.headerProps?.notes.length > 0"
                :title="message('app.note')"
                class="mx-1"
                color="purple-lighten-3"
                @click="
                  selectedColumnNotes = header?.headerProps?.notes;
                  opened = true;
                "
                >announcement</v-icon
              >
            </th>
          </tr>
          <tr>
            <th
              v-for="(header, index) in columns.filter((_, i) => i > 2)"
              :key="index"
              :style="{ borderBottom: '1px solid rgba(0,0,0,0.12)', 'align-content': 'start' }"
              class="text-center"
            >
              <p v-if="header?.headerProps?.targetScreenDef">
                <b>[{{ header?.headerProps?.sourceScreenDef }}]</b><br />
                ↓<br />
                {{ header?.headerProps?.trigger.eventType }}:
                {{ header?.headerProps?.trigger.elementText }}<br />
                ↓<br />
                <b>[{{ header?.headerProps?.targetScreenDef }}]</b><br />
              </p>
              <p v-else>
                <b>[{{ header?.headerProps?.sourceScreenDef }}]</b><br />
                ↓<br />
                {{ message("input-value.end-of-test") }}<br />
              </p>
            </th>
          </tr>
        </template>
        <template #item="props">
          <tr
            :key="props.index"
            :class="{
              'hidden-row': elementTypeIsHidden(props.item),
              'hidden-display-none': shouldHideHiddenElements && elementTypeIsHidden(props.item)
            }"
            @click="selectRow(props.index)"
          >
            <td class="text-center">
              <span v-if="elementTypeIsHidden(props.item)">(hidden) </span
              >{{ props.item.elementId }}
            </td>
            <td class="text-center">{{ props.item.elementName }}</td>
            <td class="text-center">{{ props.item.elementType }}</td>
            <td
              v-for="(_, index) in screenTransitions"
              :key="index"
              class="text-center"
              :style="{
                backgroundColor:
                  shouldGrayOutNotInputValueCell &&
                  (props.item[`set${index}`] ? props.item[`set${index}`].isDefaultValue : true)
                    ? 'rgba(0,0,0,0.12)'
                    : 'rgba(0,0,0,0)'
              }"
            >
              {{ props.item[`set${index}`] ? props.item[`set${index}`].value : "" }}
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-col>
    <note-list-dialog
      :opened="opened"
      :notes="selectedColumnNotes"
      :message="message"
      @close="opened = false"
    />
  </v-row>
</template>

<script lang="ts">
import { type MessageProvider } from "@/lib/operationHistory/types";
import NoteListDialog from "../dialog/NoteListDialog.vue";
import type { ElementInfo, VideoFrame } from "latteart-client";
import { computed, defineComponent, ref, inject, type PropType } from "vue";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useRootStore } from "@/stores/root";

type InputValue = {
  [key: string]:
    | string
    | {
        image: { imageFileUrl?: string; videoFrame?: VideoFrame };
        elementInfo: Pick<
          ElementInfo,
          "boundingRect" | "innerHeight" | "innerWidth" | "outerHeight" | "outerWidth"
        >;
      }
    | { value: string; isDefaultValue: boolean }
    | undefined;
};

export default defineComponent({
  components: {
    "note-list-dialog": NoteListDialog
  },
  props: {
    message: {
      type: Function as PropType<MessageProvider>,
      required: true
    }
  },
  setup(props) {
    const rootStore = useRootStore();
    const operationHistoryStore = useOperationHistoryStore();
    const captureControlStore = useCaptureControlStore();

    const shouldGrayOutNotInputValueCell = ref(true);
    const shouldHideHiddenElements = ref(true);

    const search = ref("");
    const pagination = ref(-1);
    const opened = ref(false);
    const selectedColumnNotes = ref([]);

    const isViewerMode = computed((): boolean => {
      return inject("isViewerMode") ?? false;
    });

    const inputValueTable = computed(() => {
      return operationHistoryStore.inputValueTable;
    });

    const screenTransitions = computed(() => {
      return new Array(inputValueTable.value.columnSize);
    });

    const headers = computed(() => {
      return [
        {
          children: [
            {
              title: props.message("input-value.element-id"),
              value: "elementId",
              headerProps: {
                sourceScreenDef: "",
                targetScreenDef: "",
                trigger: {
                  elementText: "",
                  eventType: ""
                },
                notes: [],
                operationHistory: []
              }
            }
          ]
        },
        {
          children: [
            {
              title: props.message("input-value.element-name"),
              value: "elementName",
              headerProps: {
                sourceScreenDef: "",
                targetScreenDef: "",
                trigger: {
                  elementText: "",
                  eventType: ""
                },
                notes: [],
                operationHistory: []
              }
            }
          ]
        },
        {
          children: [
            {
              title: "type",
              value: "elementType",
              headerProps: {
                sourceScreenDef: "",
                targetScreenDef: "",
                trigger: {
                  elementText: "",
                  eventType: ""
                },
                notes: [],
                operationHistory: []
              }
            }
          ]
        },
        {
          children: inputValueTable.value.headerColumns.map((screenTransition, index) => {
            return {
              title: `${screenTransition.index + 1}${props.message("input-value.times")}`,
              value: `set${screenTransition.index}`,
              headerProps: {
                sourceScreenDef: screenTransition.sourceScreenDef,
                targetScreenDef: screenTransition.targetScreenDef,
                trigger: screenTransition.trigger,
                notes: screenTransition.notes.map((note) => {
                  const testResultName = operationHistoryStore.storingTestResultInfos.find(
                    (testResult) => testResult.id === note.testResultId
                  )?.name;

                  return {
                    ...note,
                    testResultName
                  };
                }),
                testPurposes: screenTransition.testPurposes,
                index
              }
            };
          })
        }
      ];
    });

    const inputValues = computed(() => {
      return inputValueTable.value.rows.map(
        ({ inputs, elementName, elementId, elementType, elementImage }) => {
          return inputs.reduce(
            (acc: any, current, index) => {
              acc[`set${index}`] = current;

              return acc;
            },
            { elementName, elementId, elementType, elementImage }
          );
        }
      );
    });

    const filterByWord = (_: any, search: string, item: any) => {
      const columns = Object.entries(item.raw as InputValue);
      return columns
        .filter(([columnName]) => {
          return columnName !== "media";
        })
        .some(([_, columnValue]) => {
          if (!columnValue) {
            return false;
          }

          if (typeof columnValue === "string") {
            return columnValue.includes(search);
          }

          if (typeof columnValue === "object" && "value" in columnValue) {
            return (columnValue.value as string).includes(search);
          }

          return false;
        });
    };

    const selectRow = (index: number): void => {
      const elementImage = inputValues.value[index].elementImage;
      if (
        typeof elementImage === "object" &&
        "image" in elementImage &&
        "elementInfo" in elementImage
      ) {
        if (elementImage.image.imageFileUrl || elementImage.image.videoFrame) {
          operationHistoryStore.changeScreenImage({
            ...elementImage
          });
        } else {
          operationHistoryStore.screenImage = null;
        }
      }
    };

    const elementTypeIsHidden = (item: InputValue): boolean => {
      if (item.elementType) {
        return item.elementType === "hidden";
      }
      return false;
    };

    const hasInputElements = (index: number): boolean => {
      return (
        (inputValueTable.value.getScreenTransitions().at(index)?.inputElements.length ?? 0) > 0
      );
    };

    const registerAutofillSetting = (index: number): void => {
      const screenTransition = inputValueTable.value.getScreenTransitions().at(index);

      if (!screenTransition || !screenTransition.trigger) {
        return;
      }

      captureControlStore.autofillRegisterDialogData = {
        title: screenTransition.trigger.pageTitle,
        url: screenTransition.trigger.pageUrl,
        message: rootStore.message("input-value.autofill-dialog-message"),
        inputElements: screenTransition.inputElements?.map((element) => {
          return {
            xpath: element.xpath.toLowerCase(),
            attributes: element.attributes,
            inputValue: element.inputs.at(-1)?.value ?? element.defaultValue ?? "",
            iframeIndex: element.iframe?.index
          };
        }),
        callback: () => {
          /* Do nothing */
        }
      };
    };

    return {
      shouldGrayOutNotInputValueCell,
      shouldHideHiddenElements,
      search,
      pagination,
      opened,
      selectedColumnNotes,
      isViewerMode,
      screenTransitions,
      headers,
      inputValues,
      filterByWord,
      selectRow,
      elementTypeIsHidden,
      hasInputElements,
      registerAutofillSetting
    };
  }
});
</script>

<style lang="sass" scoped>
th
  font-size: 0.75rem

td
  height: 30px !important

.ellipsis
  overflow: hidden
  white-space: nowrap
  text-overflow: ellipsis
  max-width: 150px

.checkbox-hide-elements
  margin-top: 0px

.hidden-row
  color: #888
  font-style: italic

.hidden-display-none
  display: none

.column-width
  width: 200px
  border-top: 0px

.tr-times
  border-bottom: 0px !important
</style>

<style lang="sass">
.checkbox-gray-out
  .v-input__slot
    margin-bottom: 0px !important
  .v-messages
    display: none
</style>
