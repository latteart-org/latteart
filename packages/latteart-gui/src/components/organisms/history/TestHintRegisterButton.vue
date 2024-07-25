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
      class="mx-1"
      @click="registerDialogOpened = true"
      >{{ $t("app.register-test-hint") }}
    </v-btn>

    <test-hint-register-dialog
      :opened="registerDialogOpened"
      :target-test-steps="targetTestSteps"
      @ok="clearCheckedOperations"
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

    const targetTestSteps = computed(
      (): { operation: OperationForGUI; comments: { value: string; timestamp: string }[] }[] => {
        return operationHistoryStore.checkedTestSteps.map((item) => {
          return { operation: item.operation, comments: item.comments };
        });
      }
    );

    const isReplaying = computed((): boolean => {
      return captureControlStore.isReplaying;
    });

    const isDisabled = computed((): boolean => {
      return targetTestSteps.value.length < 1 || isReplaying.value;
    });

    const clearCheckedOperations = () => {
      operationHistoryStore.checkedTestSteps = [];
      registerDialogOpened.value = false;
    };

    return {
      registerDialogOpened,
      targetTestSteps,
      isDisabled,
      clearCheckedOperations
    };
  }
});
</script>
