<!--
 Copyright 2022 NTT Corporation.

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
  <div style="height: calc(100vh - 120px)">
    <v-toolbar color="latteart-main" dark fixed app clipped-right>
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
        >
          {{ $store.getters.message("history-view.export-screenshots") }}
        </v-btn>
      </screenshots-download-button>
      <v-btn
        id="scriptGenerateButton"
        color="primary"
        @click="scriptGenerationOptionDialogIsOpened = true"
        >{{ $store.getters.message("manage-header.generate-script") }}</v-btn
      >
      <v-btn id="viewerConfigButton" color="primary" @click="toViewerConfig">{{
        $store.getters.message("manage-header.capture-config")
      }}</v-btn>
    </v-toolbar>

    <v-btn :disabled="isResuming" @click="toBack()">{{
      $store.getters.message("manager-history-view.back")
    }}</v-btn>

    <history-display
      :changeWindowTitle="changeWindowTitle"
      :rawHistory="testResult.history"
      :windowHandles="windowHandles"
      :message="messageProvider"
      :screenDefinitionConfig="screenDefinitionConfig"
      :scriptGenerationEnabled="!$isViewerMode"
      :testResultId="testResultId"
      operationContextEnabled
    ></history-display>

    <scrollable-dialog :opened="dialogOpened">
      <template v-slot:title>{{ dialogTitle }}</template>
      <template v-slot:content>
        <v-text-field v-model="dialogValue" class="pt-0"></v-text-field>
      </template>
      <template v-slot:footer>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="dialogValue === ''"
          color="blue"
          :dark="dialogValue !== ''"
          @click="
            acceptEditDialog();
            closeDialog();
          "
          >{{ $store.getters.message("common.ok") }}</v-btn
        >
        <v-btn color="white" @click="closeDialog()">{{
          $store.getters.message("common.cancel")
        }}</v-btn>
      </template>
    </scrollable-dialog>

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
    <context-menu
      :opened="contextMenuOpened"
      :x="contextMenuX"
      :y="contextMenuY"
      :items="contextMenuItems"
      @contextMenuClose="contextMenuOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import {
  MessageProvider,
  OperationWithNotes,
  CoverageSource,
  OperationHistory,
} from "@/lib/operationHistory/types";
import { Story } from "@/lib/testManagement/types";
import HistoryDisplay from "@/vue/pages/operationHistory/organisms/HistoryDisplay.vue";
import IssueStatus from "@/lib/common/enum/IssueStatus";
import * as History from "@/lib/testManagement/History";
import TextUtil from "@/lib/operationHistory/graphConverter/TextUtil";
import ScrollableDialog from "@/vue/molecules/ScrollableDialog.vue";
import ErrorMessageDialog from "../common/ErrorMessageDialog.vue";
import ContextMenu from "@/vue/molecules/ContextMenu.vue";
import ScriptGenerationOptionDialog from "../common/ScriptGenerationOptionDialog.vue";
import DownloadLinkDialog from "../common/DownloadLinkDialog.vue";
import ScreenshotsDownloadButton from "@/vue/pages/operationHistory/organisms/ScreenshotsDownloadButton.vue";

@Component({
  components: {
    "history-display": HistoryDisplay,
    "scrollable-dialog": ScrollableDialog,
    "error-message-dialog": ErrorMessageDialog,
    "context-menu": ContextMenu,
    "script-generation-option-dialog": ScriptGenerationOptionDialog,
    "download-link-dialog": DownloadLinkDialog,
    "screenshots-download-button": ScreenshotsDownloadButton,
  },
})
export default class ReviewView extends Vue {
  private isResuming = false;
  private dialogOpened = false;
  private dialogTitle = "";
  private dialogMessage = "";
  private dialogValue = "";
  private errorDialogOpened = false;
  private errorMessage = "";
  private contextMenuOpened = false;
  private contextMenuX = -1;
  private contextMenuY = -1;
  private contextMenuItems: Array<{ label: string; onClick: () => void }> = [];

  private isGeneratingTestScripts = false;
  private scriptGenerationOptionDialogIsOpened = false;
  private downloadLinkDialogOpened = false;
  private downloadLinkDialogTitle = "";
  private downloadLinkDialogMessage = "";
  private downloadLinkDialogAlertMessage = "";
  private downloadLinkDialogLinkUrl = "";

  private get history(): OperationHistory {
    return this.$store.getters[
      "operationHistory/getHistory"
    ]() as OperationWithNotes[];
  }

