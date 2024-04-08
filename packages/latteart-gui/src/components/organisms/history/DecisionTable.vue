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
  <v-row justify="space-between" class="fill-height" id="decision-table">
    <v-col cols="12" class="pb-0">
      <v-checkbox
        class="checkbox-gray-out"
        v-model="shouldGrayOutNotInputValueCell"
        :label="message('input-value.gray-out-not-input-value-cell')"
      ></v-checkbox>
    </v-col>
    <v-col cols="12" class="pb-0">
      <v-checkbox
        class="checkbox-hide-elements"
        v-model="shouldHideHiddenElements"
        :label="message('input-value.hide-hidden-elements')"
        hide-details
      ></v-checkbox>
    </v-col>
    <v-col cols="12" class="py-0">
      <v-text-field
        v-model="search"
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
        :headers="headers"
        :custom-filter="filterByWord"
        :items="inputValues"
        :search="search"
        class="elevation-1"
        v-model:items-per-page="pagination"
        hide-default-header
      >
        <template v-slot:header="{ props: { headers } }">
          <tr class="tr-times">
            <th
              :style="
                index <= 2
                  ? { borderBottom: '1px solid rgba(0,0,0,0.12)' }
                  : { borderBottom: '0px' }
              "
              :class="{ 'column-width': index <= 2 }"
              :rowspan="index <= 2 ? 2 : 1"
              v-for="(header, index) in headers.flatMap((item) => item.values)"
              :key="index"
            >
              {{ header.text }}
              <v-icon
                v-if="index > 2 && !isViewerMode && hasInputElements(header.index)"
                class="mx-1"
                color="blue-lighten-3"
                @click="registerAutofillSetting(header.index)"
                >control_point</v-icon
              >
              <v-icon
                v-if="header.notes.length > 0"
                :title="message('app.note')"
                class="mx-1"
                color="purple-lighten-3"
                @click="
                  selectedColumnNotes = header.notes;
                  opened = true;
                "
                >announcement</v-icon
              >
            </th>
          </tr>
          <tr>
            <th
              :style="{ borderBottom: '1px solid rgba(0,0,0,0.12)' }"
              v-for="(header, index) in headers
                .flatMap((item) => item.values)
                .filter((_, i) => i > 2)"
              :key="index"
            >
              <p v-if="header.targetScreenDef">
                <b>[{{ header.sourceScreenDef }}]</b><br />
                ↓<br />
                {{ header.trigger.eventType }}: {{ header.trigger.elementText }}<br />
                ↓<br />
                <b>[{{ header.targetScreenDef }}]</b><br />
              </p>
              <p v-else>
                <b>[{{ header.sourceScreenDef }}]</b><br />
                ↓<br />
                {{ message("input-value.end-of-test") }}<br />
              </p>
            </th>
          </tr>
        </template>
        <template v-slot:item="props">
          <tr
            :class="{
              'hidden-row': elementTypeIsHidden(props.item.elementType),
              'hidden-display-none':
                shouldHideHiddenElements && elementTypeIsHidden(props.item.elementType)
            }"
            @click="selectRow(props.index)"
            :key="props.index"
          >
            <td class="text-center">
              <span v-if="elementTypeIsHidden(props.item.elementType)">(hidden) </span
              >{{ props.item.elementId }}
            </td>
            <td class="text-center">{{ props.item.elementName }}</td>
            <td class="text-center">{{ props.item.elementType }}</td>
            <td
              class="text-center"
              :style="{
                backgroundColor:
                  shouldGrayOutNotInputValueCell &&
                  (props.item[`set${index}`] ? props.item[`set${index}`].isDefaultValue : true)
                    ? 'rgba(0,0,0,0.12)'
                    : 'rgba(0,0,0,0)'
              }"
              v-for="(_, index) in screenTransitions"
              :key="index"
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
import { MessageProvider } from "@/lib/operationHistory/types";
import InputValueTable from "@/lib/operationHistory/InputValueTable";
import NoteListDialog from "../dialog/NoteListDialog.vue";
import { ElementInfo, VideoFrame } from "latteart-client";
import { OperationHistoryState } from "@/store/operationHistory";
import { computed, defineComponent, ref, inject } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

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
  props: {
    message: {
      type: Function as PropType<MessageProvider>,
      required: true
    }
  },
  components: {
    "note-list-dialog": NoteListDialog
  },
  setup(props) {
    const store = useStore();

    const shouldGrayOutNotInputValueCell = ref(true);
    const shouldHideHiddenElements = ref(true);

    const search = ref("");
    const pagination = ref(-1);
    const opened = ref(false);
    const selectedColumnNotes = ref([]);

    const isViewerMode = computed((): boolean => {
      return inject("isViewerMode") ?? false;
    });

    const operationHistoryState = computed((): OperationHistoryState => {
      return (store.state as any).operationHistory;
    });

    const inputValueTable = computed((): InputValueTable => {
      return operationHistoryState.value.inputValueTable;
    });

    const screenTransitions = computed(() => {
      return new Array(inputValueTable.value.columnSize);
    });

    const headers = computed(() => {
      return [
        {
          values: [
            {
              text: props.message("input-value.element-id"),
              value: "elementId",
              sourceScreenDef: "",
              targetScreenDef: "",
              trigger: {
                elementText: "",
                eventType: ""
              },
              notes: [],
              operationHistory: []
            }
          ]
        },
        {
          values: [
            {
              text: props.message("input-value.element-name"),
              value: "elementName",
              sourceScreenDef: "",
              targetScreenDef: "",
              trigger: {
                elementText: "",
                eventType: ""
              },
              notes: [],
              operationHistory: []
            }
          ]
        },
        {
          values: [
            {
              text: "type",
              value: "elementType",
              sourceScreenDef: "",
              targetScreenDef: "",
              trigger: {
                elementText: "",
                eventType: ""
              },
              notes: [],
              operationHistory: []
            }
          ]
        },
        {
          values: inputValueTable.value.headerColumns.map((screenTransition, index) => {
            return {
              text: `${screenTransition.index + 1}${props.message("input-value.times")}`,
              value: `set${screenTransition.index}`,
              sourceScreenDef: screenTransition.sourceScreenDef,
              targetScreenDef: screenTransition.targetScreenDef,
              trigger: screenTransition.trigger,
              notes: screenTransition.notes.map((note) => {
                const testResultName = operationHistoryState.value.storingTestResultInfos.find(
                  (testResult) => testResult.id === note.testResultId
                )?.name;

                return {
                  ...note,
                  testResultName
                };
              }),
              testPurposes: screenTransition.testPurposes,
              index
            };
          })
        }
      ];
    });

    const inputValues = computed((): InputValue[] => {
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

    const filterByWord = (_: any, search: string, item: InputValue) => {
      const columns = Object.entries(item);
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

          if ("value" in columnValue) {
            return columnValue.value.includes(search);
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
          store.dispatch("operationHistory/changeScreenImage", {
            ...elementImage
          });
        } else {
          store.commit("operationHistory/clearScreenImage");
        }
      }
    };

    const elementTypeIsHidden = (elementType: string): boolean => {
      return elementType === "hidden";
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

      store.commit("captureControl/setAutofillRegisterDialog", {
        title: screenTransition.trigger.pageTitle,
        url: screenTransition.trigger.pageUrl,
        message: store.getters.message("input-value.autofill-dialog-message"),
        inputElements: screenTransition.inputElements?.map((element) => {
          return {
            xpath: element.xpath.toLowerCase(),
            attributes: element.attributes,
            inputValue: element.defaultValue ?? element.inputs.at(-1) ?? "",
            iframeIndex: element.iframe?.index
          };
        }),
        callback: null
      });
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
