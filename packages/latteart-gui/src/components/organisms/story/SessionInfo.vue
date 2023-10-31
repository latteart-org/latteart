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
  <v-container fluid class="pt-0" v-if="session">
    <v-card class="ma-2" color="blue-grey lighten-4">
      <v-card-title>{{
        $store.getters.message("session-info.charter")
      }}</v-card-title>

      <v-form>
        <v-card-text class="pt-0">
          <v-text-field
            class="pt-0"
            :label="this.$store.getters.message('session-info.tester-name')"
            :value="session.testerName"
            @change="(value) => updateSession({ testerName: value })"
            :readonly="isViewerMode"
          ></v-text-field>
          <v-textarea
            class="pt-0"
            :label="this.$store.getters.message('session-info.memo')"
            :value="memo"
            @change="(value) => updateSession({ memo: value, testItem: '' })"
            :readonly="isViewerMode"
          ></v-textarea>
        </v-card-text>
      </v-form>
    </v-card>

    <v-card class="ma-2" color="blue-grey lighten-4">
      <v-card-title class="pb-0">{{
        $store.getters.message("session-info.report")
      }}</v-card-title>

      <v-card-text
        v-show="!reportSectionDisplayed"
        jastify="center"
        class="pa-2"
      >
        <v-progress-circular size="50" color="primary" indeterminate />
      </v-card-text>

      <v-card-text v-show="reportSectionDisplayed" class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-card class="ma-2" :disabled="isCapturing || isReplaying">
              <v-card-title>{{
                $store.getters.message("session-info.model")
              }}</v-card-title>

              <v-card-text class="py-0">
                <ul
                  v-for="(file, index) in session.testResultFiles"
                  :key="index"
                >
                  <li>
                    <span class="break-all">{{ file.name }}</span> ({{
                      millisecondsToHHmmss(file.testingTime)
                    }})

                    <test-result-load-trigger :testResultIds="[file.id]">
                      <template v-slot:activator="{ on }">
                        <v-btn
                          text
                          icon
                          v-if="!isViewerMode"
                          :title="
                            $store.getters.message(
                              'session-info.open-test-result'
                            )
                          "
                          @click="openCaptureTool(on)"
                          ><v-icon>launch</v-icon></v-btn
                        >
                      </template>
                    </test-result-load-trigger>

                    <v-btn
                      class="mr-0"
                      text
                      icon
                      v-if="!isViewerMode"
                      :title="
                        $store.getters.message(
                          'session-info.update-test-results-title'
                        )
                      "
                      @click="reload()"
                      ><v-icon>refresh</v-icon></v-btn
                    >

                    <v-btn
                      text
                      icon
                      color="error"
                      v-if="!isViewerMode"
                      :title="
                        $store.getters.message(
                          'session-info.remove-test-results-title'
                        )
                      "
                      @click="openConfirmDialogToDeleteTestResultFile(file.id)"
                      ><v-icon>delete</v-icon></v-btn
                    >
                  </li>
                </ul>
              </v-card-text>

              <v-card-actions>
                <v-row dense justify="end">
                  <v-col cols="auto">
                    <record-start-trigger v-if="!isViewerMode">
                      <template v-slot:activator="{ on }">
                        <v-btn
                          id="openCaptureToolButton"
                          @click="openCaptureOptionDialog"
                          >{{
                            $store.getters.message("session-info.start-capture")
                          }}</v-btn
                        >

                        <capture-option-dialog
                          :opened="captureOptionDialogOpened"
                          @execute="(option) => startCapture(on, option)"
                          @close="captureOptionDialogOpened = false"
                        >
                        </capture-option-dialog>
                      </template>
                    </record-start-trigger>
                  </v-col>
                  <v-col cols="auto">
                    <v-btn
                      v-if="!isViewerMode"
                      @click="openTestResultSelectionDialog"
                      id="resultLogFileInputButton"
                      >{{
                        $store.getters.message("session-info.import")
                      }}</v-btn
                    >
                  </v-col>
                </v-row>
              </v-card-actions>
            </v-card>
          </v-col>

          <v-col cols="6">
            <v-card class="ma-2">
              <v-card-title>{{
                $store.getters.message("session-info.file")
              }}</v-card-title>

              <v-card-text class="py-0">
                <ul v-for="(file, index) in session.attachedFiles" :key="index">
                  <li v-if="isViewerMode">
                    <a :href="file.fileUrl" target="_blank" rel="noopener"
                      ><span class="break-all">{{ file.name }}</span></a
                    >
                  </li>
                  <li v-else>
                    <a @click="openAttachedFile(file)"
                      ><span class="break-all">{{ file.name }}</span></a
                    >
                    <v-btn
                      text
                      icon
                      color="error"
                      @click="
                        openConfirmDialogToDeleteAttachedFile(file.fileUrl)
                      "
                      ><v-icon>delete</v-icon></v-btn
                    >
                  </li>
                </ul>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  v-if="!isViewerMode"
                  @click="$refs.attachedFile.click()"
                  >{{ $store.getters.message("session-info.add-file") }}</v-btn
                >
                <input
                  type="file"
                  style="display: none"
                  ref="attachedFile"
                  @change="addAttachedFile"
                />
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <test-purpose-note-list
              :testPurposes="session.testPurposes"
              :testResult="session.testResultFiles"
              @reload="reload()"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-dialog v-model="attachedFileOpened">
      <v-card>
        <v-img :src="attachedImageFileSource" />
      </v-card>
    </v-dialog>

    <scrollable-dialog :opened="testResultSelectionDialogOpened">
      <template v-slot:title>{{
        $store.getters.message("session-info.result-list")
      }}</template>

      <template v-slot:content>
        <test-result-list
          :items="unrelatedTestResults"
          @click-item="addTestResultToSession"
        />
      </template>

      <template v-slot:footer>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="testResultSelectionDialogOpened = false"
          >{{ $store.getters.message("common.close") }}</v-btn
        >
      </template>
    </scrollable-dialog>

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :onAccept="confirmDialogAccept"
      @close="confirmDialogOpened = false"
    />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import {
  Session,
  AttachedFile,
  TestResultFile,
} from "@/lib/testManagement/types";
import * as SessionInfoService from "@/lib/testManagement/SessionInfo";
import ScrollableDialog from "@/components/molecules/ScrollableDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import ConfirmDialog from "@/components/molecules/ConfirmDialog.vue";
import { formatTime } from "@/lib/common/Timestamp";
import { TestResultSummary } from "@/lib/operationHistory/types";
import TestPurposeNoteList from "./TestPurposeNoteList.vue";
import TestResultList from "./TestResultList.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import { CaptureControlState } from "@/store/captureControl";
import { RootState } from "@/store";
import CaptureOptionDialog from "./CaptureOptionDialog.vue";
import RecordStartTrigger from "@/components/organisms/common/RecordStartTrigger.vue";
import { CaptureOptionParams } from "@/lib/common/captureOptionParams";
import TestResultLoadTrigger from "@/components/organisms/common/TestResultLoadTrigger.vue";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
    "error-message-dialog": ErrorMessageDialog,
    "confirm-dialog": ConfirmDialog,
    "test-purpose-note-list": TestPurposeNoteList,
    "test-result-list": TestResultList,
    "record-start-trigger": RecordStartTrigger,
    "capture-option-dialog": CaptureOptionDialog,
    "test-result-load-trigger": TestResultLoadTrigger,
  },
})
export default class SessionInfo extends Vue {
  @Prop({ type: String, default: "" }) public readonly storyId!: string;
  @Prop({ type: String, default: "" }) public readonly sessionId!: string;

