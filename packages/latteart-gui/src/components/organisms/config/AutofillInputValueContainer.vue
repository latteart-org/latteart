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
  <v-container class="pa-8" style="background-color: #eee">
    <v-row>
      <v-col cols="1">
        <v-checkbox
          :model-value="conditionGroup.isEnabled"
          @update:model-value="(isEnabled) => updateconditionGroup({ isEnabled })"
          class="default-flex"
        >
        </v-checkbox>
      </v-col>
      <v-col cols="9">
        <v-text-field
          :label="store.getters.message('config-page.autofill.setting-name')"
          :model-value="conditionGroup.settingName"
          @change="(settingName) => updateconditionGroup({ settingName })"
        ></v-text-field>
      </v-col>
      <v-col cols="2">
        <v-btn @click="deleteConditionGroup" color="error">{{
          store.getters.message("common.delete")
        }}</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-text-field
          label="url"
          :model-value="conditionGroup.url"
          @change="(url) => updateconditionGroup({ url })"
          class="px-1"
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          label="title"
          :model-value="conditionGroup.title"
          @change="(title) => updateconditionGroup({ title })"
          class="px-1"
        ></v-text-field>
      </v-col>
    </v-row>
    <div v-for="(item, index) in conditionGroup.inputValueConditions" :key="index">
      <v-row>
        <v-col cols="1" style="text-align: center">
          <v-checkbox
            :model-value="item.isEnabled"
            @update:model-value="(isEnabled) => updateCondition(index, { isEnabled })"
            style="display: inline-block"
            class="px-1"
          ></v-checkbox>
        </v-col>
        <v-col cols="2">
          <v-select
            :label="store.getters.message('config-page.autofill.locator-type')"
            :model-value="item.locatorType"
            @update:model-value="(locatorType) => updateCondition(index, { locatorType })"
            :items="locatorTypeList"
            class="px-1"
          ></v-select>
        </v-col>
        <v-col cols="2">
          <v-select
            :label="store.getters.message('config-page.autofill.locator-match-type')"
            :model-value="item.locatorMatchType"
            @update:model-value="(locatorMatchType) => updateCondition(index, { locatorMatchType })"
            :items="locatorMatchType(item.locatorType)"
            class="px-1"
          ></v-select>
        </v-col>
        <v-col cols="2">
          <v-text-field
            :label="store.getters.message('config-page.autofill.locator')"
            :model-value="item.locator"
            @change="(locator) => updateCondition(index, { locator })"
            class="px-1"
          ></v-text-field>
        </v-col>
        <v-col cols="2">
          <number-field
            :label="store.getters.message('config-page.autofill.iframe-index')"
            :item="item.iframeIndex"
            :value="item.iframeIndex"
            :allowBlank="true"
            :minValue="0"
            @updateNumberFieldValue="
              (args) =>
                updateCondition(index, {
                  iframeIndex: args.value === '' ? undefined : Number(args.value)
                })
            "
            class="px-1"
          >
          </number-field>
        </v-col>
        <v-col cols="2">
          <v-text-field
            :label="store.getters.message('config-page.autofill.input-value')"
            :model-value="item.inputValue"
            @change="(value) => updateCondition(index, { inputValue: value })"
            class="px-1"
          ></v-text-field>
        </v-col>
        <v-col cols="1">
          <v-btn variant="text" icon @click="deleteCondition(index)" color="error"
            ><v-icon>delete</v-icon></v-btn
          >
        </v-col>
      </v-row>
    </div>
    <v-btn @click="addCondition">{{
      store.getters.message("config-page.autofill.adding-autofill-values")
    }}</v-btn>
  </v-container>
</template>

<script lang="ts">
import ScreenDefUnit from "./ScreenDefUnit.vue";
import { AutofillCondition, AutofillConditionGroup } from "@/lib/operationHistory/types";
import NumberField from "@/components/molecules/NumberField.vue";
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    conditionGroup: {
      type: Object as PropType<AutofillConditionGroup>,
      default: null,
      required: true
    },
    index: { type: Number, default: null, required: true }
  },
  components: {
    "screen-def-unit": ScreenDefUnit,
    "number-field": NumberField
  },
  setup(props, context) {
    const store = useStore();

    const locatorTypeList = computed(() => {
      return ["id", "xpath"];
    });

    const locatorMatchType = computed(() => {
      return (locatorType: "id" | "xpath") => {
        return locatorType === "id" ? ["equals", "contains"] : ["equals"];
      };
    });

    const addCondition = () => {
      context.emit("add-condition", props.index);
    };

    const updateconditionGroup = (conditionGroup: Partial<AutofillConditionGroup>) => {
      context.emit("update-condition-group", conditionGroup, props.index);
    };

    const updateCondition = (index: number, condition: Partial<AutofillCondition>) => {
      if (condition.locatorType === "xpath") {
        condition.locatorMatchType = "equals";
      }
      context.emit("update-condition", condition, index, props.index);
    };

    const deleteConditionGroup = () => {
      context.emit("delete-condition-group", props.index);
    };

    const deleteCondition = (index: number) => {
      context.emit("delete-condition", index, props.index);
    };

    return {
      store,
      locatorTypeList,
      locatorMatchType,
      addCondition,
      updateconditionGroup,
      updateCondition,
      deleteConditionGroup,
      deleteCondition
    };
  }
});
</script>

<style lang="sass" scoped>
.center
  text-align: center

.pre-wrap
  white-space: pre-wrap
</style>
