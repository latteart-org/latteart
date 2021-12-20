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
  <v-container class="mt-0 pt-0">
    <v-btn @click="addScreenDefinitionConditions">{{
      $store.getters.message("config-view.screen-def.advanced-add")
    }}</v-btn>
    <draggable
      :list="conditionGroups"
      @start="dragging = true"
      @end="dragging = false"
      @change="changeConditionGroups"
    >
      <screen-def-unit
        v-for="(item, index) in conditionGroups"
        :key="index + item.screenName"
        :conditionGroup="item"
        :index="index"
        @update-unit="updateScreenDefinitionConditions"
      ></screen-def-unit>
    </draggable>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ScreenDefUnit from "./ScreenDefUnit.vue";
import { ScreenDefinitionConditionGroup } from "@/lib/operationHistory/types";
import draggable from "vuedraggable";

@Component({
  components: {
    "screen-def-unit": ScreenDefUnit,
    draggable: draggable,
  },
})
export default class ScreenDefUnitContainer extends Vue {
  private get conditionGroups(): Array<ScreenDefinitionConditionGroup> {
    return (
      this.$store.state.operationHistory.config.screenDefinition
        .conditionGroups ?? []
    );
  }

  private changeConditionGroups(): void {
    this.$store.commit("operationHistory/setCanUpdateModels", {
      canUpdateModels: true,
    });
  }

  private addScreenDefinitionConditions() {
    const addConditions = this.conditionGroups.slice();
    addConditions.push({
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
    (async () => {
      await this.$store.dispatch("operationHistory/writeSettings", {
        config: {
          screenDefinition: {
            screenDefType: this.$store.state.operationHistory.config
              .screenDefinition.screenDefType,
            conditionGroups: addConditions,
          },
        },
      });
      this.$store.commit("operationHistory/setCanUpdateModels", {
        canUpdateModels: true,
      });
    })();
  }

  private updateScreenDefinitionConditions(screenDefinitionConditionsWithindex: {
    conditionGroup?: ScreenDefinitionConditionGroup;
    index: number;
  }) {
    const conditionGroups = screenDefinitionConditionsWithindex.conditionGroup
      ? this.conditionGroups.map((def, index) => {
          if (index === screenDefinitionConditionsWithindex.index) {
            return screenDefinitionConditionsWithindex.conditionGroup;
          }
          return def;
        })
      : this.conditionGroups.filter((def, index) => {
          if (index === screenDefinitionConditionsWithindex.index) {
            return false;
          }
          return true;
        });

    (async () => {
      await this.$store.dispatch("operationHistory/writeSettings", {
        config: {
          screenDefinition: {
            screenDefType: this.$store.state.operationHistory.config
              .screenDefinition.screenDefType,
            conditionGroups,
          },
        },
      });
      this.$store.commit("operationHistory/setCanUpdateModels", {
        canUpdateModels: true,
      });
    })();
  }
}
</script>

<style lang="sass" scoped>
.center
  text-align: center
</style>