  private reportSectionDisplayed = false;

  private captureOptionDialogOpened = false;

  private testResultSelectionDialogOpened = false;
  private testResults: TestResultSummary[] = [];

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private confirmDialogOpened = false;
  private confirmDialogTitle = "";
  private confirmDialogMessage = "";
  private confirmDialogAccept() {
    /* Do nothing */
  }

  private attachedFileOpened = false;
  private attachedImageFileSource = "";

  private isViewerMode = (this as any).$isViewerMode
    ? (this as any).$isViewerMode
    : false;

  async created(): Promise<void> {
    this.reportSectionDisplayed = true;
  }

  private get session(): Session | undefined {
    return this.$store.getters["testManagement/findSession"](
      this.storyId,
      this.sessionId
    );
  }

  private get unrelatedTestResults(): TestResultSummary[] {
    const relatedTestResultIds =
      this.session?.testResultFiles.map((testResult) => testResult.id) ?? [];
    return this.testResults.filter(
      (testResult) => !relatedTestResultIds.includes(testResult.id)
    );
  }

  private openCaptureOptionDialog() {
    this.captureOptionDialogOpened = true;
  }

  private async openTestResultSelectionDialog() {
    this.$store.dispatch("openProgressDialog", {
      message: this.$store.getters.message("session-info.call-test-results"),
    });
    try {
      this.testResults = await this.$store.dispatch(
        "testManagement/getTestResults"
      );
    } finally {
      this.$store.dispatch("closeProgressDialog");
    }

    this.testResultSelectionDialogOpened = true;
  }

