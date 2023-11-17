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
      @click="autoOperationSelectDialogOpened = true"
      fab
      small
      :title="store.getters.message('app.auto-operation')"
      class="mx-2"
    >
      <v-icon>video_library</v-icon>
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
import { AutoOperationConditionGroup } from "@/lib/operationHistory/types";
import AutoOperationSelectDialog from "@/components/organisms/dialog/AutoOperationSelectDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { CaptureControlState } from "@/store/captureControl";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  components: {
    "auto-operation-select-dialog": AutoOperationSelectDialog,
    "error-message-dialog": ErrorMessageDialog,
  },
  setup() {
    const store = useStore();

    const autoOperationSelectDialogOpened = ref(false);
    const errorDialogOpened = ref(false);
    const errorDialogMessage = ref("");

    const autoOperationConditionGroups = computed(() => {
      const conditionGroups: AutoOperationConditionGroup[] =
        store.state.projectSettings.config.autoOperationSetting.conditionGroups;
      return conditionGroups.filter((group) => {
        return group.isEnabled;
      });
    });

    const isDisabled = computed((): boolean => {
      return (
        !((store.state as any).captureControl as CaptureControlState)
          .isCapturing || autoOperationConditionGroups.value.length < 1
      );
    });

    const runAutoOperations = async (index: number) => {
      try {
        const tempOperations = autoOperationConditionGroups.value[
          index
        ].autoOperations.map((operation) => {
          return {
            input: operation.input,
            type: operation.type,
            elementInfo: operation.elementInfo,
            title: operation.title,
            url: operation.url,
            timestamp: operation.timestamp,
          };
        });

        await store.dispatch("captureControl/runAutoOperations", {
          operations: tempOperations,
        });
        store.commit("captureControl/setCompletionDialog", {
          title: store.getters.message("auto-operation.done-title"),
          message: store.getters.message("auto-operation.done-auto-operations"),
        });
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
      store,
      autoOperationSelectDialogOpened,
      errorDialogOpened,
      errorDialogMessage,
      autoOperationConditionGroups,
      isDisabled,
      runAutoOperations,
    };
  },
});
</script>
