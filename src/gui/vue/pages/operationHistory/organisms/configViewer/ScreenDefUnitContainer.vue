<!--
 Copyright 2022 NTT Corporation.

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
  <v-container class="mt-0 pt-0">
    <v-btn @click="addConditionGroup">{{
      $store.getters.message("config-view.screen-def.advanced-add")
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
import { Component, Prop, Vue } from "vue-property-decorator";
import ScreenDefUnit from "./ScreenDefUnit.vue";
import { ScreenDefinitionConditionGroup } from "@/lib/operationHistory/types";
import draggable from "vuedraggable";
import { ScreenDefinition } from "@/lib/common/settings/Settings";

@Component({
  components: {
    "screen-def-unit": ScreenDefUnit,
    draggable: draggable,
  },
})
export default class ScreenDefUnitContainer extends Vue {
  @Prop({ type: Object, default: null })
  public readonly screenDefinition!: ScreenDefinition;

  private get conditionGroups(): Array<ScreenDefinitionConditionGroup> {
    return this.screenDefinition?.conditionGroups ?? [];
  }

  private set conditionGroups(
    conditionGroups: Array<ScreenDefinitionConditionGroup>
  ) {
    this.$emit("update-condition-groups", conditionGroups);
  }

  private changeOrder() {
    this.conditionGroups = [...this.conditionGroups];
  }

  private addConditionGroup() {
    const conditionGroups = this.conditionGroups;
    conditionGroups.push({
      isEnabled: true,
      screenName: "",
      conditions: [
        {
          isEnabled: true,
          definitionType: "url",
          matchType: "contains",
          word: "",
        },
      ],
    });
    this.conditionGroups = conditionGroups;
  }

  private deleteConditionGroup(groupIndex: number) {
    this.conditionGroups = this.conditionGroups.filter(
      (g, i) => i !== groupIndex
    );
  }

  private updateConditionGroup(conditionGroupWithindex: {
    conditionGroup: ScreenDefinitionConditionGroup;
    index: number;
  }) {
    this.conditionGroups = this.conditionGroups.map((c, i) => {
      return conditionGroupWithindex.index !== i
        ? c
        : conditionGroupWithindex.conditionGroup;
    });
  }
}
</script>

<style lang="sass" scoped>
.center
  text-align: center
</style>
