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
      store.getters.message("optional-features.test-script-generation.title")
    }}</v-card-title>

    <v-card-text>
      <script-generation-option @update="updateOption" />
    </v-card-text>
    <v-card-actions>
      <v-btn :disabled="disabled" :dark="!disabled" color="primary" @click="generateTestScript">{{
        store.getters.message("optional-features.test-script-generation.execute-button")
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
import ScriptGenerationOption from "@/components/organisms/common/ScriptGenerationOption.vue";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  components: {
    "download-link-dialog": DownloadLinkDialog,
    "error-message-dialog": ErrorMessageDialog,
    "script-generation-option": ScriptGenerationOption
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

    const option = ref<{
      testScript: { isSimple: boolean; useMultiLocator: boolean };
      testData: { useDataDriven: boolean; maxGeneration: number };
      buttonDefinitions: {
        tagname: string;
        attribute?: { name: string; value: string };
      }[];
    }>({
      testScript: { isSimple: false, useMultiLocator: false },
      testData: { useDataDriven: false, maxGeneration: 0 },
      buttonDefinitions: []
    });

    const currentRepositoryUrl = computed(() => {
      return store.state.repositoryService.serviceUrl;
    });

    const disabled = computed(() => {
      return !hasAnySessionHistory.value;
    });

    const hasAnySessionHistory = computed((): boolean => {
      return store.getters["testManagement/anySessionHasHistory"]();
    });

    const updateOption = (updateOption: {
      testScript: { isSimple: boolean; useMultiLocator: boolean };
      testData: { useDataDriven: boolean; maxGeneration: number };
      buttonDefinitions: {
        tagname: string;
        attribute?: { name: string; value: string };
      }[];
    }) => {
      option.value = updateOption;
    };

    const generateTestScript = () => {
      (async () => {
        try {
          store.dispatch("openProgressDialog", {
            message: store.getters.message("manage-header.generating-test-script")
          });
          const testScriptInfo = await store.dispatch(
            "testManagement/generateAllSessionTestScripts",
            { option: option.value }
          );
          store.dispatch("closeProgressDialog");
          downloadLinkDialogTitle.value = store.getters.message("common.confirm");
          downloadLinkDialogMessage.value = store.getters.message(
            "test-result-page.generate-testscript-succeeded"
          );
          if (testScriptInfo.invalidOperationTypeExists) {
            downloadLinkDialogAlertMessage.value = store.getters.message(
              "test-result-page.generate-alert-info"
            );
          } else {
            downloadLinkDialogAlertMessage.value = "";
          }
          downloadLinkDialogLinkUrl.value = `${currentRepositoryUrl.value}/${testScriptInfo.outputUrl}`;
          downloadLinkDialogOpened.value = true;
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
      generateTestScript
    };
  }
});
</script>

<style lang="sass">
#max-test-data-generation
  .v-text-field__details
    display: none

  .v-input--selection-controls
    margin-top: 0px

  .v-messages
    display: none
</style>