  private generateTestScript(option: {
    testScript: {
      isSimple: boolean;
    };
    testData: {
      useDataDriven: boolean;
      maxGeneration: number;
    };
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

        this.downloadLinkDialogLinkUrl = `${this.$store.state.repositoryContainer.serviceUrl}/${testScriptInfo.outputUrl}`;
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

  private created() {
    const testResultId = this.$route.query.testResultId as string;

    this.$store.commit("operationHistory/setOpenNoteMenu", {
      menu: this.openNoteMenu,
    });

    (async () => {
      this.isResuming = true;

      try {
        await this.$store.dispatch("operationHistory/resume", { testResultId });
      } catch (error) {
        if (error instanceof Error) {
          console.error(error);
          this.errorDialogOpened = true;
          this.errorMessage = error.message;
        } else {
          throw error;
        }
      }

      this.isResuming = false;
    })();
  }

  private get testResultId(): string {
    return this.$route.query.testResultId as string;
  }

  private get testResult() {
    const history: OperationWithNotes[] =
      this.$store.getters["operationHistory/getHistory"]();
    const coverageSources: CoverageSource[] =
      this.$store.state.operationHistory.coverageSources;

    return { history, coverageSources };
  }

  private get screenDefinitionConfig() {
    return this.$store.state.operationHistory.config.screenDefinition;
  }

  private get messageProvider(): MessageProvider {
    return this.$store.getters.message;
  }

  private get windowHandles() {
    return this.testResult.history
      .map((operationWithNotes) => {
        return operationWithNotes.operation.windowHandle;
      })
      .filter((windowHandle, index, array) => {
        return array.indexOf(windowHandle) === index;
      })
      .map((windowHandle, index) => {
        return {
          text: `window${index + 1}`,
          value: windowHandle,
          available: false,
        };
      });
  }

  private get sessionId() {
    const sessionId = this.$route.query.sessionId as string;
    return sessionId;
  }

  private get tempStory() {
    return this.$store.state.testManagement.tempStory as Story;
  }

  private get session() {
    return History.getTargetSession(this.tempStory, this.sessionId);
  }

  private changeWindowTitle(windowTitle: string) {
    const windowTitleManagerPrefix =
      this.$store.getters.message("app.manage-title");
    this.$store.dispatch("changeWindowTitle", {
      title: `${windowTitleManagerPrefix} [${windowTitle}]`,
    });
  }

  private openNoteMenu(
    note: { id: string; sequence: number; index: number; type: string },
    eventInfo: { clientX: number; clientY: number }
  ) {
    if ((this as any).$isViewerMode) {
      return;
    }

    if (!note || (note.type !== "notice" && note.type !== "bug")) {
      return;
    }

    const targetSession = this.session;
    if (!targetSession) {
      return;
    }
    const targetIssue = History.getTargetIssue(targetSession, note);
    if (!targetIssue) {
      return;
    }

    this.contextMenuX = eventInfo.clientX;
    this.contextMenuY = eventInfo.clientY;
    this.contextMenuItems = [];

    switch (targetIssue.status) {
      case IssueStatus.Unreported:
        this.contextMenuItems.push({
          label: this.$store.getters.message("manager-history-view.bug-draft"),
          onClick: () => {
            this.dialogTitle = this.$store.getters.message(
              "manager-history-view.enter-bug-number"
            );
            this.dialogValue = targetIssue.ticketId;
            this.dialogOpened = true;
            this.acceptEditDialog = () => {
              this.updateIssue(note, IssueStatus.Reported, this.dialogValue);
            };

            this.contextMenuOpened = false;
          },
        });
        break;

      case IssueStatus.Reported:
        this.contextMenuItems.push({
          label: this.$store.getters.message(
            "manager-history-view.bug-draft-edit",
            { ticketid: TextUtil.ellipsis(targetIssue.ticketId, 30) }
          ),
          onClick: () => {
            this.dialogTitle = this.$store.getters.message(
              "manager-history-view.bug-draft-edit",
              { ticketid: targetIssue.ticketId }
            );
            this.dialogValue = targetIssue.ticketId;
            this.dialogOpened = true;
            this.acceptEditDialog = () => {
              this.updateIssue(note, "", this.dialogValue);
            };

            this.contextMenuOpened = false;
          },
        });

        this.contextMenuItems.push({
          label: this.$store.getters.message(
            "manager-history-view.bug-draft-withdraw",
            { ticketid: TextUtil.ellipsis(targetIssue.ticketId, 30) }
          ),
          onClick: () => {
            this.updateIssue(note, IssueStatus.Unreported);

            this.contextMenuOpened = false;
          },
        });
        break;

      default:
        this.contextMenuItems.push({
          label: this.$store.getters.message("manager-history-view.bug-draft"),
          onClick: () => {
            this.dialogTitle = this.$store.getters.message(
              "manager-history-view.enter-bug-number"
            );
            this.dialogValue = targetIssue.ticketId;
            this.dialogOpened = true;
            this.acceptEditDialog = () => {
              this.updateIssue(note, IssueStatus.Reported, this.dialogValue);
            };

            this.contextMenuOpened = false;
          },
        });

        this.contextMenuItems.push({
          label: this.$store.getters.message("manager-history-view.bug-none"),
          onClick: () => {
            this.updateIssue(note, IssueStatus.Unreported);

            this.contextMenuOpened = false;
          },
        });
        break;
    }

    this.contextMenuOpened = true;
  }

  private async updateIssue(
    issueSource: {
      sequence: number;
      index: number;
      type: string;
    },
    status: string,
    ticketId?: string
  ) {
    if (!this.session) {
      return;
    }
    const convertedIssueStatus = History.changeIssueStatus(
      this.session.issues,
      {
        sequence: issueSource.sequence,
        index: issueSource.index,
        type: issueSource.type,
      },
      status,
      ticketId
    );
    await this.$store.dispatch("testManagement/updateSession", {
      storyId: this.tempStory.id,
      sessionId: this.session.id,
      params: {
        issues: convertedIssueStatus,
      },
    });
    const story = this.$store.state.testManagement.stories.find(
      (story: Story) => story.id === this.tempStory.id
    );
    this.$store.commit("testManagement/setTempStory", { story });
  }

  private toViewerConfig() {
    this.$store.commit("openConfigViewer");
  }

  private toBack(): void {
    this.$store.dispatch("operationHistory/resetHistory");

    this.$router.push({
      name: "storyView",
      params: { id: this.tempStory.id },
      query: { status: this.tempStory.status },
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
