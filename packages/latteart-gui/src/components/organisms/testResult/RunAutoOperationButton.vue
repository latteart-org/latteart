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
  <div :title="$t('run-auto-operation-button.details')">
    <v-list-item :disabled="isDisabled" @click="autoOperationSelectDialogOpened = true">
      <v-list-item-title>{{ $t("run-auto-operation-button.title") }}</v-list-item-title>
    </v-list-item>
  </div>

  <auto-operation-select-dialog
    :opened="autoOperationSelectDialogOpened"
    :auto-operation-condition-groups="autoOperationConditionGroups"
    @ok="runAutoOperations"
    @close="autoOperationSelectDialogOpened = false"
  />

  <error-message-dialog
    :opened="errorDialogOpened"
    :message="errorDialogMessage"
    @close="errorDialogOpened = false"
  />
</template>

<script lang="ts">
import AutoOperationSelectDialog from "@/components/organisms/dialog/AutoOperationSelectDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { computed, defineComponent, ref } from "vue";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";
import type { AutoOperationConditionGroup } from "@/lib/common/settings/Settings";

export default defineComponent({
  components: {
    "auto-operation-select-dialog": AutoOperationSelectDialog,
    "error-message-dialog": ErrorMessageDialog
  },
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();

    const autoOperationSelectDialogOpened = ref(false);
    const errorDialogOpened = ref(false);
    const errorDialogMessage = ref("");

    const autoOperationConditionGroups = computed(() => {
      const conditionGroups: AutoOperationConditionGroup[] =
        rootStore.userSettings.autoOperationSetting.conditionGroups;
      return conditionGroups.filter((group) => {
        return group.isEnabled;
      });
    });

    const isDisabled = computed((): boolean => {
      return (
        !captureControlStore.isCapturing ||
        autoOperationConditionGroups.value.length < 1 ||
        captureControlStore.isRunning
      );
    });

    const runAutoOperations = async (index: number) => {
      try {
        captureControlStore.isRunning = true;
        let isPausing = false;
        const tempOperations = autoOperationConditionGroups.value[index].autoOperations
          .map((operation) => {
            return {
              input: operation.input,
              type: operation.type,
              elementInfo: operation.elementInfo,
              title: operation.title,
              url: operation.url,
              timestamp: operation.timestamp
            };
          })
          .filter((target) => {
            if (target.type === "pause_capturing") {
              isPausing = true;
              return false;
            }

            if (target.type === "resume_capturing") {
              isPausing = false;
              return false;
            }

            if (isPausing) {
              return false;
            }
            return true;
          });

        await captureControlStore.runAutoOperations({
          operations: tempOperations
        });
        captureControlStore.completionDialogData = {
          title: rootStore.message("run-auto-operation-button.done-title"),
          message: rootStore.message("run-auto-operation-button.done-auto-operations")
        };
      } catch (error) {
        if (error instanceof Error) {
          errorDialogOpened.value = true;
          errorDialogMessage.value = error.message;
        } else {
          throw error;
        }
      } finally {
        captureControlStore.isRunning = false;
        autoOperationSelectDialogOpened.value = false;
      }
    };

    return {
      autoOperationSelectDialogOpened,
      errorDialogOpened,
      errorDialogMessage,
      autoOperationConditionGroups,
      isDisabled,
      runAutoOperations
    };
  }
});
</script>
