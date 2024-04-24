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
          density="comfortable"
          hide-details
          :model-value="conditionGroup.isEnabled"
          class="default-flex"
          @update:model-value="
            (isEnabled) => updateconditionGroup({ isEnabled: isEnabled ?? false })
          "
        >
        </v-checkbox>
      </v-col>
      <v-col cols="9">
        <v-text-field
          variant="underlined"
          :label="$t('config-page.autofill.setting-name')"
          :model-value="conditionGroup.settingName"
          @change="(e: any) => updateconditionGroup({ settingName: e.target._value })"
        ></v-text-field>
      </v-col>
      <v-col cols="2">
        <v-btn color="red" @click="deleteConditionGroup">{{ $t("common.delete") }}</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-text-field
          variant="underlined"
          label="url"
          :model-value="conditionGroup.url"
          class="px-1"
          @change="(e: any) => updateconditionGroup({ url: e.target._value })"
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          variant="underlined"
          label="title"
          :model-value="conditionGroup.title"
          class="px-1"
          @change="(e: any) => updateconditionGroup({ title: e.target._value })"
        ></v-text-field>
      </v-col>
    </v-row>
    <div v-for="(item, i) in conditionGroup.inputValueConditions" :key="i">
      <v-row>
        <v-col cols="1" style="text-align: center">
          <v-checkbox
            density="comfortable"
            hide-details
            :model-value="item.isEnabled"
            style="display: inline-block"
            class="px-1"
            @update:model-value="
              (isEnabled) => updateCondition(i, { isEnabled: isEnabled ?? false })
            "
          ></v-checkbox>
        </v-col>
        <v-col cols="2">
          <v-select
            variant="underlined"
            :label="$t('config-page.autofill.locator-type')"
            :model-value="item.locatorType"
            :items="locatorTypeList"
            class="px-1"
            @update:model-value="(locatorType) => updateCondition(i, { locatorType })"
          ></v-select>
        </v-col>
        <v-col cols="2">
          <v-select
            variant="underlined"
            :label="$t('config-page.autofill.locator-match-type')"
            :model-value="item.locatorMatchType"
            :items="locatorMatchType(item.locatorType)"
            class="px-1"
            @update:model-value="(locatorMatchType) => updateCondition(i, { locatorMatchType })"
          ></v-select>
        </v-col>
        <v-col cols="2">
          <v-text-field
            variant="underlined"
            :label="$t('config-page.autofill.locator')"
            :model-value="item.locator"
            class="px-1"
            @change="(e: any) => updateCondition(i, { locator: e.target._value })"
          ></v-text-field>
        </v-col>
        <v-col cols="2">
          <number-field
            :label="$t('config-page.autofill.iframe-index')"
            :item="item.iframeIndex"
            :value="item.iframeIndex"
            :allow-blank="true"
            :min-value="0"
            class="px-1"
            @update-number-field-value="
              (args) =>
                updateCondition(i, {
                  iframeIndex: args.value === '' ? undefined : Number(args.value)
                })
            "
          >
          </number-field>
        </v-col>
        <v-col cols="2">
          <v-text-field
            variant="underlined"
            :label="$t('config-page.autofill.input-value')"
            :model-value="item.inputValue"
            class="px-1"
            @change="(e: any) => updateCondition(i, { inputValue: e.target._value })"
          ></v-text-field>
        </v-col>
        <v-col cols="1">
          <v-btn variant="text" icon color="red" @click="deleteCondition(i)"
            ><v-icon>delete</v-icon></v-btn
          >
        </v-col>
      </v-row>
    </div>
    <v-btn @click="addCondition">{{ $t("config-page.autofill.adding-autofill-values") }}</v-btn>
  </v-container>
</template>

<script lang="ts">
import { type AutofillCondition, type AutofillConditionGroup } from "@/lib/operationHistory/types";
import NumberField from "@/components/molecules/NumberField.vue";
import { computed, defineComponent, type PropType } from "vue";

export default defineComponent({
  components: {
    "number-field": NumberField
  },
  props: {
    conditionGroup: {
      type: Object as PropType<AutofillConditionGroup>,
      default: null,
      required: true
    },
    index: { type: Number, default: null, required: true }
  },
  emits: [
    "add-condition",
    "update-condition-group",
    "update-condition",
    "delete-condition-group",
    "delete-condition"
  ],
  setup(props, context) {
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
