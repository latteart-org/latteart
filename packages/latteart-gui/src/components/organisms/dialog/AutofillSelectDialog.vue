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
  <execute-dialog
    :opened="opened"
    :title="$t('autofill-select-dialog.title')"
    @accept="
      accept();
      close();
    "
    @cancel="close()"
  >
    <template>
      <div class="pre-wrap break-word">
        {{ message }}
      </div>
      <v-select
        :label="$t('autofill-select-dialog.form-label')"
        :items="selectList"
        item-title="settingName"
        item-value="index"
        @update:model-value="selectGroup"
      ></v-select>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { type AutofillConditionGroup } from "@/lib/operationHistory/types";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { computed, defineComponent, ref } from "vue";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";
import { watch } from "vue";

export default defineComponent({
  components: {
    "execute-dialog": ExecuteDialog
  },
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();

    const selectedIndex = ref(-1);
    const opened = ref(false);

    const dialogData = computed(() => {
      return captureControlStore.autofillSelectDialogData ?? null;
    });

    watch(dialogData, () => {
      const data = captureControlStore.autofillSelectDialogData;
      opened.value = !!data?.autofillConditionGroups;
    });

    const autofillConditionGroups = computed((): AutofillConditionGroup[] => {
      return dialogData.value?.autofillConditionGroups ?? [];
    });

    const message = computed((): string => {
      return dialogData.value?.message ?? "";
    });

    const selectList = computed((): { settingName: string; index: number }[] => {
      return (autofillConditionGroups.value ?? []).map((group, index) => {
        return {
          settingName: group.settingName,
          index
        };
      });
    });

    const selectGroup = (index: number) => {
      selectedIndex.value = index;
    };

    const accept = async (): Promise<void> => {
      if (autofillConditionGroups.value === null || selectedIndex.value < 0) {
        return;
      }
      await captureControlStore.autofill({
        autofillConditionGroup: autofillConditionGroups.value[selectedIndex.value]
      });
      await close();
    };

    const close = async (): Promise<void> => {
      opened.value = false;
      await new Promise((s) => setTimeout(s, 300));
      captureControlStore.autofillSelectDialogData = {
        autofillConditionGroups: null
      };
    };

    return {
      t: rootStore.message,
      opened,
      message,
      selectList,
      selectGroup,
      accept,
      close
    };
  }
});
</script>