  private openAttachedFile(file: AttachedFile): boolean {
    const extension = SessionInfoService.getImageExtensionFrom(file.name);
    if (!file.fileUrl && !file.fileData) {
      this.errorMessage = this.$store.getters.message(
        "session-info.file-open-read-error"
      );
      this.errorMessageDialogOpened = true;
      return false;
    }

    if (extension !== "") {
      const source = file.fileUrl
        ? `${this.$store.state.repositoryService.serviceUrl}/${file.fileUrl}`
        : `data:image/${extension};base64, ${file.fileData}`;
      if (source === "") {
        return false;
      }
      this.attachedImageFileSource = source;
      this.attachedFileOpened = true;
      return true;
    }

    // no extention
    const a = document.createElement("a");
    a.href = file.fileUrl
      ? `${this.$store.state.repositoryService.serviceUrl}/${file.fileUrl}`
      : (`data:text/plain;base64,${file.fileData}` as string);
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
    return false;
  }

  private addAttachedFile(event: any): void {
    const filename = event.target.files[0].name;
    const srcFilepath = event.target.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(srcFilepath);

    event.target.value = "";

    reader.onload = () => {
      const result = reader.result ? reader.result.toString() : "";
      const keyword = "base64,";
      const fileData = result.substring(
        result.indexOf(keyword) + keyword.length
      );

      this.updateSession({
        attachedFiles: [
          ...(this.session?.attachedFiles ?? []),
          {
            name: filename,
            fileData,
          },
        ],
      });
    };
  }

  private async reload() {
    await this.$store.dispatch("testManagement/readStory", {
      storyId: this.storyId,
    });
  }

  private async addTestResultToSession(
    testResult: TestResultFile
  ): Promise<void> {
    this.testResultSelectionDialogOpened = false;
    this.$store.dispatch("openProgressDialog", {
      message: this.$store.getters.message("session-info.import-test-result"),
    });

    const testResultFiles = [...(this.session?.testResultFiles ?? [])];

    await this.updateSession({
      testResultFiles: [...testResultFiles, testResult],
    }).finally(() => {
      this.$store.dispatch("closeProgressDialog");
    });
  }

  private openConfirmDialogToDeleteAttachedFile(
    attachedFileUrl: string,
    event?: any
  ) {
    if (event) {
      event.stopPropagation();
    }

    this.confirmDialogTitle = this.$store.getters.message(
      "session-info.delete-attached-file-confirm"
    );
    this.confirmDialogMessage = this.$store.getters.message(
      "common.delete-warning"
    );
    this.confirmDialogAccept = () => {
      this.updateSession({
        attachedFiles: this.session?.attachedFiles.filter((attachedFile) => {
          return attachedFile.fileUrl !== attachedFileUrl;
        }),
      });

      this.confirmDialogOpened = false;
    };

    this.confirmDialogOpened = true;
  }

