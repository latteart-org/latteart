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
          {{
            $store.getters.message(
              "config-page.screen-def.default-screen-definition"
            )
          }}
        </h4>
        <v-radio-group
          :value="tempConfig.screenDefType"
          class="py-0 my-0"
          row
          @change="changeScreenDefType"
        >
          <v-radio
            :label="
              $store.getters.message('config-page.screen-def.judgement-title')
            "
            value="title"
          ></v-radio>
          <v-radio
            :label="
              $store.getters.message('config-page.screen-def.judgement-url')
            "
            value="url"
          ></v-radio>
        </v-radio-group>
      </v-col>
      <v-col cols="12">
        <h4>
          {{
            $store.getters.message("config-page.screen-def.priority-condition")
          }}
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
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ScreenDefUnitContainer from "./ScreenDefUnitContainer.vue";

@Component({
  components: {
    "screen-def-unit-container": ScreenDefUnitContainer,
  },
})
export default class ScreenDefinitionConfig extends Vue {
  @Prop({ type: Boolean, required: true })
  public readonly opened!: boolean;
  @Prop({ type: Object, default: null })
  public readonly screenDefinition!: ScreenDefinitionSetting;

  private tempConfig: ScreenDefinitionSetting = { ...this.screenDefinition };

  @Watch("screenDefinition")
  private updateTempConfig() {
    if (!this.opened) {
      this.tempConfig = { ...this.screenDefinition };
    }
  }

  @Watch("tempConfig")
  saveConfig(): void {
    if (this.opened) {
      this.$emit("save-config", { screenDefinition: this.tempConfig });
    }
  }

  private updateConditionGroups(
    conditionGroups: ScreenDefinitionConditionGroup[]
  ) {
    this.tempConfig = {
      ...this.tempConfig,
      conditionGroups,
    };
  }

  private changeScreenDefType(screenDefType: "title" | "url"): void {
    this.tempConfig = {
      ...this.tempConfig,
      screenDefType,
    };
  }
}
</script>
