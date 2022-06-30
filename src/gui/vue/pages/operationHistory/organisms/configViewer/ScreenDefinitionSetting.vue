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
        <h4>
          {{
            $store.getters.message(
              "config-view.screen-def.default-screen-definition"
            )
          }}
        </h4>
        <v-radio-group
          :value="screenDefType"
          class="py-0 my-0"
          row
          @change="changeScreenDefType"
        >
          <v-radio
            :label="
              $store.getters.message('config-view.screen-def.judgement-title')
            "
            value="title"
          ></v-radio>
          <v-radio
            :label="
              $store.getters.message('config-view.screen-def.judgement-url')
            "
            value="url"
          ></v-radio>
        </v-radio-group>
      </v-flex>
      <v-flex xs12 style="margin-top: 10px">
        <h4>
          {{
            $store.getters.message("config-view.screen-def.priority-condition")
          }}
        </h4>
        <screen-def-unit-container></screen-def-unit-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ScreenDefUnitContainer from "./ScreenDefUnitContainer.vue";

@Component({
  components: {
    "screen-def-unit-container": ScreenDefUnitContainer,
  },
})
export default class ScreenDefinitionSetting extends Vue {
  private changeScreenDefType(screenDefType: string): void {
    (async () => {
      await this.$store.dispatch("operationHistory/writeSettings", {
        config: {
          screenDefinition: {
            screenDefType,
            conditionGroups: this.$store.state.operationHistory.config
              .screenDefinition.conditionGroups,
          },
        },
      });
      this.$store.commit("operationHistory/setCanUpdateModels", {
        canUpdateModels: true,
      });
    })();
  }

  private get screenDefType() {
    return this.$store.state.operationHistory.config.screenDefinition
      .screenDefType;
  }
}
</script>
