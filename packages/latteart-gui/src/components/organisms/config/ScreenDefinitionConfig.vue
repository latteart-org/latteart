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
        <h4>
          {{ store.getters.message("config-page.screen-def.default-screen-definition") }}
        </h4>
        <v-radio-group
          :model-value="tempConfig.screenDefType"
          class="py-0 my-0"
          inline
          @update:model-value="changeScreenDefType"
        >
          <v-radio
            :label="store.getters.message('config-page.screen-def.judgement-title')"
            value="title"
          ></v-radio>
          <v-radio
            :label="store.getters.message('config-page.screen-def.judgement-url')"
            value="url"
          ></v-radio>
        </v-radio-group>
      </v-col>
      <v-col cols="12">
        <h4>
          {{ store.getters.message("config-page.screen-def.priority-condition") }}
        </h4>
        <screen-def-unit-container
          :screenDefinition="tempConfig"
          @update-condition-groups="updateConditionGroups"
        ></screen-def-unit-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ScreenDefinitionSetting } from "@/lib/common/settings/Settings";
import { ScreenDefinitionConditionGroup } from "@/lib/operationHistory/types";
import ScreenDefUnitContainer from "./ScreenDefUnitContainer.vue";
import { defineComponent, ref, toRefs, watch } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, required: true },
    screenDefinition: {
      type: Object as PropType<ScreenDefinitionSetting>,
      default: null,
      required: true
    }
  },
  components: {
    "screen-def-unit-container": ScreenDefUnitContainer
  },
  setup(props, context) {
    const store = useStore();

    const tempConfig = ref<ScreenDefinitionSetting>({
      ...props.screenDefinition
    });

    const updateTempConfig = () => {
      if (!props.opened) {
        tempConfig.value = { ...props.screenDefinition };
      }
    };

    const saveConfig = (): void => {
      if (props.opened) {
        context.emit("save-config", { screenDefinition: tempConfig.value });
      }
    };

    const updateConditionGroups = (conditionGroups: ScreenDefinitionConditionGroup[]) => {
      tempConfig.value = { ...tempConfig.value, conditionGroups };
    };

    const changeScreenDefType = (screenDefType: "title" | "url"): void => {
      tempConfig.value = { ...tempConfig.value, screenDefType };
    };

    const { screenDefinition } = toRefs(props);
    watch(screenDefinition, updateTempConfig);
    watch(tempConfig, saveConfig);

    return {
      store,
      tempConfig,
      updateConditionGroups,
      changeScreenDefType
    };
  }
});
</script>
