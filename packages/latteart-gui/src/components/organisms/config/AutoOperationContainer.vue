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
          class="default-flex"
          @update:model-value="
            (isEnabled) => updateConditionGroup({ isEnabled: isEnabled ?? !(isEnabled === null) })
          "
        >
        </v-checkbox>
      </v-col>
      <v-col cols="8">
        <v-text-field
          :label="$t('config-page.autoOperation.name')"
          :model-value="conditionGroup.settingName"
          @change="(e: any) => updateConditionGroup({ settingName: e.target._value })"
        ></v-text-field>
      </v-col>
      <v-col cols="3" class="d-flex align-center pt-0">
        <v-btn variant="elevated" @click="dialogOpened = true">{{
          $t("config-page.autoOperation.details-list")
        }}</v-btn>
        <v-btn variant="elevated" color="error" class="ml-4" @click="deleteConditionGroup">{{
          $t("common.delete")
        }}</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="1" />
      <v-col cols="9">
        <v-textarea
          hide-details
          :label="$t('config-page.autoOperation.details')"
          :model-value="conditionGroup.details"
          class="px-1"
          @change="(e: any) => updateConditionGroup({ details: e.target._value })"
        ></v-textarea>
      </v-col>
      <v-col cols="2" />
    </v-row>
    <auto-operation-dialog
      :opened="dialogOpened"
      :auto-operations="conditionGroup.autoOperations"
      :items-per-page="10"
      @close="dialogOpened = false"
    />
  </v-container>
</template>

<script lang="ts">
import { type AutoOperationConditionGroup } from "@/lib/operationHistory/types";
import AutoOperationDialog from "../dialog/AutoOperationDialog.vue";
import { defineComponent, ref } from "vue";
import type { PropType } from "vue";
import { useRootStore } from "@/stores/root";

export default defineComponent({
  components: {
    "auto-operation-dialog": AutoOperationDialog
  },
  props: {
    conditionGroup: {
      type: Object as PropType<AutoOperationConditionGroup>,
      default: null,
      required: true
    },
    index: { type: Number, default: null, required: true }
  },
  emits: ["delete-condition-group", "update-condition-group"],

  setup(props, context) {
    const dialogOpened = ref(false);

    const updateConditionGroup = (conditionGroup: Partial<AutoOperationConditionGroup>) => {
      context.emit("update-condition-group", conditionGroup, props.index);
    };

    const deleteConditionGroup = () => {
      context.emit("delete-condition-group", props.index);
    };

    return {
      t: useRootStore().message,
      dialogOpened,
      updateConditionGroup,
      deleteConditionGroup
    };
  }
});
</script>
