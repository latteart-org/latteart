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
  <v-container class="mt-0 pt-0">
    <v-layout row wrap>
      <v-flex xs12 class="py-0 my-0">
        <p v-if="conditionGroups < 1">
          {{ $store.getters.message("config-view.no-data") }}
        </p>
        <auto-operation-container
          v-for="(group, index) in conditionGroups"
          :key="index"
          :conditionGroup="group"
          :index="index"
          @update-condition-group="updateConditionGroup"
          @delete-condition-group="deleteConditionGroup"
        ></auto-operation-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import {
  AutoOperationSetting as AutoOperationSettingConfig,
  AutoOperationConditionGroup,
} from "@/lib/operationHistory/types";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import AutoOperationContainer from "./AutoOperationContainer.vue";

@Component({
  components: {
    "auto-operation-container": AutoOperationContainer,
  },
})
export default class AutoOperationSetting extends Vue {
  @Prop({
    type: Object,
    default: null,
  })
  public readonly autoOperationSetting!: AutoOperationSettingConfig;

  private tempConfig: AutoOperationSettingConfig = {
    ...this.autoOperationSetting,
  };

  @Watch("autoOperationSetting")
  updateTempConfig(): void {
    this.tempConfig = { ...this.autoOperationSetting };
  }

  @Watch("tempConfig")
  saveConfig(): void {
    this.$emit("save-config", { autoOperationSetting: this.tempConfig });
  }

  private get conditionGroups(): AutoOperationConditionGroup[] {
    return this.tempConfig.conditionGroups;
  }

  private updateConditionGroup(
    conditionGroup: Partial<AutoOperationConditionGroup>,
    index: number
  ) {
    const config = { ...this.tempConfig };
    config.conditionGroups = config.conditionGroups.map((group, i) => {
      if (index === i) {
        return {
          ...group,
          ...conditionGroup,
        };
      }
      return group;
    });
    this.tempConfig = config;
  }

  private deleteConditionGroup(index: number) {
    const config = { ...this.tempConfig };
    config.conditionGroups = config.conditionGroups.filter(
      (c, i) => index !== i
    );
    this.tempConfig = config;
  }
}
</script>
