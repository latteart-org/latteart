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
  <div class="mt-4">
    <v-row align-content="space-between">
      <v-col cols="12">
        <v-card max-width="100%">
          <v-card-text>
            <v-container>
              <v-row>
                <v-checkbox
                  :model-value="conditionGroup.isEnabled"
                  @update:model-value="(value) => updateConditionGroup({ isEnabled: value })"
                  class="default-flex"
                >
                </v-checkbox>
                <v-text-field
                  :label="store.getters.message('config-page.screen-def.screen-name')"
                  :model-value="conditionGroup.screenName"
                  @change="(value) => updateConditionGroup({ screenName: value })"
                ></v-text-field>
                <v-btn @click="deleteConditionGroup" color="error"
                  >{{ store.getters.message("config-page.screen-def.delete-definition") }}
                </v-btn>
              </v-row>

              <v-row class="mb-2">
                <v-btn size="small" class="mt-3" @click="addCondition">{{
                  store.getters.message("config-page.screen-def.add-condition")
                }}</v-btn
                ><span class="description">{{
                  store.getters.message("config-page.screen-def.description")
                }}</span>
              </v-row>

              <v-row
                v-for="(item, index) in conditionGroup.conditions"
                :key="index"
                class="conditions-area conditions-row"
                align="center"
              >
                <v-col cols="1" style="text-align: right">
                  <span v-if="index > 0">{{
                    store.getters.message("config-page.screen-def.and")
                  }}</span>
                  <span v-else>　　</span>
                </v-col>

                <v-col cols="1" style="text-align: center">
                  <v-checkbox
                    :model-value="item.isEnabled"
                    @update:model-value="(value) => updateCondition(index, { isEnabled: value })"
                    style="display: inline-block"
                  ></v-checkbox>
                </v-col>

                <template v-if="store.getters.getLocale() === 'ja'">
                  <v-col cols="2">
                    <v-select
                      :model-value="item.definitionType"
                      @update:model-value="
                        (value) => updateCondition(index, { definitionType: value })
                      "
                      :items="definitionTypeList"
                      item-title="label"
                      item-value="value"
                      class="select-with-word"
                    ></v-select
                    ><span style="margin-left: 10px">に</span>
                  </v-col>

                  <v-col cols="4">
                    <v-text-field
                      :model-value="item.word"
                      @change="(value) => updateCondition(index, { word: value })"
                      class="select-with-word"
                    ></v-text-field>
                    <span style="margin-left: 10px">という</span>
                  </v-col>

                  <v-col cols="3">
                    <v-select
                      :model-value="item.matchType"
                      @update:model-value="(value) => updateCondition(index, { matchType: value })"
                      :items="matchType"
                      item-title="label"
                      item-value="value"
                    ></v-select>
                  </v-col>
                </template>

                <template v-if="store.getters.getLocale() === 'en'">
                  <v-col cols="2">
                    <v-select
                      :model-value="item.definitionType"
                      @update:model-value="
                        (value) => updateCondition(index, { definitionType: value })
                      "
                      :items="definitionTypeList"
                      item-title="label"
                      item-value="value"
                      class="select-with-word"
                    ></v-select>
                  </v-col>

                  <v-col cols="3" class="pr-4">
                    <v-select
                      :model-value="item.matchType"
                      @update:model-value="(value) => updateCondition(index, { matchType: value })"
                      :items="matchType"
                      item-title="label"
                      item-value="value"
                    ></v-select>
                  </v-col>

                  <v-col cols="4" class="pl-4">
                    <v-text-field
                      :model-value="item.word"
                      @change="(value) => updateCondition(index, { word: value })"
                    ></v-text-field>
                  </v-col>
                </template>

                <v-col cols="1">
                  <v-btn
                    v-if="conditionGroup.conditions.length > 1"
                    variant="text"
                    icon
                    @click="deleteCondition(index)"
                    color="error"
                    ><v-icon>delete</v-icon></v-btn
                  >
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  ScreenDefinitionConditionGroup,
  ScreenDefinitionType,
  ScreenMatchType
} from "@/lib/operationHistory/types";
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    conditionGroup: {
      type: Object as PropType<ScreenDefinitionConditionGroup>,
      default: { isEnabled: false, screenName: "", conditions: [] },
      required: true
    },
    index: { type: Number, default: -1, required: true }
  },
  setup(props, context) {
    const store = useStore();

    const definitionTypeList = computed((): { value: string; label: string }[] => {
      return [
        {
          value: "url",
          label: store.getters.message("config-page.screen-def.url")
        },
        {
          value: "title",
          label: store.getters.message("config-page.screen-def.title")
        },
        {
          value: "keyword",
          label: store.getters.message("config-page.screen-def.keyword")
        }
      ];
    });

    const matchType = computed((): { value: string; label: string }[] => {
      return [
        {
          value: "contains",
          label: store.getters.message("config-page.screen-def.contains")
        },
        {
          value: "equals",
          label: store.getters.message("config-page.screen-def.equals")
        },
        {
          value: "regex",
          label: store.getters.message("config-page.screen-def.regex")
        }
      ];
    });

    const updateConditionGroup = (group: Partial<ScreenDefinitionConditionGroup>) => {
      const conditionGroup = { ...props.conditionGroup, ...group };
      context.emit("update-condition-group", {
        conditionGroup,
        index: props.index
      });
    };

    const updateCondition = (
      index: number,
      condition: {
        isEnabled?: boolean;
        definitionType?: ScreenDefinitionType;
        matchType?: ScreenMatchType;
        word?: string;
      }
    ): void => {
      const conditionGroup = {
        ...props.conditionGroup,
        conditions: props.conditionGroup.conditions.map((c, i) => {
          return i !== index ? c : { ...c, ...condition };
        })
      };
      updateConditionGroup(conditionGroup);
    };

    const addCondition = (): void => {
      const conditionGroup: ScreenDefinitionConditionGroup = {
        ...props.conditionGroup,
        conditions: [
          ...props.conditionGroup.conditions,
          {
            isEnabled: true,
            definitionType: "url",
            matchType: "contains",
            word: ""
          }
        ]
      };
      updateConditionGroup(conditionGroup);
    };

    const deleteCondition = (conditionIndex: number): void => {
      const conditionGroup = {
        ...props.conditionGroup,
        conditions: props.conditionGroup.conditions.filter((c, i) => i !== conditionIndex)
      };
      updateConditionGroup(conditionGroup);
    };

    const deleteConditionGroup = (): void => {
      context.emit("delete-condition-group", props.index);
    };

    return {
      store,
      definitionTypeList,
      matchType,
      updateConditionGroup,
      updateCondition,
      addCondition,
      deleteCondition,
      deleteConditionGroup
    };
  }
});
</script>

<style lang="sass" scoped>
.center
  text-align: center

.select-with-word
  display: inline-block
  width: 80%

.conditions-row
  margin: 0 20px 0 40px

.conditions-area-top
  margin-top: 10px
  padding-top: 10px

.conditions-area
  background-color: #FAFAFA

.condition-area-main
  margin-bottom: 20px

.default-flex
  flex: 0 1 auto

.description
  margin-top: 20px
  margin-left: 15px
</style>
