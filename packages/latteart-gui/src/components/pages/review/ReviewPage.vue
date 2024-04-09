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
  <v-container fluid class="fill-height pa-0">
    <v-app-bar color="#424242" absolute flat>
      <v-toolbar-title>{{ $t("manager-history-view.review") }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <screenshots-download-button v-slot="slotProps">
        <v-btn
          variant="elevated"
          :disabled="slotProps.obj.isDisabled"
          class="ma-2"
          @click="slotProps.obj.execute"
        >
          {{ $t("test-result-page.export-screenshots") }}
        </v-btn>
      </screenshots-download-button>
      <v-btn
        id="scriptGenerateButton"
        variant="elevated"
        class="ma-2"
        @click="scriptGenerationOptionDialogIsOpened = true"
        >{{ $t("manage-header.generate-script") }}</v-btn
      >
    </v-app-bar>

    <v-container fluid class="fill-height pa-0">
      <history-display
        :change-window-title="changeWindowTitle"
        :raw-history="testResult.history"
        :message="messageProvider"
        :script-generation-enabled="!isViewerMode"
        :test-result-id="testResultId"
        operation-context-enabled
      ></history-display>
    </v-container>

    <execute-dialog
      :opened="dialogOpened"
      :title="dialogTitle"
      :accept-button-disabled="dialogValue === ''"
      @accept="
        acceptEditDialog();
        closeDialog();
      "
      @cancel="closeDialog()"
    >
      <v-text-field v-model="dialogValue" class="pt-0"></v-text-field>
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
      :alert-message="downloadLinkDialogAlertMessage"
      :link-url="downloadLinkDialogLinkUrl"
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
import { type MessageProvider } from "@/lib/operationHistory/types";
import HistoryDisplay from "@/components/organisms/history/HistoryDisplay.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import ScriptGenerationOptionDialog from "@/components/organisms/dialog/ScriptGenerationOptionDialog.vue";
import DownloadLinkDialog from "@/components/molecules/DownloadLinkDialog.vue";
import ScreenshotsDownloadButton from "@/components/organisms/common/ScreenshotsDownloadButton.vue";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { computed, defineComponent, ref, inject } from "vue";
import { useRoute } from "vue-router";
import { useRootStore } from "@/stores/root";
import { useOperationHistoryStore } from "@/stores/operationHistory";

export default defineComponent({
  components: {
    "history-display": HistoryDisplay,
    "execute-dialog": ExecuteDialog,
    "error-message-dialog": ErrorMessageDialog,
    "script-generation-option-dialog": ScriptGenerationOptionDialog,
    "download-link-dialog": DownloadLinkDialog,
    "screenshots-download-button": ScreenshotsDownloadButton
  },
  setup() {
    const rootStore = useRootStore();
    const operationHistoryStore = useOperationHistoryStore();
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
      testScript: { isSimple: boolean; useMultiLocator: boolean };
      testData: { useDataDriven: boolean; maxGeneration: number };
      buttonDefinitions: {
        tagname: string;
        attribute?: { name: string; value: string };
      }[];
    }) => {
      (async () => {
        isGeneratingTestScripts.value = true;
        rootStore.openProgressDialog({
          message: rootStore.message("manage-header.generating-test-script")
        });

        try {
          const testScriptInfo = await operationHistoryStore.generateTestScripts({
            option
          });
          downloadLinkDialogTitle.value = rootStore.message("common.confirm");
          downloadLinkDialogMessage.value = rootStore.message(
            "test-result-page.generate-testscript-succeeded"
          );
          if (testScriptInfo.invalidOperationTypeExists) {
            downloadLinkDialogAlertMessage.value = rootStore.message(
              "test-result-page.generate-alert-info"
            );
          }

          downloadLinkDialogLinkUrl.value = rootStore.repositoryService
            ? `${rootStore.repositoryService.serviceUrl}/${testScriptInfo.outputUrl}`
            : "";
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
          rootStore.closeProgressDialog();
          scriptGenerationOptionDialogIsOpened.value = false;
          isGeneratingTestScripts.value = false;
        }
      })();
    };

    const testResultId = computed((): string => {
      return operationHistoryStore.testResultInfo.id;
    });

    const testResult = computed(() => {
      const history = operationHistoryStore.history;

      return { history };
    });

    const messageProvider = computed((): MessageProvider => {
      return rootStore.message;
    });

    const changeWindowTitle = (windowTitle: string) => {
      const windowTitlePrefix = rootStore.message(route.meta?.title ?? "");
      rootStore.changeWindowTitle({
        title: `${windowTitlePrefix} [${windowTitle}]`
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
      t: rootStore.message,
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
      messageProvider,
      changeWindowTitle,
      acceptEditDialog,
      closeDialog
    };
  }
});
</script>
