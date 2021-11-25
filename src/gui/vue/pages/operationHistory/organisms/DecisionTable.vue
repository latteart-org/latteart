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
    align-space-around
    justify-space-between
    column
    fill-height
    id="decision-table"
  >
    <v-checkbox
      class="checkbox-gray-out"
      v-model="shouldGrayOutNotInputValueCell"
      :label="message('input-value.gray-out-not-input-value-cell')"
    ></v-checkbox>
    <v-checkbox
      class="checkbox-hide-elements"
      v-model="shouldHideHiddenElements"
      :label="message('input-value.hide-hidden-elements')"
    ></v-checkbox>
    <v-flex xs12 :style="{ height: '100%', 'overflow-y': 'scroll' }">
      <v-data-table
        disable-initial-sort
        :headers="headers"
        :items="inputValues"
        :search="search"
        class="elevation-1"
        :pagination.sync="pagination"
      >
        <template slot="headers" slot-scope="props">
          <tr>
            <th
              :colspan="header.values.length"
              class="column-width"
              v-for="(header, index) in props.headers"
              :key="index"
            >
              {{ header.intention }}
            </th>
          </tr>
          <tr>
            <th
              :style="
                index <= 2 ? { borderBottom: '1px solid rgba(0,0,0,0.12)' } : {}
              "
              :class="{ 'column-width': index <= 2 }"
              :rowspan="index <= 2 ? 2 : 1"
              v-for="(header, index) in props.headers.flatMap(
                (item) => item.values
              )"
              :key="index"
            >
              {{ header.text }}
            </th>
          </tr>
          <tr>
            <th
              :style="{ borderBottom: '1px solid rgba(0,0,0,0.12)' }"
              :class="{ 'column-width': index <= 2 }"
              v-for="(header, index) in props.headers
                .flatMap((item) => item.values)
                .filter((_, i) => i > 2)"
              :key="index"
            >
              <p>
                <b>[{{ header.sourceScreenDef }}]</b><br />
                ↓<br />
                {{ header.trigger.eventType }}: {{ header.trigger.elementText
                }}<br />
                ↓<br />
                <b>[{{ header.targetScreenDef }}]</b><br />
              </p>
            </th>
          </tr>
        </template>
        <template v-slot:items="props">
          <tr
            :class="{
              'hidden-row': elementTypeIsHidden(props.item.elementType),
              'hidden-display-none':
                shouldHideHiddenElements &&
                elementTypeIsHidden(props.item.elementType),
            }"
            @click="selectInputValueSet(props.index)"
            :key="props.index"
          >
            <td class="text-xs-center">
              <span v-if="elementTypeIsHidden(props.item.elementType)"
                >(hidden) </span
              >{{ props.item.elementId }}
            </td>
            <td class="text-xs-center">{{ props.item.elementName }}</td>
            <td class="text-xs-center">{{ props.item.elementType }}</td>
            <td
              class="text-xs-center"
              :style="{
                backgroundColor:
                  shouldGrayOutNotInputValueCell &&
                  props.item[`set${index}`].isDefaultValue
                    ? 'rgba(0,0,0,0.12)'
                    : 'rgba(0,0,0,0)',
              }"
              v-for="(_, index) in screenTransitions"
              :key="index"
            >
              {{ props.item[`set${index}`].value }}
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { MessageProvider } from "@/lib/operationHistory/types";
import InputValueTable from "@/lib/operationHistory/InputValueTable";

@Component({
  components: {},
})
export default class DecisionTable extends Vue {
  @Prop({ type: Function, default: -1 }) public readonly onSelectValueSet!: (
    sequence: string
  ) => void;
  @Prop({ type: Function }) public readonly message!: MessageProvider;

  private shouldGrayOutNotInputValueCell = true;
  private shouldHideHiddenElements = true;

  private search = "";
  private pagination: any = {
    rowsPerPage: -1,
  };

  private get inputValueTable(): InputValueTable {
    return this.$store.state.operationHistory.inputValueTable;
  }

  private get screenTransitions() {
    return new Array(this.inputValueTable.columnSize);
  }

  private get headers() {
    return [
      {
        intention: "",
        values: [
          {
            text: this.message("input-value.element-id"),
            value: "elementId",
            sourceScreenDef: "",
            targetScreenDef: "",
            trigger: {
              elementText: "",
              eventType: "",
            },
          },
        ],
      },
      {
        intention: "",
        values: [
          {
            text: this.message("input-value.element-name"),
            value: "elementName",
            sourceScreenDef: "",
            targetScreenDef: "",
            trigger: {
              elementText: "",
              eventType: "",
            },
          },
        ],
      },
      {
        intention: "",
        values: [
          {
            text: "type",
            value: "elementType",
            sourceScreenDef: "",
            targetScreenDef: "",
            trigger: {
              elementText: "",
              eventType: "",
            },
          },
        ],
      },
      ...this.inputValueTable.headerColumns.map((item) => {
        return {
          intention: item.intention,
          values: item.screenTransitions.map((screenTransition) => {
            return {
              text: `${screenTransition.index + 1}${this.message(
                "input-value.times"
              )}`,
              value: `set${screenTransition.index}`,
              sourceScreenDef: screenTransition.sourceScreenDef,
              targetScreenDef: screenTransition.targetScreenDef,
              trigger: screenTransition.trigger,
            };
          }),
        };
      }),
    ];
  }

  private get inputValues() {
    return this.inputValueTable.rows.map(
      ({ inputs, elementName, elementId, elementType, sequence }) => {
        return inputs.reduce(
          (acc: any, current, index) => {
            acc[`set${index}`] = current;

            return acc;
          },
          { elementName, elementId, elementType, sequence }
        );
      }
    );
  }

  private selectInputValueSet(index: number): void {
    this.onSelectValueSet(String(this.inputValues[index].sequence));
  }

  private elementTypeIsHidden(elementType: string): boolean {
    return elementType === "hidden";
  }
}
</script>

<style lang="sass" scoped>
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
</style>

<style lang="sass">
.checkbox-gray-out
  .v-input__slot
    margin-bottom: 0px !important
  .v-messages
    display: none
</style>
