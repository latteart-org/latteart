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
      store.getters.message("optional-features.project-export.title")
    }}</v-card-title>

    <v-card-text>
      <export-option @update="updateOption" />
    </v-card-text>

    <v-card-actions>
      <v-btn :disabled="disabled" :dark="!disabled" color="primary" @click="exportData">{{
        store.getters.message("optional-features.project-export.execute-button")
      }}</v-btn>
    </v-card-actions>

    <download-link-dialog
      :opened="downloadLinkDialogOpened"
      :title="downloadLinkDialogTitle"
      :message="downloadLinkDialogMessage"
      :alertMessage="downloadLinkDialogAlertMessage"
      :linkUrl="downloadLinkDialogLinkUrl"
      @close="downloadLinkDialogOpened = false"
    />

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </v-card>
</template>

<script lang="ts">
import DownloadLinkDialog from "@/components/molecules/DownloadLinkDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import ExportOption from "@/components/organisms/common/ExportOption.vue";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  components: {
    "download-link-dialog": DownloadLinkDialog,
    "error-message-dialog": ErrorMessageDialog,
    "export-option": ExportOption
  },
  setup() {
    const store = useStore();

    const downloadLinkDialogOpened = ref(false);
    const downloadLinkDialogTitle = ref("");
    const downloadLinkDialogMessage = ref("");
    const downloadLinkDialogAlertMessage = ref("");
    const downloadLinkDialogLinkUrl = ref("");
    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const option = ref({
      selectedOptionProject: true,
      selectedOptionTestresult: true,
      selectedOptionConfig: true
    });

    const disabled = computed(() => {
      return (
        !option.value.selectedOptionProject &&
        !option.value.selectedOptionTestresult &&
        !option.value.selectedOptionConfig
      );
    });

    const currentRepositoryUrl = computed(() => {
      return store.state.repositoryService.serviceUrl;
    });

    const updateOption = (updateOption: {
      selectedOptionProject: boolean;
      selectedOptionTestresult: boolean;
      selectedOptionConfig: boolean;
    }) => {
      option.value = updateOption;
    };

    const exportData = () => {
      (async () => {
        store.dispatch("openProgressDialog", {
          message: store.getters.message("import-export-dialog.creating-export-data")
        });

        try {
          const exportDataUrl = await store.dispatch("testManagement/exportData", {
            option: option.value
          });

          downloadLinkDialogOpened.value = true;
          downloadLinkDialogTitle.value = store.getters.message(
            "import-export-dialog.project-export-title"
          );
          downloadLinkDialogMessage.value = store.getters.message(
            "import-export-dialog.create-export-data-succeeded"
          );
          downloadLinkDialogAlertMessage.value = "";
          downloadLinkDialogLinkUrl.value = `${currentRepositoryUrl.value}/${exportDataUrl}`;
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
      })();
    };

    return {
      store,
      downloadLinkDialogOpened,
      downloadLinkDialogTitle,
      downloadLinkDialogMessage,
      downloadLinkDialogAlertMessage,
      downloadLinkDialogLinkUrl,
      errorMessageDialogOpened,
      errorMessage,
      disabled,
      updateOption,
      exportData
    };
  }
});
</script>
