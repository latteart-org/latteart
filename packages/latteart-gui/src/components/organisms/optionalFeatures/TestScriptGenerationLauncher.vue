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
    <v-card-title>{{ $t("common.generate-test-script") }}</v-card-title>

    <v-card-text>
      <script-generation-option @update="updateOption" />
    </v-card-text>
    <v-card-actions>
      <v-btn variant="elevated" :disabled="disabled" color="primary" @click="generateTestScript">{{
        $t("test-script-generation-launcher.execute-button")
      }}</v-btn>
    </v-card-actions>

    <download-link-dialog
      :opened="downloadLinkDialogOpened"
      :title="downloadLinkDialogTitle"
      :message="downloadLinkDialogMessage"
      :alert-message="downloadLinkDialogAlertMessage"
      :link-url="downloadLinkDialogLinkUrl"
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
import { useRootStore } from "@/stores/root";
import { useTestManagementStore } from "@/stores/testManagement";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  components: {
    "download-link-dialog": DownloadLinkDialog,
    "error-message-dialog": ErrorMessageDialog,
    "script-generation-option": ScriptGenerationOption
  },
  setup() {
    const rootStore = useRootStore();
    const testManagementStore = useTestManagementStore();

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
      return rootStore.repositoryService?.serviceUrl ?? "";
    });

    const disabled = computed(() => {
      return !hasAnySessionHistory.value;
    });

    const hasAnySessionHistory = computed((): boolean => {
      return testManagementStore.anySessionHasHistory();
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
          rootStore.openProgressDialog({
            message: rootStore.message("common.generating-test-script")
          });
          const testScriptInfo = await testManagementStore.generateAllSessionTestScripts({
            option: option.value
          });
          rootStore.closeProgressDialog();
          downloadLinkDialogTitle.value = rootStore.message("common.confirm");
          downloadLinkDialogMessage.value = rootStore.message(
            "common.generate-test-script-succeeded"
          );
          if (testScriptInfo.invalidOperationTypeExists) {
            downloadLinkDialogAlertMessage.value = rootStore.message("common.generate-alert-info");
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
          rootStore.closeProgressDialog();
        }
      })();
    };

    return {
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
