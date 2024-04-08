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
        <p v-if="conditionGroups < 1">
          {{ store.getters.message("config-page.no-data") }}
        </p>
        <auto-operation-container
          v-for="(group, index) in conditionGroups"
          :key="index"
          :conditionGroup="group"
          :index="index"
          @update-condition-group="updateConditionGroup"
          @delete-condition-group="deleteConditionGroup"
          class="mt-4"
        ></auto-operation-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {
  AutoOperationSetting as AutoOperationSettingConfig,
  AutoOperationConditionGroup
} from "@/lib/operationHistory/types";
import AutoOperationContainer from "./AutoOperationContainer.vue";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, required: true },
    autoOperationSetting: {
      type: Object as PropType<AutoOperationSettingConfig>,
      default: null,
      required: true
    }
  },
  components: {
    "auto-operation-container": AutoOperationContainer
  },
  setup(props, context) {
    const store = useStore();

    const tempConfig = ref<AutoOperationSettingConfig>({
      ...props.autoOperationSetting
    });

    const updateTempConfig = (): void => {
      if (!props.opened) {
        tempConfig.value = { ...props.autoOperationSetting };
      }
    };

    const saveConfig = (): void => {
      if (props.opened) {
        context.emit("save-config", { autoOperationSetting: tempConfig.value });
      }
    };

    const conditionGroups = computed((): AutoOperationConditionGroup[] => {
      return tempConfig.value.conditionGroups;
    });

    const updateConditionGroup = (
      conditionGroup: Partial<AutoOperationConditionGroup>,
      index: number
    ) => {
      const config = { ...tempConfig.value };
      config.conditionGroups = config.conditionGroups.map((group, i) => {
        if (index === i) {
          return {
            ...group,
            ...conditionGroup
          };
        }
        return group;
      });
      tempConfig.value = config;
    };

    const deleteConditionGroup = (index: number) => {
      const config = { ...tempConfig.value };
      config.conditionGroups = config.conditionGroups.filter((c, i) => index !== i);
      tempConfig.value = config;
    };

    const { autoOperationSetting } = toRefs(props);
    watch(autoOperationSetting, updateTempConfig);
    watch(tempConfig, saveConfig);

    return {
      store,
      conditionGroups,
      updateConditionGroup,
      deleteConditionGroup
    };
  }
});
</script>
