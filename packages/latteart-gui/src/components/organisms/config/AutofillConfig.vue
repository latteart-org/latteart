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
  <v-container class="mt-0 pt-0">
    <v-row>
      <v-col cols="12" class="py-0 my-0">
        <v-checkbox
          v-model="autoPopupRegistrationDialog"
          :label="store.getters.message('config-page.autofill.auto-popup-registration')"
        >
        </v-checkbox>
      </v-col>
      <v-col cols="12" class="py-0 my-0">
        <v-checkbox
          v-model="autoPopupSelectionDialog"
          :label="store.getters.message('config-page.autofill.auto-popup-selection')"
        >
        </v-checkbox>
      </v-col>
      <v-col cols="12" class="py-0 my-0">
        <v-btn @click="addConditionGroup">{{
          store.getters.message("config-page.autofill.add-setting")
        }}</v-btn>
      </v-col>
      <v-col cols="12" class="py-0 mt-6">
        <autofill-input-value-container
          v-for="(group, index) in conditionGroups"
          :key="index"
          :conditionGroup="group"
          :index="index"
          @add-condition="addCondition"
          @update-condition-group="updateConditionGroup"
          @update-condition="updateCondition"
          @delete-condition-group="deleteConditionGroup"
          @delete-condition="deleteCondition"
          class="mt-4"
        ></autofill-input-value-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {
  AutofillSetting as AutofillSettingConfig,
  AutofillCondition,
  AutofillConditionGroup
} from "@/lib/operationHistory/types";
import AutofillInputValueContainer from "./AutofillInputValueContainer.vue";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, required: true },
    autofillSetting: {
      type: Object as PropType<AutofillSettingConfig>,
      default: null,
      required: true
    }
  },
  components: {
    "autofill-input-value-container": AutofillInputValueContainer
  },
  setup(props, context) {
    const store = useStore();

    const tempConfig = ref<AutofillSettingConfig>({ ...props.autofillSetting });

    const updateTempConfig = (): void => {
      if (!props.opened) {
        tempConfig.value = { ...props.autofillSetting };
      }
    };

    const saveConfig = (): void => {
      if (props.opened) {
        context.emit("save-config", { autofillSetting: tempConfig.value });
      }
    };

    const conditionGroups = computed((): AutofillConditionGroup[] => {
      return tempConfig.value.conditionGroups;
    });

    const autoPopupRegistrationDialog = computed({
      get: (): boolean => tempConfig.value.autoPopupRegistrationDialog,
      set: (autoPopupRegistrationDialog: boolean) => {
        tempConfig.value = { ...tempConfig.value, autoPopupRegistrationDialog };
      }
    });

    const autoPopupSelectionDialog = computed({
      get: (): boolean => tempConfig.value.autoPopupSelectionDialog,
      set: (autoPopupSelectionDialog: boolean) => {
        tempConfig.value = { ...tempConfig.value, autoPopupSelectionDialog };
      }
    });

    const addConditionGroup = () => {
      const config = { ...tempConfig.value };
      config.conditionGroups.push({
        isEnabled: true,
        settingName: "",
        url: "",
        title: "",
        inputValueConditions: []
      });
      tempConfig.value = config;
    };

    const updateConditionGroup = (
      conditionGroup: Partial<AutofillConditionGroup>,
      index: number
    ) => {
      const config = { ...tempConfig.value };
      config.conditionGroups = config.conditionGroups.map((group, i) => {
        if (index === i) {
          return { ...group, ...conditionGroup };
        }
        return group;
      });
      tempConfig.value = config;
    };

    const addCondition = (index: number) => {
      const config = { ...tempConfig.value };
      config.conditionGroups = config.conditionGroups.map((g, i) => {
        if (index === i) {
          g.inputValueConditions.push({
            isEnabled: true,
            locatorType: "id",
            locator: "",
            locatorMatchType: "equals",
            inputValue: ""
          });
        }
        return g;
      });
      tempConfig.value = config;
    };

    const updateCondition = (
      condition: Partial<AutofillCondition>,
      conditionIndex: number,
      conditionGroupIndex: number
    ) => {
      const config = { ...tempConfig.value };
      config.conditionGroups = config.conditionGroups.map((g, i) => {
        if (conditionGroupIndex === i) {
          g.inputValueConditions = g.inputValueConditions.map((c, j) => {
            return conditionIndex === j ? { ...c, ...condition } : c;
          });
        }
        return g;
      });
      tempConfig.value = config;
    };

    const deleteConditionGroup = (index: number) => {
      const config = { ...tempConfig.value };
      config.conditionGroups = config.conditionGroups.filter((c, i) => index !== i);
      tempConfig.value = config;
    };

    const deleteCondition = (conditionIndex: number, conditionGroupIndex: number) => {
      const config = { ...tempConfig.value };
      config.conditionGroups = config.conditionGroups.map((g, i) => {
        if (conditionGroupIndex === i) {
          g.inputValueConditions = g.inputValueConditions.filter((c, j) => conditionIndex !== j);
        }
        return g;
      });
      tempConfig.value = config;
    };

    const { autofillSetting } = toRefs(props);
    watch(autofillSetting, updateTempConfig);
    watch(tempConfig, saveConfig);

    return {
      store,
      conditionGroups,
      autoPopupRegistrationDialog,
      autoPopupSelectionDialog,
      addConditionGroup,
      updateConditionGroup,
      addCondition,
      updateCondition,
      deleteConditionGroup,
      deleteCondition
    };
  }
});
</script>
