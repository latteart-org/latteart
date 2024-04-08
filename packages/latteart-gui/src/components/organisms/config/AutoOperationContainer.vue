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
  <v-container class="pa-4" style="background-color: #eee">
    <v-row>
      <v-col cols="1" align="right">
        <v-checkbox
          :style="{ maxWidth: '40px' }"
          :model-value="conditionGroup.isEnabled"
          @update:model-value="(isEnabled) => updateconditionGroup({ isEnabled })"
          class="default-flex"
        >
        </v-checkbox>
      </v-col>
      <v-col cols="8">
        <v-text-field
          :label="store.getters.message('config-page.autoOperation.name')"
          :model-value="conditionGroup.settingName"
          @change="(settingName) => updateconditionGroup({ settingName })"
        ></v-text-field>
      </v-col>
      <v-col cols="3" class="d-flex align-center pt-0">
        <v-btn @click="dialogOpened = true">{{
          store.getters.message("config-page.autoOperation.details-list")
        }}</v-btn>
        <v-btn @click="deleteConditionGroup" color="error" class="ml-4">{{
          store.getters.message("common.delete")
        }}</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="1" />
      <v-col cols="9">
        <v-textarea
          hide-details
          :label="store.getters.message('config-page.autoOperation.details')"
          :model-value="conditionGroup.details"
          @change="(details) => updateconditionGroup({ details })"
          class="px-1"
        ></v-textarea>
      </v-col>
      <v-col cols="2" />
    </v-row>
    <auto-operation-dialog
      :opened="dialogOpened"
      :autoOperations="conditionGroup.autoOperations"
      :itemsPerPage="10"
      @close="dialogOpened = false"
    />
  </v-container>
</template>

<script lang="ts">
import { AutoOperationConditionGroup } from "@/lib/operationHistory/types";
import AutoOperationDialog from "../dialog/AutoOperationDialog.vue";
import ScreenDefUnit from "./ScreenDefUnit.vue";
import { defineComponent, ref } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    conditionGroup: {
      type: Object as PropType<AutoOperationConditionGroup>,
      default: null,
      required: true
    },
    index: { type: Number, default: null, required: true }
  },
  components: {
    "screen-def-unit": ScreenDefUnit,
    "auto-operation-dialog": AutoOperationDialog
  },
  setup(props, context) {
    const store = useStore();

    const dialogOpened = ref(false);

    const updateconditionGroup = (conditionGroup: Partial<AutoOperationConditionGroup>) => {
      context.emit("update-condition-group", conditionGroup, props.index);
    };

    const deleteConditionGroup = () => {
      context.emit("delete-condition-group", props.index);
    };

    return {
      store,
      dialogOpened,
      updateconditionGroup,
      deleteConditionGroup
    };
  }
});
</script>
