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
  <v-card flat class="pa-2">
    <v-card-title>{{ $t("common.import-project") }}</v-card-title>

    <v-card-text>
      <import-option @update="updateOption" />
    </v-card-text>

    <v-card-actions>
      <v-btn variant="elevated" :disabled="disabled" color="primary" @click="importData">{{
        $t("common.import-button")
      }}</v-btn>
    </v-card-actions>

    <information-message-dialog
      :opened="informationMessageDialogOpened"
      :title="informationTitle"
      :message="informationMessage"
      @close="informationMessageDialogOpened = false"
    />

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </v-card>
</template>

<script lang="ts">
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import ImportOption from "@/components/organisms/common/ImportOption.vue";
import InformationMessageDialog from "@/components/molecules/InformationMessageDialog.vue";
import { loadFileAsBase64 } from "@/lib/common/util";
import { computed, defineComponent, ref } from "vue";
import { useRootStore } from "@/stores/root";
import { useTestManagementStore } from "@/stores/testManagement";

export default defineComponent({
  components: {
    "information-message-dialog": InformationMessageDialog,
    "error-message-dialog": ErrorMessageDialog,
    "import-option": ImportOption
  },
  setup() {
    const rootStore = useRootStore();
    const testManagementStore = useTestManagementStore();

    const informationMessageDialogOpened = ref(false);
    const informationTitle = ref("");
    const informationMessage = ref("");
    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const option = ref<{
      selectedOptionProject: boolean;
      selectedOptionTestresult: boolean;
      selectedOptionTestHint: boolean;
      selectedOptionConfig: boolean;
      targetFile: File | null;
    }>({
      selectedOptionProject: true,
      selectedOptionTestresult: true,
      selectedOptionTestHint: true,
      selectedOptionConfig: true,
      targetFile: null
    });

    const disabled = computed(() => {
      if (!option.value.targetFile) {
        return true;
      }

      if (
        !option.value.selectedOptionProject &&
        !option.value.selectedOptionTestresult &&
        !option.value.selectedOptionTestHint &&
        !option.value.selectedOptionConfig
      ) {
        return true;
      }

      return false;
    });

    const updateOption = (updateOption: {
      selectedOptionProject: boolean;
      selectedOptionTestresult: boolean;
      selectedOptionTestHint: boolean;
      selectedOptionConfig: boolean;
      targetFile: File | null;
    }) => {
      option.value = updateOption;
    };

    const importData = (): void => {
      if (!option.value.targetFile) {
        return;
      }

      rootStore.openProgressDialog({
        message: rootStore.message("common.importing-data")
      });

      const targetFile = option.value.targetFile;
      const importOption = {
        selectedOptionProject: option.value.selectedOptionProject,
        selectedOptionTestresult: option.value.selectedOptionTestresult,
        selectedOptionTestHint: option.value.selectedOptionTestHint,
        selectedOptionConfig: option.value.selectedOptionConfig
      };

      setTimeout(async () => {
        try {
          const projectFile = await loadFileAsBase64(targetFile);

          const source = { projectFile };
          const { projectId, config } = await testManagementStore.importData({
            source,
            option: importOption
          });

          if (projectId) {
            await testManagementStore.readProject();
          }
          if (config) {
            rootStore.setProjectSettings({ settings: config });
          }

          informationMessageDialogOpened.value = true;
          informationTitle.value = rootStore.message("common.import-project");
          informationMessage.value = rootStore.message("common.import-data-succeeded", {
            returnName: projectFile.name
          });
        } catch (error) {
          if (error instanceof Error) {
            errorMessage.value = error.message;
            errorMessageDialogOpened.value = true;
          } else {
            throw error;
          }
        } finally {
          rootStore.closeProgressDialog();
        }
      }, 300);
    };

    return {
      informationMessageDialogOpened,
      informationTitle,
      informationMessage,
      errorMessageDialogOpened,
      errorMessage,
      disabled,
      updateOption,
      importData
    };
  }
});
</script>