  private openConfirmDialogToDeleteTestResultFile(
    testResultId: string,
    event?: any
  ) {
    if (event) {
      event.stopPropagation();
    }

    this.confirmDialogTitle = this.$store.getters.message(
      "session-info.delete-test-result-confirm"
    );
    this.confirmDialogMessage = this.$store.getters.message(
      "session-info.delete-test-result-confirm-message"
    );
    this.confirmDialogAccept = () => {
      this.updateSession({
        testResultFiles: this.session?.testResultFiles?.filter(
          (testResultFile) => {
            return testResultFile.id !== testResultId;
          }
        ),
      });

      this.confirmDialogOpened = false;
    };

    this.confirmDialogOpened = true;
  }

  private millisecondsToHHmmss(millisecondsTime: number) {
    return formatTime(millisecondsTime);
  }

  private async updateSession(params: {
    isDone?: boolean;
    testItem?: string;
    testerName?: string;
    memo?: string;
    attachedFiles?: AttachedFile[];
    testResultFiles?: TestResultFile[];
  }) {
    await this.$store.dispatch("testManagement/updateSession", {
      storyId: this.storyId,
      sessionId: this.sessionId,
      params,
    });
  }

  private async openCaptureTool(loadTestResults: () => Promise<void>) {
    await loadTestResults();

    this.$router.push({ path: "/capture/history" }).catch((err: Error) => {
      if (err.name !== "NavigationDuplicated") {
        throw err;
      }
    });
  }

  private async startCapture(
    onStart: () => Promise<void>,
    option: CaptureOptionParams
  ) {
    this.$store.commit("captureControl/setUrl", {
      url: option.url,
    });
    this.$store.commit("captureControl/setTestResultName", {
      name: option.testResultName,
    });
    await this.$store.dispatch("writeDeviceSettings", {
      config: {
        platformName: option.platform,
        device: option.device,
        browser: option.browser,
        waitTimeForStartupReload: option.waitTimeForStartupReload,
      },
    });
    const config = (this.$store.state as RootState).projectSettings.config;
    await this.$store.dispatch("writeConfig", {
      config: {
        ...config,
        captureMediaSetting: {
          ...config.captureMediaSetting,
          mediaType: option.mediaType,
        },
      },
    });
    this.$store.commit("captureControl/setTestOption", {
      testOption: {
        firstTestPurpose: option.firstTestPurpose,
        firstTestPurposeDetails: option.firstTestPurposeDetails,
        shouldRecordTestPurpose: option.shouldRecordTestPurpose,
      },
    });

    await this.$store.dispatch("operationHistory/createTestResult", {
      initialUrl: option.url,
      name: option.testResultName,
    });

    const newTestResult = (
      this.$store.state.operationHistory as OperationHistoryState
    ).testResultInfo;

    this.addTestResultToSession({
      id: newTestResult.id,
      name: option.testResultName,
      initialUrl: option.url,
      testingTime: 0,
    });

    await this.loadTestResultForCapture(newTestResult.id);

    await onStart();
  }

  private async loadTestResultForCapture(testResultId: string) {
    await this.$store.dispatch("operationHistory/loadTestResultSummaries", {
      testResultIds: [testResultId],
    });

    await this.$store.dispatch("operationHistory/loadTestResult", {
      testResultId,
    });

    this.$store.commit("operationHistory/setCanUpdateModels", {
      setCanUpdateModels: false,
    });
  }

  private get memo(): string {
    const testItems = this.session?.testItem
      ? [`Test Item: ${this.session.testItem}`]
      : [];
    const memos = this.session?.memo ? [this.session.memo] : [];
    return [...testItems, ...memos].join("\n");
  }

  private get isCapturing() {
    return (this.$store.state.captureControl as CaptureControlState)
      .isCapturing;
  }

  private get isReplaying() {
    return (this.$store.state.captureControl as CaptureControlState)
      .isReplaying;
  }
}
</script>

<style lang="sass" scoped>
.pre-wrap
  white-space: pre-wrap
.break-all
  word-break: break-all
</style>
