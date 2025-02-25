<!--
 Copyright 2025 NTT Corporation.

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
  <v-expansion-panel>
    <v-expansion-panel-title>
      <v-container class="pa-0">
        <v-row class="align-center">
          <v-col cols="1">
            <v-checkbox
              :style="{ maxWidth: '40px' }"
              :model-value="conditionGroup.isEnabled"
              hide-details
              @click.stop
              @update:model-value="
                (isEnabled) => updateConditionGroup({ isEnabled: isEnabled ?? false })
              "
            >
            </v-checkbox>
          </v-col>
          <v-col cols="8">
            <v-text-field
              variant="underlined"
              :label="$t('common.operation-set-name')"
              :model-value="conditionGroup.settingName"
              @change="(e: any) => updateConditionGroup({ settingName: e.target._value })"
            ></v-text-field>
          </v-col>
          <v-col cols="3" class="d-flex align-center">
            <v-btn @click.stop="dialogOpened = true">{{ $t("common.details") }}</v-btn>
            <v-btn color="red" class="ml-4" @click.stop="deleteConditionGroup">{{
              $t("common.delete")
            }}</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <v-container class="pa-0 ma-0">
        <v-row>
          <v-col cols="1" />
          <v-col cols="9">
            <v-textarea
              variant="underlined"
              hide-details
              :label="$t('common.operation-set-details')"
              :model-value="conditionGroup.details"
              @change="(e: any) => updateConditionGroup({ details: e.target._value })"
            ></v-textarea>
          </v-col>
          <v-col cols="2" />
        </v-row>
      </v-container>
    </v-expansion-panel-text>
  </v-expansion-panel>

  <auto-operation-dialog
    :opened="dialogOpened"
    :auto-operations="conditionGroup.autoOperations"
    :items-per-page="10"
    @close="dialogOpened = false"
  />
</template>

<script lang="ts">
import type { AutoOperationConditionGroup } from "@/lib/common/settings/Settings";
import AutoOperationDialog from "../dialog/AutoOperationDialog.vue";
import { defineComponent, ref, type PropType } from "vue";

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
      dialogOpened,
      updateConditionGroup,
      deleteConditionGroup
    };
  }
});
</script>
