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
        <v-checkbox
          v-model="autoPopupRegistrationDialog"
          :label="
            $store.getters.message(
              'config-view.autofill.auto-popup-registration'
            )
          "
        >
        </v-checkbox>
      </v-flex>
      <v-flex xs12 class="py-0 my-0">
        <v-checkbox
          v-model="autoPopupSelectionDialog"
          :label="
            $store.getters.message('config-view.autofill.auto-popup-selection')
          "
        >
        </v-checkbox>
      </v-flex>
      <v-flex xs12 class="py-0 my-0">
        <v-btn @click="addConditionGroup">{{
          $store.getters.message("config-view.autofill.add-setting")
        }}</v-btn>
      </v-flex>
      <v-flex xs12 class="py-0 my-0">
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
        ></autofill-input-value-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import {
  AutofillCondition,
  AutofillConditionGroup,
} from "@/lib/operationHistory/types";
import { Component, Vue } from "vue-property-decorator";
import AutoFillInputValueContainer from "./AutoFillInputValueContainer.vue";

@Component({
  components: {
    "autofill-input-value-container": AutoFillInputValueContainer,
  },
})
export default class AutofillSetting extends Vue {
  private get conditionGroups(): AutofillConditionGroup[] {
    console.log("get");
    console.log(this.$store.state.operationHistory.config.autofillSetting);
    return this.$store.state.operationHistory.config.autofillSetting
      .conditionGroups;
  }

  private get autoPopupRegistrationDialog(): boolean {
    return this.$store.state.operationHistory.config.autofillSetting
      .autoPopupRegistrationDialog;
  }

  private set autoPopupRegistrationDialog(
    autoPopupRegistrationDialog: boolean
  ) {
    this.$store.dispatch("operationHistory/updateAutofillSetting", {
      autoPopupRegistrationDialog,
    });
  }

  private get autoPopupSelectionDialog(): boolean {
    return this.$store.state.operationHistory.config.autofillSetting
      .autoPopupSelectionDialog;
  }

  private set autoPopupSelectionDialog(autoPopupSelectionDialog: boolean) {
    this.$store.dispatch("operationHistory/updateAutofillSetting", {
      autoPopupSelectionDialog,
    });
  }

  private addConditionGroup() {
    this.$store.dispatch("operationHistory/updateAutofillConditionGroup", {
      conditionGroup: {},
      index: -1,
    });
  }

  private addCondition(index: number) {
    this.$store.dispatch("operationHistory/updateAutofillCondition", {
      condition: {},
      conditionIndex: -1,
      conditionGroupIndex: index,
    });
  }

  private updateConditionGroup(
    conditionGroup: Partial<AutofillConditionGroup>,
    index: number
  ) {
    this.$store.dispatch("operationHistory/updateAutofillConditionGroup", {
      conditionGroup,
      index,
    });
  }

  private updateCondition(
    condition: Partial<AutofillCondition>,
    conditionIndex: number,
    conditionGroupIndex: number
  ) {
    this.$store.dispatch("operationHistory/updateAutofillCondition", {
      condition,
      conditionIndex,
      conditionGroupIndex,
    });
  }

  private deleteConditionGroup(index: number) {
    this.$store.dispatch("operationHistory/deleteAutofillConditionGroup", {
      index,
    });
  }

  private deleteCondition(conditionIndex: number, conditionGroupIndex: number) {
    this.$store.dispatch("operationHistory/deleteAutofillCondition", {
      conditionIndex,
      conditionGroupIndex,
    });
  }
}
</script>
