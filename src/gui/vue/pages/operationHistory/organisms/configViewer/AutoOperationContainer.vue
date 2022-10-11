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
  <v-container class="mt-1 pt-0" style="background-color: #eee">
    <v-layout row>
      <v-flex xs10 class="mt-2">
        <v-layout row>
          <v-checkbox
            :style="{ maxWidth: '40px' }"
            :input-value="conditionGroup.isEnabled"
            @change="(isEnabled) => updateconditionGroup({ isEnabled })"
            class="default-flex"
          >
          </v-checkbox>
          <v-text-field
            :label="$store.getters.message('config-view.autoOperation.name')"
            :value="conditionGroup.settingName"
            @change="(settingName) => updateconditionGroup({ settingName })"
          ></v-text-field>
        </v-layout>
      </v-flex>
      <v-flex xs2 class="mt-2">
        <v-btn @click="deleteConditionGroup" color="error">{{
          $store.getters.message("common.delete")
        }}</v-btn>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex xs10>
        <v-textarea
          hide-details
          :style="{ paddingLeft: '40px !important' }"
          :label="$store.getters.message('config-view.autoOperation.details')"
          :value="conditionGroup.details"
          @change="(details) => updateconditionGroup({ details })"
          class="px-1"
        ></v-textarea>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { AutoOperationConditionGroup } from "@/lib/operationHistory/types";
import { Component, Prop, Vue } from "vue-property-decorator";
import ScreenDefUnit from "./ScreenDefUnit.vue";

@Component({
  components: {
    "screen-def-unit": ScreenDefUnit,
  },
})
export default class AutoOperationContainer extends Vue {
  @Prop({
    type: Object,
    default: null,
  })
  public readonly conditionGroup!: AutoOperationConditionGroup;

  @Prop({ type: Number, default: null })
  public readonly index!: number;

  private updateconditionGroup(
    conditionGroup: Partial<AutoOperationConditionGroup>
  ) {
    this.$emit("update-condition-group", conditionGroup, this.index);
  }

  private deleteConditionGroup() {
    this.$emit("delete-condition-group", this.index);
  }
}
</script>
