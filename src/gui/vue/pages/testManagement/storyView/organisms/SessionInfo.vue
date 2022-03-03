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
  <v-container fluid class="pt-0" v-if="session">
    <v-card class="ma-2" color="blue-grey lighten-4">
      <v-card-title>{{
        $store.getters.message("session-info.charter")
      }}</v-card-title>

      <v-form>
        <v-card-text class="pt-0">
          <v-text-field
            class="pt-0"
            :label="this.$store.getters.message('session-info.test-item')"
            :value="session.testItem"
            @change="(value) => updateSession({ testItem: value })"
            :disabled="isViewerMode"
          ></v-text-field>
          <v-text-field
            class="pt-0"
            :label="this.$store.getters.message('session-info.tester-name')"
            :value="session.testerName"
            @change="(value) => updateSession({ testerName: value })"
            :disabled="isViewerMode"
          ></v-text-field>
          <v-text-field
            class="pt-0"
            :label="this.$store.getters.message('session-info.memo')"
            :value="session.memo"
            @change="(value) => updateSession({ memo: value })"
            :disabled="isViewerMode"
          ></v-text-field>
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
        <v-layout row wrap>
          <v-flex xs6>
            <v-card class="ma-2">
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
                      millisecondsToHHmmss(session.testingTime)
                    }})
                    <v-btn
                      class="mr-0"
                      flat
                      icon
                      v-if="!isViewerMode"
                      @click="reload()"
                      ><v-icon>refresh</v-icon></v-btn
                    >
                    <v-btn
                      flat
                      icon
                      color="error"
                      v-if="!isViewerMode"
                      @click="openConfirmDialogToDeleteTestResultFile(file.id)"
                      ><v-icon>delete</v-icon></v-btn
                    >
                  </li>
                </ul>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  v-if="!isViewerMode"
                  @click="openCaptureTool(session.testResultFiles)"
                  id="openCaptureToolButton"
                  >{{
                    $store.getters.message("session-info.start-capture-tool")
                  }}</v-btn
                >
                <v-btn
                  v-if="!isViewerMode"
                  @click="openTestResultSelectionDialog"
                  id="resultLogFileInputButton"
                  >{{ $store.getters.message("session-info.import") }}</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-flex>

          <v-flex xs6>
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
                      flat
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
          </v-flex>
        </v-layout>

        <v-layout row wrap>
          <v-flex xs12>
            <v-card class="ma-2">
              <v-card-title>{{
                $store.getters.message("session-info.test")
              }}</v-card-title>

              <v-card-text class="py-0">
                <v-list>
                  <v-list-group
                    v-for="(item, index) in session.intentions"
                    v-model="item.active"
                    :key="item.title"
                    value="true"
                    sub-group
                    :id="`testPurposeArea${index}`"
                  >
                    <v-list-tile slot="activator">
                      <v-list-tile-content>
                        <v-list-tile-title
                          ><span :title="item.value">{{
                            item.value
                          }}</span></v-list-tile-title
                        >
                      </v-list-tile-content>
                    </v-list-tile>
                    <v-layout>
                      <p class="break-word pl-5 break-word">
                        {{ item.details }}
                      </p>
                    </v-layout>
                  </v-list-group>
                </v-list>
              </v-card-text>

              <v-card-actions></v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>

        <v-layout row wrap>
          <v-flex xs12>
            <v-card class="ma-2">
              <v-card-title>{{
                $store.getters.message("session-info.notice")
              }}</v-card-title>

              <v-card-text class="py-0">
                <v-data-table
                  :items="testResultNotices"
                  :headers="testResultNoticeHeaders"
                  hide-actions
                >
                  <template v-slot:items="props">
                    <td class="px-2 py-0">
                      <v-select
                        v-bind:value="props.item.status"
                        item-text="text"
                        item-value="value"
                        @change="
                          (value) =>
                            updateIssue(props.item.source, { status: value })
                        "
                        :placeholder="
                          $store.getters.message('session-info.bug-status')
                        "
                        :items="issueOptions"
                        :disabled="true"
                      ></v-select>
                    </td>

                    <td class="px-2 py-0 ellipsis_short">
                      <span :title="props.item.value">{{
                        props.item.value
                      }}</span>
                    </td>

                    <td class="px-2 py-0">
                      <v-btn
                        small
                        :title="props.item.details"
                        @click="
                          openIssueDetailsDialog(
                            props.item.status,
                            props.item.ticketId,
                            props.item.value,
                            props.item.details
                          )
                        "
                        >{{
                          $store.getters.message("session-info.bug-details")
                        }}</v-btn
                      >
                    </td>
                  </template>
                </v-data-table>
              </v-card-text>

              <v-card-actions></v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-card>

    <v-dialog v-model="attachedFileOpened">
      <v-card>
        <v-img :src="attachedImageFileSource" />
      </v-card>
    </v-dialog>

    <scrollable-dialog :opened="issueDetailsDialogOpened">
      <template v-slot:title>{{
        $store.getters.message("session-info.bug-details")
      }}</template>

      <template v-slot:content>
        <v-list class="note-details-dialog">
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>{{
                $store.getters.message("session-info.bug-status")
              }}</v-list-tile-title>
              <p class="break-all">{{ issueDetailsDialogStatus }}</p>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>{{
                $store.getters.message("session-info.summary")
              }}</v-list-tile-title>
              <p class="break-all">{{ issueDetailsDialogSummary }}</p>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>{{
                $store.getters.message("session-info.details")
              }}</v-list-tile-title>
              <p class="break-all pre-wrap">{{ issueDetailsDialogText }}</p>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </template>

      <template v-slot:footer>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat @click="issueDetailsDialogOpened = false">{{
          $store.getters.message("common.close")
        }}</v-btn>
      </template>
    </scrollable-dialog>

    <scrollable-dialog :opened="testResultSelectionDialogOpened">
      <template v-slot:title>{{
        $store.getters.message("session-info.result-list")
      }}</template>

      <template v-slot:content>
        <v-layout
          row
          wrap
          v-for="testResult in testResults"
          :key="testResult.id"
        >
          <v-flex xs9>{{ testResult.name }}</v-flex>
          <v-flex xs3
            ><v-btn @click="importTestResult(testResult)">{{
              $store.getters.message("session-info.result-import")
            }}</v-btn></v-flex
          >
        </v-layout>
      </template>

      <template v-slot:footer>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          flat
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
  Issue,
} from "@/lib/testManagement/types";
import * as SessionInfoService from "@/lib/testManagement/SessionInfo";
import ScrollableDialog from "@/vue/molecules/ScrollableDialog.vue";
import ErrorMessageDialog from "@/vue/pages/common/ErrorMessageDialog.vue";
import ConfirmDialog from "@/vue/pages/common/ConfirmDialog.vue";
import { formatTime } from "@/lib/common/Timestamp";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
    "error-message-dialog": ErrorMessageDialog,
    "confirm-dialog": ConfirmDialog,
  },
})
export default class SessionInfo extends Vue {
  @Prop({ type: String, default: "" }) public readonly storyId!: string;
  @Prop({ type: String, default: "" }) public readonly sessionId!: string;

