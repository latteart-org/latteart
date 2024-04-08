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
  <v-container class="mt-4 pt-0">
    <v-btn @click="addConditionGroup">{{
      store.getters.message("config-page.screen-def.advanced-add")
    }}</v-btn>
    <draggable
      :list="conditionGroups"
      @start="dragging = true"
      @end="dragging = false"
      @change="changeOrder"
    >
      <screen-def-unit
        v-for="(item, index) in conditionGroups"
        :key="index + item.screenName"
        :conditionGroup="item"
        :index="index"
        @update-condition-group="updateConditionGroup"
        @delete-condition-group="deleteConditionGroup"
      ></screen-def-unit>
    </draggable>
  </v-container>
</template>

<script lang="ts">
import ScreenDefUnit from "./ScreenDefUnit.vue";
import { ScreenDefinitionConditionGroup } from "@/lib/operationHistory/types";
import draggable from "vuedraggable";
import { ScreenDefinitionSetting } from "@/lib/common/settings/Settings";
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    screenDefinition: {
      type: Object as PropType<ScreenDefinitionSetting>,
      default: null,
      required: true
    }
  },
  components: {
    "screen-def-unit": ScreenDefUnit,
    draggable: draggable
  },
  setup(props, context) {
    const store = useStore();

    const conditionGroups = computed({
      get: (): ScreenDefinitionConditionGroup[] => props.screenDefinition?.conditionGroups ?? [],
      set: (conditionGroups: ScreenDefinitionConditionGroup[]) => {
        context.emit("update-condition-groups", conditionGroups);
      }
    });

    const changeOrder = () => {
      conditionGroups.value = [...conditionGroups.value];
    };

    const addConditionGroup = () => {
      const targetConditionGroups = conditionGroups.value;
      targetConditionGroups.push({
        isEnabled: true,
        screenName: "",
        conditions: [
          {
            isEnabled: true,
            definitionType: "url",
            matchType: "contains",
            word: ""
          }
        ]
      });
      conditionGroups.value = targetConditionGroups;
    };

    const deleteConditionGroup = (groupIndex: number) => {
      conditionGroups.value = conditionGroups.value.filter((g, i) => i !== groupIndex);
    };

    const updateConditionGroup = (conditionGroupWithindex: {
      conditionGroup: ScreenDefinitionConditionGroup;
      index: number;
    }) => {
      conditionGroups.value = conditionGroups.value.map((c, i) => {
        return conditionGroupWithindex.index !== i ? c : conditionGroupWithindex.conditionGroup;
      });
    };

    return {
      store,
      conditionGroups,
      changeOrder,
      addConditionGroup,
      deleteConditionGroup,
      updateConditionGroup
    };
  }
});
</script>

<style lang="sass" scoped>
.center
  text-align: center
</style>
