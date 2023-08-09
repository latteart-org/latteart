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
  <v-container pa-8 style="background-color: #eee">
    <v-row>
      <v-col cols="1">
        <v-checkbox
          :input-value="conditionGroup.isEnabled"
          @change="(isEnabled) => updateconditionGroup({ isEnabled })"
          class="default-flex"
        >
        </v-checkbox>
      </v-col>
      <v-col cols="9">
        <v-text-field
          :label="$store.getters.message('config-view.autofill.setting-name')"
          :value="conditionGroup.settingName"
          @change="(settingName) => updateconditionGroup({ settingName })"
        ></v-text-field>
      </v-col>
      <v-col cols="2">
        <v-btn @click="deleteConditionGroup" color="error">{{
          $store.getters.message("common.delete")
        }}</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-text-field
          label="url"
          :value="conditionGroup.url"
          @change="(url) => updateconditionGroup({ url })"
          class="px-1"
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          label="title"
          :value="conditionGroup.title"
          @change="(title) => updateconditionGroup({ title })"
          class="px-1"
        ></v-text-field>
      </v-col>
    </v-row>
    <div
      v-for="(item, index) in conditionGroup.inputValueConditions"
      :key="index"
    >
      <v-row>
        <v-col cols="1" style="text-align: center">
          <v-checkbox
            :input-value="item.isEnabled"
            @change="(isEnabled) => updateCondition(index, { isEnabled })"
            style="display: inline-block"
            class="px-1"
          ></v-checkbox>
        </v-col>
        <v-col cols="2">
          <v-select
            :label="$store.getters.message('config-view.autofill.locator-type')"
            :value="item.locatorType"
            @change="(locatorType) => updateCondition(index, { locatorType })"
            :items="locatorTypeList"
            class="px-1"
          ></v-select>
        </v-col>
        <v-col cols="2">
          <v-select
            :label="
              $store.getters.message('config-view.autofill.locator-match-type')
            "
            :value="item.locatorMatchType"
            @change="
              (locatorMatchType) => updateCondition(index, { locatorMatchType })
            "
            :items="locatorMatchType(item.locatorType)"
            class="px-1"
          ></v-select>
        </v-col>
        <v-col cols="2">
          <v-text-field
            :label="$store.getters.message('config-view.autofill.locator')"
            :value="item.locator"
            @change="(locator) => updateCondition(index, { locator })"
            class="px-1"
          ></v-text-field>
        </v-col>
        <v-col cols="2">
          <number-field
            :label="$store.getters.message('config-view.autofill.iframe-index')"
            :item="item.iframeIndex"
            :value="item.iframeIndex"
            :allowBlank="true"
            :minValue="0"
            @updateNumberFieldValue="
              (args) =>
                updateCondition(index, {
                  iframeIndex:
                    args.value === '' ? undefined : Number(args.value),
                })
            "
            class="px-1"
          >
          </number-field>
        </v-col>
        <v-col cols="2">
          <v-text-field
            :label="$store.getters.message('config-view.autofill.input-value')"
            :value="item.inputValue"
            @change="(value) => updateCondition(index, { inputValue: value })"
            class="px-1"
          ></v-text-field>
        </v-col>
        <v-col cols="1">
          <v-btn text icon @click="deleteCondition(index)" color="error"
            ><v-icon>delete</v-icon></v-btn
          >
        </v-col>
      </v-row>
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
import NumberField from "@/components/molecules/NumberField.vue";

@Component({
  components: {
    "screen-def-unit": ScreenDefUnit,
    "number-field": NumberField,
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

  private get locatorMatchType() {
    return (locatorType: "id" | "xpath") => {
      return locatorType === "id" ? ["equals", "contains"] : ["equals"];
    };
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
    if (condition.locatorType === "xpath") {
      condition.locatorMatchType = "equals";
    }
    console.log({ condition });
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