  private reportSectionDisplayed = false;

  private testResultSelectionDialogOpened = false;
  private testResults: {
    name: string;
    id: string;
  }[] = [];

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private confirmDialogOpened = false;
  private confirmDialogTitle = "";
  private confirmDialogMessage = "";
  private confirmDialogAccept() {
    /* Do nothing */
  }

  private issueDetailsDialogOpened = false;
  private issueDetailsDialogStatus = "";
  private issueDetailsDialogTicketId = "";
  private issueDetailsDialogSummary = "";
  private issueDetailsDialogText = "";

  private attachedFileOpened = false;
  private attachedImageFileSource = "";

  private issueOptions = [
    {
      text: this.$store.getters.message("session-info.bug-reported"),
      value: "reported",
    },
    {
      text: this.$store.getters.message("session-info.bug-unreported"),
      value: "invalid",
    },
  ];

  private testResultBugHeaders = [
    {
      text: this.$store.getters.message("session-info.bug-status"),
      width: "160",
      sortable: false,
      align: "center",
    },

    {
      text: this.$store.getters.message("session-info.summary"),
      sortable: false,
      align: "center",
    },
    {
      text: this.$store.getters.message("session-info.details"),
      sortable: false,
      width: "40px",
      align: "center",
    },
  ];

  private testResultNoticeHeaders = this.testResultBugHeaders;

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
        ? `${this.$store.state.repositoryServiceDispatcher.serviceUrl}/${file.fileUrl}`
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
      ? `${this.$store.state.repositoryServiceDispatcher.serviceUrl}/${file.fileUrl}`
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
    await this.$store.dispatch("testManagement/readDataFile");
  }

  private async importTestResult(testResult: TestResultFile): Promise<void> {
    this.testResultSelectionDialogOpened = false;
    this.$store.dispatch("openProgressDialog", {
      message: this.$store.getters.message("session-info.import-test-result"),
    });

    await this.updateSession({ testResultFiles: [testResult] }).finally(() => {
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
      "common.delete-warning"
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
    issues?: Issue[];
    testingTime?: number;
  }) {
    await this.$store.dispatch("testManagement/updateSession", {
      storyId: this.storyId,
      sessionId: this.sessionId,
      params,
    });
  }

  private get testResultNotices(): Issue[] {
    if (!this.session) {
      return [];
    }
    return this.session.issues;
  }

  private updateIssue(
    source: { type: string; sequence: number; index: number },
    params: {
      status?: string;
      ticketId?: string;
    }
  ) {
    const newIssues = this.session?.issues.map((issue) => {
      const key1 = `${issue.source.type}_${issue.source.sequence}_${issue.source.index}`;
      const key2 = `${source.type}_${source.sequence}_${source.index}`;

      if (key1 !== key2) {
        return issue;
      }

      return {
        source,
        status: params.status ?? issue.status,
        ticketId: params.ticketId ?? issue.ticketId,
        value: issue.value,
        details: issue.details,
      };
    });

    this.updateSession({
      issues: newIssues,
    });
  }

  private openIssueDetailsDialog(
    status: string,
    ticketId: string,
    summary: string,
    text: string
  ) {
    const none = this.$store.getters.message("session-info.none") as string;

    this.issueDetailsDialogStatus =
      status === "reported"
        ? this.$store.getters.message("session-info.bug-reported")
        : status === "invalid"
        ? this.$store.getters.message("session-info.bug-unreported")
        : none;
    this.issueDetailsDialogTicketId = ticketId !== "" ? ticketId : none;
    this.issueDetailsDialogSummary = summary;
    this.issueDetailsDialogText = text;
    this.issueDetailsDialogOpened = true;
  }

  private async openCaptureTool(testResultFiles: TestResultFile[]) {
    const origin = location.origin;
    const captureClUrl = this.$store.state.clientSideCaptureServiceDispatcher
      .serviceUrl;
    const localRepositoryUrl = this.$store.state.localRepositoryServiceUrl;
    const repositoryUrl = this.$store.state.repositoryServiceDispatcher
      .serviceUrl;
    const url = `${origin}/capture/config/?capture=${captureClUrl}&repository=${localRepositoryUrl}&remoteRepository=${repositoryUrl}`;

    if (testResultFiles.length > 0) {
      const testResultId = testResultFiles[0].id;
      window.open(`${url}&testResultId=${testResultId}`, "_blank");
    } else {
      await this.$store.dispatch("operationHistory/createTestResult", {
        initialUrl: "",
        name: "",
      });

      const newTestResult = this.$store.state.operationHistory.testResultInfo;

      this.importTestResult({ id: newTestResult.id, name: newTestResult.name });

      window.open(`${url}&testResultId=${newTestResult.id}`, "_blank");
    }
  }
}
</script>

<style lang="sass" scoped>
.pre-wrap
  white-space: pre-wrap
.break-all
  word-break: break-all
</style>
<style lang="sass">
.note-details-dialog
  .v-list__tile
    font-size: 12px
    height: auto
    padding: 4px 16px
  .v-list__tile__title
    font-size: 12px
    height: auto
    line-height: normal
  .break-all
    font-size: 12px
</style>
