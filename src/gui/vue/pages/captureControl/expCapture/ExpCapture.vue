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
  <v-app>
    <v-toolbar color="white" fixed flat app height="64px">
      <v-layout justify-start align-center row>
        <v-icon class="pr-1">open_in_browser</v-icon>
        <v-text-field
          single-line
          label="URL"
          v-model="url"
          :disabled="isCapturing || isReplaying || isResuming"
          id="urlTextField"
        ></v-text-field>
        <v-icon class="pl-4 pr-1">save_alt</v-icon>
        <v-text-field
          single-line
          :label="$store.getters.message('app.test-result-name')"
          v-model="testResultName"
          @change="changeCurrentTestResultName"
          :disabled="!canDoChangeDirectory"
          id="outputDirectoryTextField"
        ></v-text-field>
        <div>
          <v-layout>
            <v-btn
              v-if="!isCapturing"
              :disabled="!url || isReplaying || isResuming || !urlIsValid"
              icon
              flat
              large
              color="grey darken-3"
              @click="testOptionDialogOpened = true"
              :title="$store.getters.message('app.start')"
              id="startButton"
            >
              <v-icon>fiber_manual_record</v-icon>
            </v-btn>
            <v-btn
              v-else
              icon
              flat
              large
              color="red"
              @click="endCapture"
              :title="$store.getters.message('app.finish')"
              id="endButton"
            >
              <v-icon>fiber_manual_record</v-icon>
            </v-btn>
            <v-btn
              :disabled="!isCapturing"
              @click="pushPauseButton"
              icon
              flat
              large
              :title="pauseButtonTooltip"
              :color="pauseButtonColor"
            >
              <v-icon>pause</v-icon>
            </v-btn>

            <v-btn
              :disabled="isCapturing || isReplaying || isResuming"
              icon
              flat
              large
              color="grey darken-3"
              @click="resetHistory"
              :title="$store.getters.message('app.reset')"
            >
              <v-icon>refresh</v-icon>
            </v-btn>

            <v-btn
              icon
              flat
              large
              color="grey darken-3"
              @click="updateTestResults"
              :disabled="isCapturing || isReplaying || isResuming"
              :title="$store.getters.message('app.import')"
            >
              <v-icon>folder_open</v-icon>
            </v-btn>

            <v-btn
              icon
              flat
              large
              color="grey darken-3"
              @click="getImportTestResults"
              :loading="isImportTestResults"
              :disabled="isImportTestResults"
              :title="$store.getters.message('manage-header.import-option')"
            >
              <v-icon>file_upload</v-icon>
            </v-btn>

            <v-btn
              icon
              flat
              large
              color="grey darken-3"
              @click="scriptGenerationOptionDialogIsOpened = true"
              :loading="isGeneratingTestScripts"
              :disabled="sequence === 0 || isGeneratingTestScripts"
              :title="
                $store.getters.message('history-view.generate-testscript')
              "
              ><v-icon>description</v-icon></v-btn
            >

            <v-btn
              icon
              flat
              large
              id="exportButton"
              color="grey darken-3"
              @click="exportData"
              :loading="isExportingData"
              :disabled="sequence === 0 || isExportingData"
              :title="$store.getters.message('manage-header.export-option')"
              ><v-icon>file_download</v-icon></v-btn
            >

            <v-menu
              offset-y
              v-model="showMenu"
              :position-x="menuX"
              :position-y="menuY"
              absolute
            >
              <v-list>
                <v-list-tile
                  v-for="(testResult, index) in testResults"
                  :key="index"
                  @click="resume(testResult.id)"
                  :disabled="!testResult.id"
                >
                  <v-list-tile-title>{{ testResult.name }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>

            <v-menu
              offset-y
              v-model="showImportData"
              :position-x="dataX"
              :position-y="dataY"
              absolute
            >
              <v-list>
                <v-list-tile
                  v-for="(testResult, index) in importTestResults"
                  :key="index"
                  @click="importData(testResult)"
                  :disabled="!testResult.url"
                >
                  <v-list-tile-title>{{ testResult.name }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>

            <replay-history-button
              :disabled="isCapturing || isResuming"
              :isReplaying="isReplaying"
            ></replay-history-button>
          </v-layout>
        </div>
        <v-flex shrink pa-1 pl-3>
          <v-select
            :label="$store.getters.message('manage-header.locale')"
            :items="locales"
            :value="initLocale"
            v-on:change="changeLocale"
            :disabled="isConnectedToRemote"
          ></v-select>
        </v-flex>
        <remote-access-field
          :url="currentRepositoryUrl"
          color="inherit"
          :urls="repositoryUrls"
          @execute="startRemoteConnection"
          :disabled="isCapturing"
        ></remote-access-field>
      </v-layout>
    </v-toolbar>

    <v-content>
      <v-container
        fluid
        pa-0
        fill-height
        :style="{ 'max-height': 'calc(100vh - 64px - 64px)' }"
      >
        <router-view @openNoteEditDialog="openNoteEditDialog"></router-view>
      </v-container>
    </v-content>

    <v-footer app height="auto" mt-5>
      <v-layout justify-start align-center row pl-2 pr-2>
        <v-btn
          fab
          small
          @click="browserBack"
          :disabled="!isCapturing || !canDoBrowserBack"
          :title="$store.getters.message('navigate.back')"
        >
          <v-icon dark>arrow_back</v-icon>
        </v-btn>
        <v-btn
          fab
          small
          @click="browserForward"
          :disabled="!isCapturing || !canDoBrowserForward"
          :title="$store.getters.message('navigate.forward')"
        >
          <v-icon dark>arrow_forward</v-icon>
        </v-btn>

        <v-divider vertical class="mx-3"></v-divider>

        {{ currentWindowName }}

        <v-spacer></v-spacer>

        <v-btn
          :disabled="!windowSelectorIsEnabled"
          fab
          small
          @click="openWindowSelector"
          :title="$store.getters.message('app.target-tab-window')"
          id="openWindowSelectorButton"
        >
          <v-icon dark>tab</v-icon>
        </v-btn>

        <v-divider vertical class="mx-3"></v-divider>

        <note-register-button
          :disabled="!isCapturing"
          :buttonText="$store.getters.message('app.record-note')"
          buttonIcon="add_comment"
        ></note-register-button>

        <v-divider vertical class="mx-3"></v-divider>

        <router-link
          v-if="!isHistoryMode"
          to="history"
          @click.native="isHistoryMode = true"
        >
          <v-btn
            fab
            small
            color="orange darken-1"
            dark
            :title="$store.getters.message('app.history')"
          >
            <v-icon>history</v-icon>
          </v-btn>
        </router-link>
        <router-link v-else to="config" @click.native="isHistoryMode = false">
          <v-btn
            fab
            small
            color="grey darken-3"
            dark
            :title="$store.getters.message('app.target')"
          >
            <v-icon>settings</v-icon>
          </v-btn>
        </router-link>
        <span class="px-1">{{ nowTime }}</span>
      </v-layout>
    </v-footer>

    <scrollable-dialog :opened="windowSelectorOpened">
      <template v-slot:title>{{
        $store.getters.message("app.target-tab-window")
      }}</template>
      <template v-slot:content>
        <v-select
          :items="capturingWindowInfo.availableWindows"
          v-model="capturingWindowInfo.currentWindow"
        >
        </v-select>
      </template>
      <template v-slot:footer>
        <v-spacer></v-spacer>
        <v-btn
          @click="
            onAcceptWindowSelector();
            windowSelectorOpened = false;
          "
          >{{ $store.getters.message("common.ok") }}</v-btn
        >
        <v-btn
          @click="
            onCancelWindowSelector();
            windowSelectorOpened = false;
          "
          >{{ $store.getters.message("common.cancel") }}</v-btn
        >
      </template>
    </scrollable-dialog>

    <intention-edit-dialog
      :opened="intentionEditDialogOpened"
      @close="intentionEditDialogOpened = false"
    />
    <bug-edit-dialog
      :opened="bugEditDialogOpened"
      @close="bugEditDialogOpened = false"
    />
    <notice-edit-dialog
      :opened="noticeEditDialogOpened"
      @close="noticeEditDialogOpened = false"
    />

    <test-option-dialog
      :opened="testOptionDialogOpened"
      @close="testOptionDialogOpened = false"
      @ok="startCapture"
    />

    <information-message-dialog
      :opened="informationMessageDialogOpened"
      :title="informationTitle"
      :message="informationMessage"
      @close="informationMessageDialogOpened = false"
    />

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
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />

    <context-menu
      :opened="contextMenuOpened"
      :x="contextMenuX"
      :y="contextMenuY"
      :items="contextMenuItems"
      @contextMenuClose="contextMenuOpened = false"
    />
    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :onAccept="confirmDialogAccept"
      @close="confirmDialogOpened = false"
    />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NoteRegisterButton from "./organisms/NoteRegisterButton.vue";
import { CaptureConfig } from "@/lib/captureControl/CaptureConfig";
import {
  OperationHistory,
  OperationWithNotes,
  WindowHandle,
} from "@/lib/operationHistory/types";
import { PlatformName } from "@/lib/common/enum/SettingsEnum";
import ReplayHistoryButton from "./organisms/ReplayHistoryButton.vue";
import ScrollableDialog from "@/vue/molecules/ScrollableDialog.vue";
import IntentionEditDialog from "@/vue/pages/common/IntentionEditDialog.vue";
import BugEditDialog from "@/vue/pages/common/BugEditDialog.vue";
import NoticeEditDialog from "@/vue/pages/common/NoticeEditDialog.vue";
import ErrorMessageDialog from "@/vue/pages/common/ErrorMessageDialog.vue";
import ContextMenu from "@/vue/molecules/ContextMenu.vue";
import TestOptionDialog from "../testOptionDialog/TestOptionDialog.vue";
import InformationMessageDialog from "../../common/InformationMessageDialog.vue";
import ScriptGenerationOptionDialog from "../../common/ScriptGenerationOptionDialog.vue";
import DownloadLinkDialog from "../../common/DownloadLinkDialog.vue";
import RemoteAccessField from "@/vue/molecules/RemoteAccessField.vue";
import ConfirmDialog from "../../common/ConfirmDialog.vue";
import RepositoryServiceDispatcher from "@/lib/eventDispatcher/RepositoryServiceDispatcher";
import { formatTime, TimestampImpl } from "@/lib/common/Timestamp";
import { calculateElapsedEpochMillis } from "@/lib/common/util";

@Component({
  components: {
    "note-register-button": NoteRegisterButton,
    "replay-history-button": ReplayHistoryButton,
    "scrollable-dialog": ScrollableDialog,
    "intention-edit-dialog": IntentionEditDialog,
    "bug-edit-dialog": BugEditDialog,
    "notice-edit-dialog": NoticeEditDialog,
    "test-option-dialog": TestOptionDialog,
    "error-message-dialog": ErrorMessageDialog,
    "context-menu": ContextMenu,
    "information-message-dialog": InformationMessageDialog,
    "script-generation-option-dialog": ScriptGenerationOptionDialog,
    "download-link-dialog": DownloadLinkDialog,
    "remote-access-field": RemoteAccessField,
    "confirm-dialog": ConfirmDialog,
  },
})
export default class ExpCapture extends Vue {
  public get initLocale(): string {
    return this.$store.getters.getLocale();
  }

  private get currentWindowName(): string {
    const capturingWindowInfo: {
      currentWindow: string;
      availableWindows: WindowHandle[];
    } = this.$store.state.captureControl.capturingWindowInfo;

    const currentWindow = capturingWindowInfo.availableWindows.find(
      (window) => {
        return window.value === capturingWindowInfo.currentWindow;
      }
    );

    if (currentWindow === undefined) {
      return "No Window";
    }

    return currentWindow.text;
  }

  private get windowSelectorIsEnabled() {
    if (!this.isCapturing) {
      return false;
    }
    if (this.config.platformName === PlatformName.iOS) {
      return false;
    }
    return true;
  }

  private get config(): CaptureConfig {
    return this.$store.state.operationHistory.config;
  }

  private get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  private get isPaused(): boolean {
    return this.$store.state.captureControl.isPaused;
  }

  private get isReplaying(): boolean {
    return this.$store.state.captureControl.isReplaying;
  }

  private get isResuming(): boolean {
    return this.$store.state.captureControl.isResuming;
  }

  private get sequence() {
    const history = this.$store.getters["operationHistory/getHistory"]();
    if (history.length === 0) {
      return 0;
    }
    return history[history.length - 1].operation.sequence;
  }

  private get history(): OperationHistory {
    return this.$store.getters[
      "operationHistory/getHistory"
    ]() as OperationWithNotes[];
  }

  private get url(): string {
    return this.$store.state.captureControl.url;
  }
  private set url(value: string) {
    this.$store.commit("captureControl/setUrl", { url: value });
  }

  private get urlIsValid(): boolean {
    return this.$store.getters["captureControl/urlIsValid"]();
  }

  private get canDoBrowserBack() {
    return this.$store.state.captureControl.canDoBrowserBack;
  }
  private get canDoBrowserForward() {
    return this.$store.state.captureControl.canDoBrowserForward;
  }

  private get canDoChangeDirectory() {
    return !this.isCapturing && !this.isResuming;
  }

  private get testResultName(): string {
    return this.$store.state.operationHistory.testResultInfo.name;
  }

  private set testResultName(name: string) {
    this.$store.commit("operationHistory/setTestResultName", { name });
  }

  private get pauseButtonColor() {
    return this.isPaused ? "yellow" : "grey darken-3";
  }

  private get isConnectedToRemote() {
    return this.$store.state.repositoryServiceDispatcher.isRemote;
  }

  private pushPauseButton() {
    if (this.isPaused) {
      this.$store.dispatch("captureControl/resumeCapturing");
    } else {
      this.$store.dispatch("captureControl/pauseCapturing");
    }
  }

  private changeCurrentTestResultName() {
    this.$store.dispatch("operationHistory/changeCurrentTestResult", {
      startTime: null,
      initialUrl: "",
    });
  }

  private informationMessageDialogOpened = false;
  private informationTitle = "";
  private informationMessage = "";

  private isGeneratingTestScripts = false;
  private scriptGenerationOptionDialogIsOpened = false;
  private isExportingData = false;
  private isImportTestResults = false;
  private remoteUrl = "";

  private testResults: Array<{ id: string; name: string }> = [];
  private importTestResults: Array<{ url: string; name: string }> = [];

  private showMenu = false;
  private menuX = 0;
  private menuY = 0;

  private showImportData = false;
  private dataX = 0;
  private dataY = 0;

  private isHistoryMode = false;
  private locales: string[] = ["ja", "en"];
  private timerArray = [];
  private nowTime = "00:00:00";
  private windowTitle = "";

  private windowSelectorOpened = false;
  private capturingWindowInfo: {
    currentWindow: string;
    availableWindows: WindowHandle[];
  } = {
    currentWindow: "",
    availableWindows: [],
  };
  private intentionEditDialogOpened = false;
  private bugEditDialogOpened = false;
  private noticeEditDialogOpened = false;
  private testOptionDialogOpened = false;
  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private downloadLinkDialogOpened = false;
  private downloadLinkDialogTitle = "";
  private downloadLinkDialogMessage = "";
  private downloadLinkDialogAlertMessage = "";
  private downloadLinkDialogLinkUrl = "";

  private confirmDialogOpened = false;
  private confirmDialogTitle = "";
  private confirmDialogMessage = "";
  private confirmDialogAccept() {
    /* Do nothing */
  }

  private remoteTestResultId = "";

  private contextMenuOpened = false;
  private contextMenuX = -1;
  private contextMenuY = -1;
  private contextMenuItems: Array<{ label: string; onClick: () => void }> = [];

  private importData(importTestResult: { url: string; name: string }) {
    this.isImportTestResults = true;
    if (!importTestResult.url) {
      this.isImportTestResults = false;
      return;
    }

    setTimeout(async () => {
      try {
        await this.$store.dispatch("operationHistory/importData", {
          source: { testResultFileUrl: importTestResult.url },
        });

        this.informationMessageDialogOpened = true;
        this.informationTitle = this.$store.getters.message(
          "import-export-dialog.import-title"
        );
        this.informationMessage = this.$store.getters.message(
          "import-export-dialog.import-data-succeeded",
          {
            returnName: importTestResult.name,
          }
        );
      } catch (error) {
        this.errorMessage = `${error.message}`;
        this.errorMessageDialogOpened = true;
      } finally {
        this.isImportTestResults = false;
      }
    }, 300);
  }

  private exportData() {
    (async () => {
      this.isExportingData = true;
      const testResultId = this.$store.state.operationHistory.testResultInfo.id;

      try {
        const exportDataPath = await this.$store
          .dispatch("operationHistory/exportData", { testResultId })
          .catch((error) => {
            console.error(error);
          });
        this.downloadLinkDialogTitle = this.$store.getters.message(
          "common.confirm"
        );
        this.downloadLinkDialogMessage = this.$store.getters.message(
          "import-export-dialog.create-export-data-succeeded"
        );
        this.downloadLinkDialogAlertMessage = "";
        this.downloadLinkDialogLinkUrl = `${this.currentRepositoryUrl}/${exportDataPath}`;
        this.downloadLinkDialogOpened = true;
      } catch (error) {
        this.errorMessage = error.message;
        this.errorMessageDialogOpened = true;
      } finally {
        this.isExportingData = false;
      }
    })();
  }

  private generateTestScript(option: {
    useDataDriven: boolean;
    maxGeneration: number;
  }) {
    (async () => {
      this.isGeneratingTestScripts = true;
      const testResultId = this.$store.state.operationHistory.testResultInfo.id;

      const initialUrl = this.$store.state.captureControl.url;
      try {
        const testScriptInfo = await this.$store.dispatch(
          "operationHistory/generateTestScripts",
          {
            testResultId,
            sources: [
              {
                initialUrl,
                history: this.history.map(({ operation }) => operation),
              },
            ],
            option,
          }
        );
        this.downloadLinkDialogTitle = this.$store.getters.message(
          "common.confirm"
        );
        this.downloadLinkDialogMessage = this.$store.getters.message(
          "history-view.generate-testscript-succeeded"
        );
        if (testScriptInfo.invalidOperationTypeExists) {
          this.downloadLinkDialogAlertMessage = this.$store.getters.message(
            "history-view.generate-alert-info"
          );
        } else {
          this.downloadLinkDialogAlertMessage = "";
        }
        this.downloadLinkDialogLinkUrl = `${this.currentRepositoryUrl}/${testScriptInfo.outputUrl}`;
        this.scriptGenerationOptionDialogIsOpened = false;
        this.downloadLinkDialogOpened = true;
      } catch (error) {
        this.errorMessage = error.message;
        this.scriptGenerationOptionDialogIsOpened = false;
        this.errorMessageDialogOpened = true;
      } finally {
        this.isGeneratingTestScripts = false;
      }
    })();
  }

  private updateTestResults(e: any) {
    e.preventDefault();

    if (this.showMenu) {
      this.showMenu = false;
      return;
    }

    this.menuX = e.clientX;
    this.menuY = e.clientY;
    this.$nextTick(async () => {
      const newTestResults = await this.$store.dispatch(
        "operationHistory/getTestResults"
      );

      this.testResults.splice(0, this.testResults.length, ...newTestResults);

      if (this.testResults.length === 0) {
        this.testResults.push({
          id: "",
          name: "EMPTY",
        });
      }

      this.showMenu = true;
    });
  }

  private getImportTestResults(e: any) {
    e.preventDefault();

    if (this.showImportData) {
      this.showImportData = false;
      return;
    }

    this.dataX = e.clientX;
    this.dataY = e.clientY;
    this.$nextTick(async () => {
      const newImportTestResults: {
        url: string;
        name: string;
      }[] = await this.$store.dispatch("operationHistory/getImportTestResults");

      this.importTestResults.splice(
        0,
        this.importTestResults.length,
        ...newImportTestResults
      );

      if (this.importTestResults.length === 0) {
        this.importTestResults.push({
          url: "",
          name: "EMPTY",
        });
      }

      this.showImportData = true;
    });
  }

  private openNoteMenu(
    note: { id: number; sequence: number; index: number; type: string },
    eventInfo: { clientX: number; clientY: number }
  ) {
    const context = this.$store;

    this.contextMenuX = eventInfo.clientX;
    this.contextMenuY = eventInfo.clientY;
    this.contextMenuItems = [];

    this.contextMenuItems.push({
      label: context.getters.message("history-view.edit-comment"),
      onClick: () => {
        if (context.state.operationHistory.tmpNoteInfoForEdit) {
          context.state.operationHistory.openNoteEditDialog(
            note.type,
            note.sequence,
            note.index
          );
        }

        this.contextMenuOpened = false;
        context.commit("operationHistory/setTmpNoteInfoForEdit", {
          tmpNoteInfoForEdit: null,
        });
      },
    });
    this.contextMenuItems.push({
      label: context.getters.message("history-view.delete-comment"),
      onClick: () => {
        if (context.state.operationHistory.tmpNoteInfoForEdit) {
          context.state.operationHistory.deleteNote(
            note.type,
            note.sequence,
            note.index
          );
        }

        this.contextMenuOpened = false;
        context.commit("operationHistory/setTmpNoteInfoForEdit", {
          tmpNoteInfoForEdit: null,
        });
      },
    });

    context.commit("operationHistory/setTmpNoteInfoForEdit", {
      tmpNoteInfoForEdit: {
        noteType: note.type,
        sequence: note.sequence,
        index: note.index,
      },
    });
    this.contextMenuOpened = true;
  }

  private mounted() {
    this.$store.commit("operationHistory/setOpenNoteEditDialogFunction", {
      openNoteEditDialog: this.openNoteEditDialog,
    });

    this.$store.commit("operationHistory/setOpenNoteMenu", {
      menu: this.openNoteMenu,
    });

    this.$store.commit("operationHistory/setDeleteNoteFunction", {
      deleteNote: this.deleteNote,
    });
  }

  private get pauseButtonTooltip(): string {
    if (!this.isCapturing) {
      return "";
    }
    return this.$store.getters.message(
      this.isPaused ? "app.resume-capturing" : "app.pause-capturing"
    );
  }

  private onSaveEditIntention = () => {
    /* Do nothing */
  };
  private onSaveEditBug = () => {
    /* Do nothing */
  };
  private onSaveEditNotice = () => {
    /* Do nothing */
  };

  private changeLocale(locale: string): void {
    (async () => {
      try {
        await this.$store.dispatch("changeLocale", { locale });
      } catch (error) {
        this.errorMessage = error.message;
        this.errorMessageDialogOpened = true;
      }
    })();
  }

  private startCapture(): void {
    this.$router.push({ path: "history" }).catch((err: Error) => {
      if (err.name !== "NavigationDuplicated") {
        throw err;
      }
    });

    this.isHistoryMode = true;

    (async () => {
      try {
        const currentRepositoryInfo = (() => {
          const currentRepository: RepositoryServiceDispatcher = this.$store
            .state.repositoryServiceDispatcher;

          return {
            url: currentRepository.serviceUrl,
            isRemote: currentRepository.isRemote,
          };
        })();

        const testResultId = await (async () => {
          const testResultInfo: {
            repositoryUrl: string;
            id: string;
          } = this.$store.state.operationHistory.testResultInfo;

          if (
            !testResultInfo.repositoryUrl ||
            testResultInfo.repositoryUrl ===
              this.$store.state.localRepositoryServiceUrl
          ) {
            return testResultInfo.id;
          }

          const id: string =
            (
              await this.$store.dispatch(
                "operationHistory/importTestResultFromRemoteRepository"
              )
            ).testResultId ?? "";

          return id;
        })();

        const remoteTestResultId =
          this.$store.state.operationHistory.testResultInfo.id ?? "";

        // switch to local
        this.$store.commit(
          "setRepositoryServiceDispatcher",
          {
            serviceDispatcher: new RepositoryServiceDispatcher({
              url: this.$store.state.localRepositoryServiceUrl,
              isRemote: false,
            }),
          },
          { root: true }
        );

        if (testResultId === "") {
          await this.$store.dispatch("operationHistory/createTestResult", {
            initialUrl: this.url,
            name: this.testResultName,
          });
        } else {
          const tmpUrl = this.url;
          await this.$store.dispatch("operationHistory/resume", {
            testResultId,
          });
          this.url = tmpUrl;
        }

        const history = this.$store.state.operationHistory.history;
        const startTime = new TimestampImpl().epochMilliseconds();
        const readResultData = await this.$store.dispatch(
          "operationHistory/getTestResult",
          {
            testResultId,
          }
        );

        if (history.length === 0) {
          await this.$store.dispatch(
            "operationHistory/changeCurrentTestResult",
            {
              startTime,
              initialUrl: this.url,
            }
          );
        } else if (history.length > 0) {
          await this.$store.dispatch(
            "operationHistory/changeCurrentTestResult",
            {
              startTime,
              initialUrl: "",
            }
          );
        }

        await this.$store.dispatch("captureControl/startCapture", {
          url: this.url,
          config: this.config,
          startTime,
          lastStartTime: readResultData?.startTimeStamp ?? 0,
          callbacks: {
            onChangeTime: (time: string) => {
              this.nowTime = time;
            },
            onChangeNumberOfWindows: () => {
              this.openWindowSelector();
            },
          },
        });

        // switch to before repository
        this.$store.commit(
          "setRepositoryServiceDispatcher",
          {
            serviceDispatcher: new RepositoryServiceDispatcher(
              currentRepositoryInfo
            ),
          },
          { root: true }
        );

        if (currentRepositoryInfo.isRemote) {
          const localTestResultId = this.$store.state.operationHistory
            .testResultInfo.id;

          this.uploadHistory(
            { localId: localTestResultId, remoteId: remoteTestResultId },
            async (testResultId: string) => {
              await this.$store.dispatch("operationHistory/resume", {
                testResultId,
              });
            }
          );
        }
      } catch (error) {
        this.errorMessage = `${error.message}`;
        this.errorMessageDialogOpened = true;
      }
    })();
  }

  private uploadHistory(
    testResult: { localId: string; remoteId?: string },
    postOperation: (testResultId: string) => Promise<void>
  ): void {
    this.confirmDialogTitle = this.$store.getters.message("common.confirm");
    this.confirmDialogMessage = this.$store.getters.message(
      "remote-access.register-confirm"
    );

    this.confirmDialogAccept = () => {
      this.confirmDialogOpened = false;

      (async () => {
        try {
          this.$store.dispatch("openProgressDialog", {
            message: this.$store.getters.message(
              "remote-access.registering-testresults"
            ),
          });

          const newTestResultId = await this.$store
            .dispatch("operationHistory/uploadTestResultsToRemote", {
              localTestResultId: testResult.localId,
              remoteTestResultId: testResult.remoteId,
            })
            .finally(() => {
              this.$store.dispatch("closeProgressDialog");
            });

          await postOperation(newTestResultId);

          this.deleteLocalTestResult(testResult.localId);
        } catch (error) {
          this.errorMessage = this.$store.getters.message(
            "remote-access.registering-testresults-error"
          );
          this.errorMessageDialogOpened = true;
        }
      })();
    };

    this.confirmDialogOpened = true;
  }

  private deleteLocalTestResult(testResultId: string): void {
    this.confirmDialogTitle = this.$store.getters.message("common.confirm");
    this.confirmDialogMessage = this.$store.getters.message(
      "remote-access.delete-warning"
    );

    this.confirmDialogAccept = async () => {
      this.confirmDialogOpened = false;

      try {
        this.$store.dispatch("openProgressDialog", {
          message: this.$store.getters.message(
            "remote-access.delete-testresults"
          ),
        });

        await this.$store
          .dispatch("operationHistory/deleteLocalTestResult", {
            testResultId,
          })
          .finally(() => {
            this.$store.dispatch("closeProgressDialog");
          });

        this.informationMessageDialogOpened = true;
        this.informationTitle = this.$store.getters.message("common.confirm");
        this.informationMessage = this.$store.getters.message(
          "remote-access.register-delete-succeeded"
        );
      } catch (error) {
        this.errorMessage = this.$store.getters.message(
          "remote-access.delete-error"
        );
        this.errorMessageDialogOpened = true;
      }
    };

    this.confirmDialogOpened = true;
  }

  private resetHistory(): void {
    this.$store.dispatch("operationHistory/resetHistory");
    this.nowTime = "00:00:00";
  }

  private endCapture(): void {
    this.$store.dispatch("captureControl/endCapture");
  }

  private async resume(testResultId: string) {
    if (!testResultId) {
      return;
    }

    setTimeout(async () => {
      try {
        this.$store.dispatch("openProgressDialog", {
          message: this.$store.getters.message("remote-access.load"),
        });

        await this.$store.dispatch("operationHistory/resume", { testResultId });
        const history = this.$store.getters["operationHistory/getHistory"]();
        const readResultData = await this.$store.dispatch(
          "operationHistory/getTestResult",
          {
            testResultId,
          }
        );
        const testingTime = calculateElapsedEpochMillis(
          readResultData?.startTimeStamp ?? 0,
          history
        );
        this.nowTime = formatTime(testingTime);
      } catch (error) {
        this.errorMessage = `${error.message}`;
        this.errorMessageDialogOpened = true;
      } finally {
        this.$store.dispatch("closeProgressDialog");
      }
    }, 300);
  }

  private openNoteEditDialog(
    noteType: string,
    sequence: number,
    index?: number
  ) {
    const historyItem: OperationWithNotes = this.$store.getters[
      "operationHistory/findHistoryItem"
    ](sequence);
    if (historyItem === undefined) {
      return;
    }
    switch (noteType) {
      case "intention":
        this.$store.commit("operationHistory/selectOperationNote", {
          selectedOperationNote: {
            sequence: sequence ?? null,
            index: index ?? null,
          },
        });
        this.intentionEditDialogOpened = true;
        return;
      case "bug":
        this.$store.commit("operationHistory/selectOperationNote", {
          selectedOperationNote: {
            sequence: sequence ?? null,
            index: index ?? null,
          },
        });
        this.bugEditDialogOpened = true;
        return;
      case "notice":
        this.$store.commit("operationHistory/selectOperationNote", {
          selectedOperationNote: {
            sequence: sequence ?? null,
            index: index ?? null,
          },
        });
        this.noticeEditDialogOpened = true;
        return;
      default:
        return;
    }
  }

  private deleteNote(noteType: string, sequence: number, index: number) {
    switch (noteType) {
      case "intention":
        this.$store.dispatch("operationHistory/deleteIntention", { sequence });
        return;
      case "bug":
        this.$store.dispatch("operationHistory/deleteBug", { sequence, index });
        return;
      case "notice":
        this.$store.dispatch("operationHistory/deleteNotice", {
          sequence,
          index,
        });
        return;
      default:
        return;
    }
  }

  private browserBack(): void {
    this.$store.dispatch("captureControl/browserBack");
  }

  private browserForward(): void {
    this.$store.dispatch("captureControl/browserForward");
  }

  private onAcceptWindowSelector(): void {
    (async () => {
      this.$store.dispatch("captureControl/switchCapturingWindow", {
        to: this.capturingWindowInfo.currentWindow,
      });
    })();
  }

  private onCancelWindowSelector(): void {
    (async () => {
      this.$store.dispatch("captureControl/switchCancel");
    })();
  }

  private openWindowSelector(): void {
    this.$store.dispatch("captureControl/selectCapturingWindow");
    this.capturingWindowInfo.currentWindow = this.$store.state.captureControl.capturingWindowInfo.currentWindow;
    this.capturingWindowInfo.availableWindows.splice(
      0,
      this.capturingWindowInfo.availableWindows.length,
      ...this.$store.state.captureControl.capturingWindowInfo.availableWindows
    );
    this.windowSelectorOpened = true;
  }

  private startRemoteConnection(targetUrl: string) {
    (async () => {
      this.$store.dispatch("openProgressDialog", {
        message: this.$store.getters.message(
          "remote-access.connecting-remote-url"
        ),
      });

      const url = await this.$store
        .dispatch("connectRemoteUrl", {
          targetUrl,
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.$store.dispatch("closeProgressDialog");
        });

      if (url) {
        await this.$store.dispatch("loadLocaleFromSettings");
        await this.$store.dispatch("operationHistory/readSettings");

        this.resetHistory();

        this.informationMessageDialogOpened = true;
        this.informationTitle = this.$store.getters.message("common.confirm");
        this.informationMessage = this.$store.getters.message(
          "remote-access.connect-remote-url-succeeded",
          {
            url,
          }
        );
        this.remoteUrl = url;
      } else {
        this.errorMessage = this.$store.getters.message(
          "remote-access.connect-remote-url-error"
        );
        this.errorMessageDialogOpened = true;
      }
    })();
  }

  private get currentRepositoryUrl(): string {
    return this.$store.state.repositoryServiceDispatcher.serviceUrl;
  }

  private get repositoryUrls(): string[] {
    const localUrl = this.$store.state.localRepositoryServiceUrl;
    const remoteUrls = this.$store.state.remoteRepositoryUrls;
    return [localUrl, ...remoteUrls];
  }
}
</script>

<style lang="sass" scoped>
a
  text-decoration: none

html
  overflow: hidden
</style>

<style lang="sass">
#windowHandlesSelectedBox
  max-height: 50px !important
</style>
