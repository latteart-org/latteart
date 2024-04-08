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
      icon="video_library"
      @click="autoOperationSelectDialogOpened = true"
      size="small"
      :title="$t('app.auto-operation')"
      class="mx-2"
    >
    </v-btn>

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
  </div>
</template>

<script lang="ts">
import { type AutoOperationConditionGroup } from "@/lib/operationHistory/types";
import AutoOperationSelectDialog from "@/components/organisms/dialog/AutoOperationSelectDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { computed, defineComponent, ref } from "vue";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";

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
        rootStore.projectSettings.config.autoOperationSetting.conditionGroups;
      return conditionGroups.filter((group) => {
        return group.isEnabled;
      });
    });

    const isDisabled = computed((): boolean => {
      return !captureControlStore.isCapturing || autoOperationConditionGroups.value.length < 1;
    });

    const runAutoOperations = async (index: number) => {
      try {
        const tempOperations = autoOperationConditionGroups.value[index].autoOperations.map(
          (operation) => {
            return {
              input: operation.input,
              type: operation.type,
              elementInfo: operation.elementInfo,
              title: operation.title,
              url: operation.url,
              timestamp: operation.timestamp
            };
          }
        );

        await captureControlStore.runAutoOperations({
          operations: tempOperations
        });
        captureControlStore.completionDialogData = {
          title: rootStore.message("auto-operation.done-title"),
          message: rootStore.message("auto-operation.done-auto-operations")
        };
      } catch (error) {
        if (error instanceof Error) {
          errorDialogOpened.value = true;
          errorDialogMessage.value = error.message;
        } else {
          throw error;
        }
      } finally {
        autoOperationSelectDialogOpened.value = false;
      }
    };

    return {
      t: rootStore.message,
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
