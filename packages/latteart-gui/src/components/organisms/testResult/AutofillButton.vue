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
  <div :title="$t('autofill-button.details')">
    <v-list-item :disabled="isDisabled" @click="openDialog">
      <v-list-item-title>{{ $t("autofill-button.title") }}</v-list-item-title>
    </v-list-item>
  </div>
</template>

<script lang="ts">
import type { AutofillConditionGroup } from "@/lib/common/settings/Settings";
import { AutofillTestAction } from "@/lib/operationHistory/actions/AutofillTestAction";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useRootStore } from "@/stores/root";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();

    const autofillConditionGroup = ref<AutofillConditionGroup[] | null>(null);

    const isDisabled = computed((): boolean => {
      if (captureControlStore.isRunning) {
        return true;
      }
      if (!captureControlStore.isCapturing) {
        setMatchedAutofillConditionGroup(null);
        return true;
      }
      const history = operationHistoryStore.history;

      if (!history || history.length === 0) {
        setMatchedAutofillConditionGroup(null);
        return true;
      }
      const lastOperation = history[history.length - 1].operation;
      const matchGroup = new AutofillTestAction().extractMatchingAutofillConditionGroup(
        rootStore.userSettings.autofillSetting.conditionGroups,
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
      captureControlStore.autofillSelectDialogData = {
        autofillConditionGroups: autofillConditionGroup.value,
        message: rootStore.message("autofill-button.message")
      };
    };

    const setMatchedAutofillConditionGroup = (group: AutofillConditionGroup[] | null) => {
      autofillConditionGroup.value = group;
    };

    return {
      isDisabled,
      openDialog
    };
  }
});
</script>
