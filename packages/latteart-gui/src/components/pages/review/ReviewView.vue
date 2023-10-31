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
        $store.getters.message("manager-history-view.review")
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
          {{ $store.getters.message("history-view.export-screenshots") }}
        </v-btn>
      </screenshots-download-button>
      <v-btn
        id="scriptGenerateButton"
        color="primary"
        @click="scriptGenerationOptionDialogIsOpened = true"
        class="ma-2"
        >{{ $store.getters.message("manage-header.generate-script") }}</v-btn
      >
    </v-app-bar>

    <v-container fluid pa-0 style="height: 100%">
      <history-display
        :changeWindowTitle="changeWindowTitle"
        :rawHistory="testResult.history"
        :message="messageProvider"
        :screenDefinitionConfig="screenDefinitionConfig"
        :scriptGenerationEnabled="!$isViewerMode"
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
import { Component, Vue } from "vue-property-decorator";
import { MessageProvider } from "@/lib/operationHistory/types";
import { Story } from "@/lib/testManagement/types";
import HistoryDisplay from "@/components/pages/history/HistoryDisplay.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import ScriptGenerationOptionDialog from "@/components/organisms/dialog/ScriptGenerationOptionDialog.vue";
import DownloadLinkDialog from "@/components/molecules/DownloadLinkDialog.vue";
import ScreenshotsDownloadButton from "@/components/organisms/common/ScreenshotsDownloadButton.vue";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { OperationHistoryState } from "@/store/operationHistory";

@Component({
  components: {
    "history-display": HistoryDisplay,
    "execute-dialog": ExecuteDialog,
    "error-message-dialog": ErrorMessageDialog,
    "script-generation-option-dialog": ScriptGenerationOptionDialog,
    "download-link-dialog": DownloadLinkDialog,
    "screenshots-download-button": ScreenshotsDownloadButton,
  },
})
export default class ReviewView extends Vue {
  private dialogOpened = false;
  private dialogTitle = "";
  private dialogMessage = "";
  private dialogValue = "";
  private errorDialogOpened = false;
  private errorMessage = "";

  private isGeneratingTestScripts = false;
  private scriptGenerationOptionDialogIsOpened = false;
  private downloadLinkDialogOpened = false;
  private downloadLinkDialogTitle = "";
  private downloadLinkDialogMessage = "";
  private downloadLinkDialogAlertMessage = "";
  private downloadLinkDialogLinkUrl = "";

  private generateTestScript(option: {
    testScript: {
      isSimple: boolean;
    };
    testData: {
      useDataDriven: boolean;
      maxGeneration: number;
    };
    buttonDefinitions: {
      tagname: string;
      attribute?: { name: string; value: string };
    }[];
  }) {
    (async () => {
      this.isGeneratingTestScripts = true;
      this.$store.dispatch("openProgressDialog", {
        message: this.$store.getters.message(
          "manage-header.generating-test-script"
        ),
      });

      try {
        const testScriptInfo = await this.$store.dispatch(
          "operationHistory/generateTestScripts",
          {
            option,
          }
        );
        this.downloadLinkDialogTitle =
          this.$store.getters.message("common.confirm");
        this.downloadLinkDialogMessage = this.$store.getters.message(
          "history-view.generate-testscript-succeeded"
        );
        if (testScriptInfo.invalidOperationTypeExists) {
          this.downloadLinkDialogAlertMessage = this.$store.getters.message(
            "history-view.generate-alert-info"
          );
        }

        this.downloadLinkDialogLinkUrl = `${this.$store.state.repositoryService.serviceUrl}/${testScriptInfo.outputUrl}`;
        this.scriptGenerationOptionDialogIsOpened = false;
        this.downloadLinkDialogOpened = true;
      } catch (error) {
        if (error instanceof Error) {
          this.errorMessage = error.message;
          this.errorDialogOpened = true;
        } else {
          throw error;
        }
      } finally {
        this.$store.dispatch("closeProgressDialog");
        this.scriptGenerationOptionDialogIsOpened = false;
        this.isGeneratingTestScripts = false;
      }
    })();
  }

  private get testResultId(): string {
    return (this.$store.state.operationHistory as OperationHistoryState)
      .testResultInfo.id;
  }

  private get testResult() {
    const history = (
      this.$store.state.operationHistory as OperationHistoryState
    ).history;

    return { history };
  }

  private get screenDefinitionConfig() {
    return this.$store.state.projectSettings.config.screenDefinition;
  }

  private get messageProvider(): MessageProvider {
    return this.$store.getters.message;
  }

  private get tempStory() {
    return this.$store.state.testManagement.tempStory as Story;
  }

  private changeWindowTitle(windowTitle: string) {
    const windowTitlePrefix = this.$store.getters.message(
      this.$route.meta?.title ?? ""
    );
    this.$store.dispatch("changeWindowTitle", {
      title: `${windowTitlePrefix} [${windowTitle}]`,
    });
  }

  private acceptEditDialog() {
    /* Do nothing */
  }

  private closeDialog() {
    this.dialogOpened = false;
    this.dialogValue = "";
  }
}
</script>
