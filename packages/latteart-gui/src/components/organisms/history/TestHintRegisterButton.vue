<!--
 Copyright 2024 NTT Corporation.

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
      size="small"
      :title="
        $t('test-hint-register-button.title') + ': ' + $t('test-hint-register-button.details')
      "
      class="mx-1"
      style="pointer-events: auto"
      @click="registerDialogOpened = true"
      >{{ $t("test-hint-register-button.title") }}
    </v-btn>

    <test-hint-register-dialog
      :opened="registerDialogOpened"
      :related-test-steps="checkedTestSteps"
      @accept="clearCheckedOperations"
      @close="registerDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { computed, defineComponent, ref } from "vue";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useCaptureControlStore } from "@/stores/captureControl";
import TestHintRegisterDialog from "../dialog/TestHintRegisterDialog.vue";

export default defineComponent({
  components: {
    "test-hint-register-dialog": TestHintRegisterDialog
  },
  setup() {
    const operationHistoryStore = useOperationHistoryStore();
    const captureControlStore = useCaptureControlStore();

    const registerDialogOpened = ref(false);

    const checkedTestSteps = computed(
      (): {
        operation: OperationForGUI;
        comments: { value: string; timestamp: string }[];
        issues: string[];
      }[] => {
        return operationHistoryStore.checkedTestSteps.map((item) => {
          return { operation: item.operation, comments: item.comments, issues: item.issues };
        });
      }
    );

    const isReplaying = computed((): boolean => {
      return captureControlStore.isReplaying;
    });

    const isDisabled = computed((): boolean => {
      return checkedTestSteps.value.length < 1 || isReplaying.value;
    });

    const clearCheckedOperations = () => {
      operationHistoryStore.checkedTestSteps = [];
    };

    return {
      registerDialogOpened,
      checkedTestSteps,
      isDisabled,
      clearCheckedOperations
    };
  }
});
</script>
