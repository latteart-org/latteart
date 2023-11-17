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
  <div>
    <v-btn
      :disabled="isDisabled"
      color="blue"
      :dark="!isDisabled"
      @click="openDialog"
      fab
      small
      :title="store.getters.message('app.autofill')"
      class="mx-2"
    >
      <v-icon>edit</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { AutofillTestAction } from "@/lib/operationHistory/actions/AutofillTestAction";
import { AutofillConditionGroup } from "@/lib/operationHistory/types";
import { CaptureControlState } from "@/store/captureControl";
import { OperationHistoryState } from "@/store/operationHistory";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  setup() {
    const store = useStore();

    const autofillConditionGroup = ref<AutofillConditionGroup[] | null>(null);

    const isDisabled = computed((): boolean => {
      if (
        !((store.state as any).captureControl as CaptureControlState)
          .isCapturing
      ) {
        setMatchedAutofillConditionGroup(null);
        return true;
      }
      const history = (
        (store.state as any).operationHistory as OperationHistoryState
      ).history;

      if (!history || history.length === 0) {
        setMatchedAutofillConditionGroup(null);
        return true;
      }
      const lastOperation = history[history.length - 1].operation;
      const matchGroup =
        new AutofillTestAction().extractMatchingAutofillConditionGroup(
          store.state.projectSettings.config.autofillSetting.conditionGroups,
          lastOperation.title,
          lastOperation.url
        );
      if (matchGroup.isFailure() || !matchGroup.data) {
        setMatchedAutofillConditionGroup(null);
        return true;
      }

      const isDisabled = matchGroup.data.length === 0;
      setMatchedAutofillConditionGroup(isDisabled ? null : matchGroup.data);

      return isDisabled;
    });

    const openDialog = () => {
      store.commit("captureControl/setAutofillSelectDialog", {
        dialogData: {
          autofillConditionGroups: autofillConditionGroup.value,
          message: store.getters.message("autofill-button.message"),
        },
      });
    };

    const setMatchedAutofillConditionGroup = (
      group: AutofillConditionGroup[] | null
    ) => {
      autofillConditionGroup.value = group;
    };

    return {
      store,
      isDisabled,
      openDialog,
    };
  },
});
</script>
