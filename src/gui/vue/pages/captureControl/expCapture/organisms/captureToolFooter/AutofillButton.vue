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
  <div>
    <v-btn
      :disabled="isDisabled"
      color="blue"
      :dark="!isDisabled"
      @click="openDialog"
      fab
      small
    >
      <v-icon>edit</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { AutofillTestAction } from "@/lib/operationHistory/actions/AutofillTestAction";
import {
  AutofillConditionGroup,
  OperationWithNotes,
} from "@/lib/operationHistory/types";
import { Component, Vue } from "vue-property-decorator";

@Component
export default class AutofillButton extends Vue {
  private autofillConditionGroup: AutofillConditionGroup[] | null = null;

  private get isDisabled(): boolean {
    if (!this.$store.state.captureControl.isCapturing) {
      this.setMatchedAutofillConditionGroup(null);
      return true;
    }
    const history = this.$store.state.operationHistory
      .history as OperationWithNotes[];

    if (!history || history.length === 0) {
      this.setMatchedAutofillConditionGroup(null);
      return true;
    }
    const lastOperation = history[history.length - 1].operation;
    const matchGroup =
      new AutofillTestAction().extractMatchingAutofillConditionGroup(
        this.$store.state.operationHistory.config.autofillSetting
          .conditionGroups,
        lastOperation.title,
        lastOperation.url
      );
    if (matchGroup.isFailure() || !matchGroup.data) {
      this.setMatchedAutofillConditionGroup(null);
      return true;
    }

    const isDisabled = matchGroup.data.length === 0;
    this.setMatchedAutofillConditionGroup(isDisabled ? null : matchGroup.data);

    return isDisabled;
  }

  private openDialog() {
    this.$store.commit("operationHistory/setAutofillSelectDialog", {
      dialogData: {
        autofillConditionGroups: this.autofillConditionGroup,
        message: this.$store.getters.message("autofill-button.message"),
      },
    });
  }

  private setMatchedAutofillConditionGroup(
    group: AutofillConditionGroup[] | null
  ) {
    this.autofillConditionGroup = group;
  }
}
</script>
