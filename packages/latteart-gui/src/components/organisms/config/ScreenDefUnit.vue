<!--
 Copyright 2025 NTT Corporation.

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
                  hide-details
                  :model-value="conditionGroup.isEnabled"
                  class="default-flex"
                  @update:model-value="
                    (value) => updateConditionGroup({ isEnabled: value ?? false })
                  "
                >
                </v-checkbox>
                <v-text-field
                  variant="underlined"
                  :label="$t('screen-def-unit.screen-name')"
                  :model-value="conditionGroup.screenName"
                  @change="(e: any) => updateConditionGroup({ screenName: e.target._value })"
                ></v-text-field>
                <v-btn color="red" @click="deleteConditionGroup"
                  >{{ $t("screen-def-unit.delete-definition") }}
                </v-btn>
              </v-row>

              <v-row class="mb-2">
                <v-btn size="small" class="mt-3" @click="addCondition">{{
                  $t("screen-def-unit.add-condition")
                }}</v-btn
                ><span class="description">{{ $t("screen-def-unit.description") }}</span>
              </v-row>

              <v-row
                v-for="(item, i) in conditionGroup.conditions"
                :key="i"
                class="conditions-area conditions-row"
                align="center"
              >
                <v-col cols="1" style="text-align: right">
                  <span v-if="i > 0">{{ $t("screen-def-unit.and") }}</span>
                  <span v-else> </span>
                </v-col>

                <v-col cols="1" style="text-align: center">
                  <v-checkbox
                    hide-details
                    :model-value="item.isEnabled"
                    style="display: inline-block"
                    @update:model-value="
                      (value) => updateCondition(i, { isEnabled: value ?? false })
                    "
                  ></v-checkbox>
                </v-col>

                <template v-if="store.getLocale() === 'ja'">
                  <v-col cols="2">
                    <v-select
                      variant="underlined"
                      :model-value="item.definitionType"
                      :items="definitionTypeList"
                      item-title="label"
                      item-value="value"
                      class="select-with-word"
                      @update:model-value="(value) => updateCondition(i, { definitionType: value })"
                    ></v-select
                    ><span style="margin-left: 10px">に</span>
                  </v-col>

                  <v-col cols="4">
                    <v-text-field
                      variant="underlined"
                      :model-value="item.word"
                      class="select-with-word"
                      @change="(e: any) => updateCondition(i, { word: e.target._value })"
                    ></v-text-field>
                    <span style="margin-left: 10px">という</span>
                  </v-col>

                  <v-col cols="3">
                    <v-select
                      variant="underlined"
                      :model-value="item.matchType"
                      :items="matchType"
                      item-title="label"
                      item-value="value"
                      @update:model-value="(value) => updateCondition(i, { matchType: value })"
                    ></v-select>
                  </v-col>
                </template>

                <template v-if="store.getLocale() === 'en'">
                  <v-col cols="2">
                    <v-select
                      variant="underlined"
                      :model-value="item.definitionType"
                      :items="definitionTypeList"
                      item-title="label"
                      item-value="value"
                      class="select-with-word"
                      @update:model-value="(value) => updateCondition(i, { definitionType: value })"
                    ></v-select>
                  </v-col>

                  <v-col cols="3" class="pr-4">
                    <v-select
                      variant="underlined"
                      :model-value="item.matchType"
                      :items="matchType"
                      item-title="label"
                      item-value="value"
                      @update:model-value="(value) => updateCondition(i, { matchType: value })"
                    ></v-select>
                  </v-col>

                  <v-col cols="4" class="pl-4">
                    <v-text-field
                      variant="underlined"
                      :model-value="item.word"
                      @change="(e: any) => updateCondition(i, { word: e.target._value })"
                    ></v-text-field>
                  </v-col>
                </template>

                <v-col cols="1">
                  <v-btn
                    v-if="conditionGroup.conditions.length > 1"
                    variant="text"
                    icon
                    color="red"
                    @click="deleteCondition(i)"
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
import type {
  ScreenDefinitionConditionGroup,
  ScreenDefinitionType,
  ScreenMatchType
} from "@/lib/operationHistory/types";
import { useRootStore } from "@/stores/root";
import { computed, defineComponent } from "vue";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    conditionGroup: {
      type: Object as PropType<ScreenDefinitionConditionGroup>,
      default: () => {
        return { isEnabled: false, screenName: "", conditions: [] };
      },
      required: true
    },
    index: { type: Number, default: -1, required: true }
  },
  emits: ["update-condition-group", "delete-condition-group"],
  setup(props, context) {
    const store = useRootStore();
    const t = store.message;

    const definitionTypeList = computed((): { value: string; label: string }[] => {
      return [
        {
          value: "url",
          label: t("common.url")
        },
        {
          value: "title",
          label: t("common.page-title")
        },
        {
          value: "keyword",
          label: t("screen-def-unit.keyword")
        }
      ];
    });

    const matchType = computed((): { value: string; label: string }[] => {
      return [
        {
          value: "contains",
          label: t("screen-def-unit.contains")
        },
        {
          value: "equals",
          label: t("screen-def-unit.equals")
        },
        {
          value: "regex",
          label: t("screen-def-unit.regex")
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
