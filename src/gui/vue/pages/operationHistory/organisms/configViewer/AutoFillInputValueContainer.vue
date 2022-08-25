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
      <v-flex xs1>
        <v-checkbox
          :input-value="conditionGroup.isEnabled"
          @change="(isEnabled) => updateconditionGroup({ isEnabled })"
          class="default-flex"
        >
        </v-checkbox>
      </v-flex>
      <v-flex xs9>
        <v-text-field
          :label="$store.getters.message('config-view.autofill.setting-name')"
          :value="conditionGroup.settingName"
          @change="(settingName) => updateconditionGroup({ settingName })"
        ></v-text-field>
      </v-flex>
      <v-flex xs2>
        <v-btn @click="deleteConditionGroup" color="error">{{
          $store.getters.message("common.delete")
        }}</v-btn>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex xs6>
        <v-text-field
          label="url"
          :value="conditionGroup.url"
          @change="(url) => updateconditionGroup({ url })"
          class="px-1"
        ></v-text-field>
      </v-flex>
      <v-flex xs6>
        <v-text-field
          label="title"
          :value="conditionGroup.title"
          @change="(title) => updateconditionGroup({ title })"
          class="px-1"
        ></v-text-field>
      </v-flex>
    </v-layout>
    <div
      v-for="(item, index) in conditionGroup.inputValueConditions"
      :key="index"
    >
      <v-layout row>
        <v-flex xs1 style="text-align: center">
          <v-checkbox
            :input-value="item.isEnabled"
            @change="(isEnabled) => updateCondition(index, { isEnabled })"
            style="display: inline-block"
            class="px-1"
          ></v-checkbox>
        </v-flex>
        <v-flex xs2>
          <v-select
            :label="$store.getters.message('config-view.autofill.locator-type')"
            :value="item.locatorType"
            @change="(locatorType) => updateCondition(index, { locatorType })"
            :items="locatorTypeList"
            class="px-1"
          ></v-select>
        </v-flex>
        <v-flex xs2>
          <v-select
            :label="
              $store.getters.message('config-view.autofill.locator-match-type')
            "
            :value="item.locatorMatchType"
            @change="
              (locatorMatchType) => updateCondition(index, { locatorMatchType })
            "
            :items="locatorMatchType"
            class="px-1"
          ></v-select>
        </v-flex>
        <v-flex xs3>
          <v-text-field
            :label="$store.getters.message('config-view.autofill.locator')"
            :value="item.locator"
            @change="(locator) => updateCondition(index, { locator })"
            class="px-1"
          ></v-text-field>
        </v-flex>
        <v-flex xs3>
          <v-text-field
            :label="$store.getters.message('config-view.autofill.input-value')"
            :value="item.inputValue"
            @change="(value) => updateCondition(index, { inputValue: value })"
            class="px-1"
          ></v-text-field>
        </v-flex>
        <v-flex xs1>
          <v-btn flat icon @click="deleteCondition(index)" color="error"
            ><v-icon>delete</v-icon></v-btn
          >
        </v-flex>
      </v-layout>
    </div>
    <v-btn @click="addCondition">{{
      $store.getters.message("config-view.autofill.adding-autofill-values")
    }}</v-btn>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import ScreenDefUnit from "./ScreenDefUnit.vue";
import {
  AutofillCondition,
  AutofillConditionGroup,
} from "@/lib/operationHistory/types";

@Component({
  components: {
    "screen-def-unit": ScreenDefUnit,
  },
})
export default class AutoFillInputValueContainer extends Vue {
  @Prop({
    type: Object,
    default: null,
  })
  public readonly conditionGroup!: AutofillConditionGroup;

  @Prop({ type: Number, default: null })
  public readonly index!: number;

  private get locatorTypeList() {
    return ["id", "xpath"];
  }

  private get definitionTypeList() {
    return ["url", "title", "keyword"];
  }

  private get locatorMatchType() {
    return ["equals", "regex"];
  }

  private get screenMatchTypeList() {
    return ["contains", "equals", "regex"];
  }

  private addCondition() {
    this.$emit("add-condition", this.index);
  }

  private updateconditionGroup(
    conditionGroup: Partial<AutofillConditionGroup>
  ) {
    this.$emit("update-condition-group", conditionGroup, this.index);
  }

  private updateCondition(
    index: number,
    condition: Partial<AutofillCondition>
  ) {
    this.$emit("update-condition", condition, index, this.index);
  }

  private deleteConditionGroup() {
    this.$emit("delete-condition-group", this.index);
  }

  private deleteCondition(index: number) {
    this.$emit("delete-condition", index, this.index);
  }
}
</script>

<style lang="sass" scoped>
.center
  text-align: center

.pre-wrap
  white-space: pre-wrap
</style>
