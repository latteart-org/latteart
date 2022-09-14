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
  AutofillSetting as AutofillSettingConfig,
  AutofillCondition,
  AutofillConditionGroup,
} from "@/lib/operationHistory/types";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import AutoFillInputValueContainer from "./AutoFillInputValueContainer.vue";

@Component({
  components: {
    "autofill-input-value-container": AutoFillInputValueContainer,
  },
})
export default class AutofillSetting extends Vue {
  @Prop({
    type: Object,
    default: null,
  })
  public readonly autofillSetting!: AutofillSettingConfig;

  private config: AutofillSettingConfig = this.autofillSetting;

  @Watch("autofillSetting")
  propAutofillSetting(): void {
    this.config = this.autofillSetting;
  }

  @Watch("config")
  saveAutofillSetting(): void {
    this.$store.dispatch("operationHistory/updateAutofillSetting", this.config);
  }

  private get conditionGroups(): AutofillConditionGroup[] {
    return this.config.conditionGroups;
  }

  private get autoPopupRegistrationDialog(): boolean {
    return this.config.autoPopupRegistrationDialog;
  }

  private set autoPopupRegistrationDialog(
    autoPopupRegistrationDialog: boolean
  ) {
    this.config = {
      ...this.config,
      autoPopupRegistrationDialog,
    };
  }

  private get autoPopupSelectionDialog(): boolean {
    return this.config.autoPopupSelectionDialog;
  }

  private set autoPopupSelectionDialog(autoPopupSelectionDialog: boolean) {
    this.config = {
      ...this.config,
      autoPopupSelectionDialog,
    };
  }

  private addConditionGroup() {
    const config = { ...this.config };
    config.conditionGroups.push({
      isEnabled: true,
      settingName: "",
      url: "",
      title: "",
      inputValueConditions: [],
    });
    this.config = config;
  }

  private updateConditionGroup(
    conditionGroup: Partial<AutofillConditionGroup>,
    index: number
  ) {
    const config = { ...this.config };
    config.conditionGroups = config.conditionGroups.map((group, i) => {
      if (index === i) {
        return {
          ...group,
          ...conditionGroup,
        };
      }
      return group;
    });
    this.config = config;
  }

  private addCondition(index: number) {
    const config = { ...this.config };
    config.conditionGroups = config.conditionGroups.map((g, i) => {
      if (index === i) {
        g.inputValueConditions.push({
          isEnabled: true,
          locatorType: "id",
          locator: "",
          locatorMatchType: "equals",
          inputValue: "",
        });
      }
      return g;
    });
    this.config = config;
  }

  private updateCondition(
    condition: Partial<AutofillCondition>,
    conditionIndex: number,
    conditionGroupIndex: number
  ) {
    const config = { ...this.config };
    config.conditionGroups = config.conditionGroups.map((g, i) => {
      if (conditionGroupIndex === i) {
        g.inputValueConditions = g.inputValueConditions.map((c, j) => {
          return conditionIndex === j ? { ...c, ...condition } : c;
        });
      }
      return g;
    });
    this.config = config;
  }

  private deleteConditionGroup(index: number) {
    const config = { ...this.config };
    config.conditionGroups = config.conditionGroups.filter(
      (c, i) => index !== i
    );
    this.config = config;
  }

  private deleteCondition(conditionIndex: number, conditionGroupIndex: number) {
    const config = { ...this.config };
    config.conditionGroups = config.conditionGroups.map((g, i) => {
      if (conditionGroupIndex === i) {
        g.inputValueConditions = g.inputValueConditions.filter(
          (c, j) => conditionIndex !== j
        );
      }
      return g;
    });
    this.config = config;
  }
}
</script>
