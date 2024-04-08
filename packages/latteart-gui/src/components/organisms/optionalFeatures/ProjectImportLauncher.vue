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
  <v-card flat class="pa-2">
    <v-card-title>{{
      store.getters.message("optional-features.project-import.title")
    }}</v-card-title>

    <v-card-text>
      <import-option @update="updateOption" />
    </v-card-text>

    <v-card-actions>
      <v-btn :disabled="disabled" :dark="!disabled" color="primary" @click="importData">{{
        store.getters.message("optional-features.project-import.execute-button")
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
import { useStore } from "@/store";

export default defineComponent({
  components: {
    "information-message-dialog": InformationMessageDialog,
    "error-message-dialog": ErrorMessageDialog,
    "import-option": ImportOption
  },
  setup() {
    const store = useStore();

    const informationMessageDialogOpened = ref(false);
    const informationTitle = ref("");
    const informationMessage = ref("");
    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const option = ref<{
      selectedOptionProject: boolean;
      selectedOptionTestresult: boolean;
      selectedOptionConfig: boolean;
      targetFile: File | null;
    }>({
      selectedOptionProject: true,
      selectedOptionTestresult: true,
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
        !option.value.selectedOptionConfig
      ) {
        return true;
      }

      return false;
    });

    const updateOption = (updateOption: {
      selectedOptionProject: boolean;
      selectedOptionTestresult: boolean;
      selectedOptionConfig: boolean;
      targetFile: File | null;
    }) => {
      option.value = updateOption;
    };

    const importData = (): void => {
      if (!option.value.targetFile) {
        return;
      }

      store.dispatch("openProgressDialog", {
        message: store.getters.message("import-export-dialog.importing-data")
      });

      const targetFile = option.value.targetFile;
      const importOption = {
        selectedOptionProject: option.value.selectedOptionProject,
        selectedOptionTestresult: option.value.selectedOptionTestresult,
        selectedOptionConfig: option.value.selectedOptionConfig
      };

      setTimeout(async () => {
        try {
          const projectFile = await loadFileAsBase64(targetFile);

          const source = { projectFile };
          const { projectId, config } = await store.dispatch("testManagement/importData", {
            source,
            option: importOption
          });

          if (projectId) {
            await store.dispatch("testManagement/readProject");
          }
          if (config) {
            store.commit("setProjectSettings", { settings: config }, { root: true });
          }

          informationMessageDialogOpened.value = true;
          informationTitle.value = store.getters.message(
            "import-export-dialog.project-import-title"
          );
          informationMessage.value = store.getters.message(
            "import-export-dialog.import-data-succeeded",
            {
              returnName: projectFile.name
            }
          );
        } catch (error) {
          if (error instanceof Error) {
            errorMessage.value = error.message;
            errorMessageDialogOpened.value = true;
          } else {
            throw error;
          }
        } finally {
          store.dispatch("closeProgressDialog");
        }
      }, 300);
    };

    return {
      store,
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
