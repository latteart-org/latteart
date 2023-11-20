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
  <v-container fluid fill-height pa-0>
    <v-app-bar color="latteart-main" dark absolute flat>
      <v-toolbar-title>{{
        store.getters.message("manager-history-view.review")
      }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <screenshots-download-button v-slot:default="slotProps">
        <v-btn
          :disabled="slotProps.obj.isDisabled"
          color="primary"
          :dark="!slotProps.obj.processing"
          @click="slotProps.obj.execute"
          class="ma-2"
        >
          {{ store.getters.message("test-result-page.export-screenshots") }}
        </v-btn>
      </screenshots-download-button>
      <v-btn
        id="scriptGenerateButton"
        color="primary"
        @click="scriptGenerationOptionDialogIsOpened = true"
        class="ma-2"
        >{{ store.getters.message("manage-header.generate-script") }}</v-btn
      >
    </v-app-bar>

    <v-container fluid pa-0 style="height: 100%">
      <history-display
        :changeWindowTitle="changeWindowTitle"
        :rawHistory="testResult.history"
        :message="messageProvider"
        :screenDefinitionConfig="screenDefinitionConfig"
        :scriptGenerationEnabled="!isViewerMode"
        :testResultId="testResultId"
        operationContextEnabled
      ></history-display>
    </v-container>

    <execute-dialog
      :opened="dialogOpened"
      :title="dialogTitle"
      @accept="
        acceptEditDialog();
        closeDialog();
      "
      @cancel="closeDialog()"
      :acceptButtonDisabled="dialogValue === ''"
    >
      <template>
        <v-text-field v-model="dialogValue" class="pt-0"></v-text-field>
      </template>
    </execute-dialog>

    <script-generation-option-dialog
      :opened="scriptGenerationOptionDialogIsOpened"
      @execute="generateTestScript"
      @close="scriptGenerationOptionDialogIsOpened = false"
    >
    </script-generation-option-dialog>

    <download-link-dialog
      :opened="downloadLinkDialogOpened"
      :title="downloadLinkDialogTitle"
      :message="downloadLinkDialogMessage"
      :alertMessage="downloadLinkDialogAlertMessage"
      :linkUrl="downloadLinkDialogLinkUrl"
      @close="downloadLinkDialogOpened = false"
    />

    <error-message-dialog
      :opened="errorDialogOpened"
      :message="errorMessage"
      @close="errorDialogOpened = false"
    ></error-message-dialog>
  </v-container>
</template>

<script lang="ts">
import { MessageProvider } from "@/lib/operationHistory/types";
import HistoryDisplay from "@/components/organisms/history/HistoryDisplay.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import ScriptGenerationOptionDialog from "@/components/organisms/dialog/ScriptGenerationOptionDialog.vue";
import DownloadLinkDialog from "@/components/molecules/DownloadLinkDialog.vue";
import ScreenshotsDownloadButton from "@/components/organisms/common/ScreenshotsDownloadButton.vue";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import { computed, defineComponent, ref, inject } from "vue";
import { useStore } from "@/store";
import { useRoute } from "vue-router/composables";

export default defineComponent({
  components: {
    "history-display": HistoryDisplay,
    "execute-dialog": ExecuteDialog,
    "error-message-dialog": ErrorMessageDialog,
    "script-generation-option-dialog": ScriptGenerationOptionDialog,
    "download-link-dialog": DownloadLinkDialog,
    "screenshots-download-button": ScreenshotsDownloadButton,
  },
  setup() {
    const store = useStore();
    const route = useRoute();

    const dialogOpened = ref(false);
    const dialogTitle = ref("");
    const dialogValue = ref("");
    const errorDialogOpened = ref(false);
    const errorMessage = ref("");

    const isGeneratingTestScripts = ref(false);
    const scriptGenerationOptionDialogIsOpened = ref(false);
    const downloadLinkDialogOpened = ref(false);
    const downloadLinkDialogTitle = ref("");
    const downloadLinkDialogMessage = ref("");
    const downloadLinkDialogAlertMessage = ref("");
    const downloadLinkDialogLinkUrl = ref("");

    const isViewerMode = inject("isViewerMode") ?? false;

    const generateTestScript = (option: {
      testScript: { isSimple: boolean };
      testData: { useDataDriven: boolean; maxGeneration: number };
      buttonDefinitions: {
        tagname: string;
        attribute?: { name: string; value: string };
      }[];
    }) => {
      (async () => {
        isGeneratingTestScripts.value = true;
        store.dispatch("openProgressDialog", {
          message: store.getters.message(
            "manage-header.generating-test-script"
          ),
        });

        try {
          const testScriptInfo = await store.dispatch(
            "operationHistory/generateTestScripts",
            {
              option,
            }
          );
          downloadLinkDialogTitle.value =
            store.getters.message("common.confirm");
          downloadLinkDialogMessage.value = store.getters.message(
            "test-result-page.generate-testscript-succeeded"
          );
          if (testScriptInfo.invalidOperationTypeExists) {
            downloadLinkDialogAlertMessage.value = store.getters.message(
              "test-result-page.generate-alert-info"
            );
          }

          downloadLinkDialogLinkUrl.value = `${store.state.repositoryService.serviceUrl}/${testScriptInfo.outputUrl}`;
          scriptGenerationOptionDialogIsOpened.value = false;
          downloadLinkDialogOpened.value = true;
        } catch (error) {
          if (error instanceof Error) {
            errorMessage.value = error.message;
            errorDialogOpened.value = true;
          } else {
            throw error;
          }
        } finally {
          store.dispatch("closeProgressDialog");
          scriptGenerationOptionDialogIsOpened.value = false;
          isGeneratingTestScripts.value = false;
        }
      })();
    };

    const testResultId = computed((): string => {
      return ((store.state as any).operationHistory as OperationHistoryState)
        .testResultInfo.id;
    });

    const testResult = computed(() => {
      const history = (
        (store.state as any).operationHistory as OperationHistoryState
      ).history;

      return { history };
    });

    const screenDefinitionConfig = computed(() => {
      return store.state.projectSettings.config.screenDefinition;
    });

    const messageProvider = computed((): MessageProvider => {
      return store.getters.message;
    });

    const changeWindowTitle = (windowTitle: string) => {
      const windowTitlePrefix = store.getters.message(route.meta?.title ?? "");
      store.dispatch("changeWindowTitle", {
        title: `${windowTitlePrefix} [${windowTitle}]`,
      });
    };

    const acceptEditDialog = () => {
      /* Do nothing */
    };

    const closeDialog = () => {
      dialogOpened.value = false;
      dialogValue.value = "";
    };

    return {
      store,
      dialogOpened,
      dialogTitle,
      dialogValue,
      errorDialogOpened,
      errorMessage,
      scriptGenerationOptionDialogIsOpened,
      downloadLinkDialogOpened,
      downloadLinkDialogTitle,
      downloadLinkDialogMessage,
      downloadLinkDialogAlertMessage,
      downloadLinkDialogLinkUrl,
      isViewerMode,
      generateTestScript,
      testResultId,
      testResult,
      screenDefinitionConfig,
      messageProvider,
      changeWindowTitle,
      acceptEditDialog,
      closeDialog,
    };
  },
});
</script>
