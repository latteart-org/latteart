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
    <v-card class="ma-2" color="blue-grey-lighten-4">
      <v-card-title>{{ $t("session-info.charter") }}</v-card-title>

      <v-card-text class="pt-0">
        <v-text-field
          class="pt-0"
          :label="$t('session-info.tester-name')"
          :model-value="session.testerName"
          @update:model-value="(value) => updateSession({ testerName: value })"
          :readonly="isViewerMode"
        ></v-text-field>
        <v-textarea
          class="pt-0"
          :label="$t('session-info.memo')"
          :model-value="memo"
          @update:model-value="(value) => updateSession({ memo: value, testItem: '' })"
          :readonly="isViewerMode"
        ></v-textarea>
      </v-card-text>
    </v-card>

    <v-card class="ma-2" color="blue-grey-lighten-4">
      <v-card-title class="pb-0">{{ $t("session-info.report") }}</v-card-title>

      <v-card-text v-show="!reportSectionDisplayed" jastify="center" class="pa-2">
        <v-progress-circular size="50" color="primary" indeterminate />
      </v-card-text>

      <v-card-text v-show="reportSectionDisplayed" class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-card class="ma-2" :disabled="isCapturing || isReplaying">
              <v-card-title>{{ $t("session-info.model") }}</v-card-title>

              <v-card-text class="py-0 ml-4">
                <ul v-for="(file, index) in session.testResultFiles" :key="index">
                  <li>
                    <span class="break-all">{{ file.name }}</span> ({{
                      millisecondsToHHmmss(file.testingTime)
                    }})

                    <test-result-load-trigger :testResultIds="[file.id]">
                      <template v-slot:activator="{ on }">
                        <v-btn
                          variant="text"
                          icon
                          v-if="!isViewerMode"
                          :title="$t('session-info.open-test-result')"
                          @click="openCaptureTool(on)"
                          ><v-icon>launch</v-icon></v-btn
                        >
                      </template>
                    </test-result-load-trigger>

                    <v-btn
                      class="mr-0"
                      variant="text"
                      icon
                      v-if="!isViewerMode"
                      :title="$t('session-info.update-test-results-title')"
                      @click="reload()"
                      ><v-icon>refresh</v-icon></v-btn
                    >

                    <v-btn
                      variant="text"
                      icon
                      color="error"
                      v-if="!isViewerMode"
                      :title="$t('session-info.remove-test-results-title')"
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
                          variant="elevated"
                          id="openCaptureToolButton"
                          @click="openCaptureOptionDialog"
                          >{{ $t("session-info.start-capture") }}</v-btn
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
                      variant="elevated"
                      v-if="!isViewerMode"
                      @click="openTestResultSelectionDialog"
                      id="resultLogFileInputButton"
                      >{{ $t("session-info.import") }}</v-btn
                    >
                  </v-col>
                </v-row>
              </v-card-actions>
            </v-card>
          </v-col>

          <v-col cols="6">
            <v-card class="ma-2">
              <v-card-title>{{ $t("session-info.file") }}</v-card-title>

              <v-card-text class="py-0 ml-4">
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
                      variant="text"
                      icon
                      color="error"
                      @click="openConfirmDialogToDeleteAttachedFile(file.fileUrl)"
                      ><v-icon>delete</v-icon></v-btn
                    >
                  </li>
                </ul>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  variant="elevated"
                  v-if="!isViewerMode"
                  @click="($refs.attachedFile as HTMLInputElement).click()"
                  >{{ $t("session-info.add-file") }}</v-btn
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
      <template v-slot:title>{{ $t("session-info.result-list") }}</template>

      <template v-slot:content>
        <test-result-list :items="unrelatedTestResults" @click-item="addTestResultToSession" />
      </template>

      <template v-slot:footer>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="testResultSelectionDialogOpened = false">{{
          $t("common.close")
        }}</v-btn>
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
import type { Session, AttachedFile, TestResultFile } from "@/lib/testManagement/types";
import * as SessionInfoService from "@/lib/testManagement/SessionInfo";
import ScrollableDialog from "@/components/molecules/ScrollableDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import ConfirmDialog from "@/components/molecules/ConfirmDialog.vue";
import { formatTime } from "@/lib/common/Timestamp";
import { type TestResultSummary } from "@/lib/operationHistory/types";
import TestPurposeNoteList from "./TestPurposeNoteList.vue";
import TestResultList from "./TestResultList.vue";
import CaptureOptionDialog from "../dialog/CaptureOptionDialog.vue";
import RecordStartTrigger from "@/components/organisms/common/RecordStartTrigger.vue";
import { type CaptureOptionParams } from "@/lib/common/captureOptionParams";
import TestResultLoadTrigger from "@/components/organisms/common/TestResultLoadTrigger.vue";
import { computed, defineComponent, ref, inject } from "vue";
import { useRouter } from "vue-router";
import { useRootStore } from "@/stores/root";
import { useTestManagementStore } from "@/stores/testManagement";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";

export default defineComponent({
  props: {
    storyId: { type: String, default: "", required: true },
    sessionId: { type: String, default: "", required: true }
  },
  components: {
    "scrollable-dialog": ScrollableDialog,
    "error-message-dialog": ErrorMessageDialog,
    "confirm-dialog": ConfirmDialog,
    "test-purpose-note-list": TestPurposeNoteList,
    "test-result-list": TestResultList,
    "record-start-trigger": RecordStartTrigger,
    "capture-option-dialog": CaptureOptionDialog,
    "test-result-load-trigger": TestResultLoadTrigger
  },
  setup(props) {
    const rootStore = useRootStore();
    const testManagementStore = useTestManagementStore();
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();
    const router = useRouter();

    const reportSectionDisplayed = ref(false);

    const captureOptionDialogOpened = ref(false);

    const testResultSelectionDialogOpened = ref(false);
    const testResults = ref<TestResultSummary[]>([]);

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const confirmDialogOpened = ref(false);
    const confirmDialogTitle = ref("");
    const confirmDialogMessage = ref("");
    const confirmDialogAccept = ref(() => {
      /* Do nothing */
    });

    const attachedFileOpened = ref(false);
    const attachedImageFileSource = ref("");

    const isViewerMode: boolean = inject("isViewerMode") ?? false;

    const session = computed((): Session | undefined => {
      return testManagementStore.findSession(props.storyId, props.sessionId);
    });

    const unrelatedTestResults = computed((): TestResultSummary[] => {
      const relatedTestResultIds =
        session.value?.testResultFiles.map((testResult) => testResult.id) ?? [];
      return testResults.value.filter(
        (testResult) => !relatedTestResultIds.includes(testResult.id)
      );
    });

    const openCaptureOptionDialog = () => {
      captureOptionDialogOpened.value = true;
    };

    const openTestResultSelectionDialog = async () => {
      rootStore.openProgressDialog({
        message: rootStore.message("session-info.call-test-results")
      });
      try {
        testResults.value = await testManagementStore.getTestResults();
      } finally {
        rootStore.closeProgressDialog();
      }

      testResultSelectionDialogOpened.value = true;
    };

    const openAttachedFile = (file: AttachedFile): boolean => {
      const extension = SessionInfoService.getImageExtensionFrom(file.name);
      if (!file.fileUrl && !file.fileData) {
        errorMessage.value = rootStore.message("session-info.file-open-read-error");
        errorMessageDialogOpened.value = true;
        return false;
      }

      if (extension !== "") {
        const source = file.fileUrl
          ? `${rootStore.repositoryService?.serviceUrl}/${file.fileUrl}`
          : `data:image/${extension};base64, ${file.fileData}`;
        if (source === "") {
          return false;
        }
        attachedImageFileSource.value = source;
        attachedFileOpened.value = true;
        return true;
      }

      // no extention
      const a = document.createElement("a");
      a.href = file.fileUrl
        ? `${rootStore.repositoryService?.serviceUrl}/${file.fileUrl}`
        : (`data:text/plain;base64,${file.fileData}` as string);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
      return false;
    };

    const addAttachedFile = (event: any): void => {
      const filename = event.target.files[0].name;
      const srcFilepath = event.target.files[0];

      const reader = new FileReader();
      reader.readAsDataURL(srcFilepath);

      event.target.value = "";

      reader.onload = () => {
        const result = reader.result ? reader.result.toString() : "";
        const keyword = "base64,";
        const fileData = result.substring(result.indexOf(keyword) + keyword.length);

        updateSession({
          attachedFiles: [
            ...(session.value?.attachedFiles ?? []),
            {
              name: filename,
              fileData
            }
          ]
        });
      };
    };

    const reload = async () => {
      await testManagementStore.readStory({
        storyId: props.storyId
      });
    };

    const addTestResultToSession = async (testResult: TestResultFile): Promise<void> => {
      testResultSelectionDialogOpened.value = false;
      rootStore.openProgressDialog({
        message: rootStore.message("session-info.import-test-result")
      });

      const testResultFiles = [...(session.value?.testResultFiles ?? [])];

      await updateSession({
        testResultFiles: [...testResultFiles, testResult]
      }).finally(() => {
        rootStore.closeProgressDialog();
      });
    };

    const openConfirmDialogToDeleteAttachedFile = (attachedFileUrl: string, event?: any) => {
      if (event) {
        event.stopPropagation();
      }

      confirmDialogTitle.value = rootStore.message("session-info.delete-attached-file-confirm");
      confirmDialogMessage.value = rootStore.message("common.delete-warning");
      confirmDialogAccept.value = () => {
        updateSession({
          attachedFiles: session.value?.attachedFiles.filter((attachedFile) => {
            return attachedFile.fileUrl !== attachedFileUrl;
          })
        });

        confirmDialogOpened.value = false;
      };

      confirmDialogOpened.value = true;
    };

    const openConfirmDialogToDeleteTestResultFile = (testResultId: string, event?: any) => {
      if (event) {
        event.stopPropagation();
      }

      confirmDialogTitle.value = rootStore.message("session-info.delete-test-result-confirm");
      confirmDialogMessage.value = rootStore.message(
        "session-info.delete-test-result-confirm-message"
      );
      confirmDialogAccept.value = () => {
        updateSession({
          testResultFiles: session.value?.testResultFiles?.filter((testResultFile) => {
            return testResultFile.id !== testResultId;
          })
        });

        confirmDialogOpened.value = false;
      };

      confirmDialogOpened.value = true;
    };

    const millisecondsToHHmmss = (millisecondsTime: number) => {
      return formatTime(millisecondsTime);
    };

    const updateSession = async (params: {
      isDone?: boolean;
      testItem?: string;
      testerName?: string;
      memo?: string;
      attachedFiles?: AttachedFile[];
      testResultFiles?: TestResultFile[];
    }) => {
      await testManagementStore.updateSession({
        storyId: props.storyId,
        sessionId: props.sessionId,
        params
      });
    };

    const openCaptureTool = async (loadTestResults: () => Promise<void>) => {
      await loadTestResults();

      router.push({ path: "/test-result" }).catch((err: Error) => {
        if (err.name !== "NavigationDuplicated") {
          throw err;
        }
      });
    };

    const startCapture = async (onStart: () => Promise<void>, option: CaptureOptionParams) => {
      captureControlStore.url = option.url;
      captureControlStore.testResultName = option.testResultName;

      await rootStore.writeDeviceSettings({
        config: {
          platformName: option.platform,
          device: option.device,
          browser: option.browser,
          waitTimeForStartupReload: option.waitTimeForStartupReload
        }
      });
      const config = rootStore.projectSettings.config;
      await rootStore.writeConfig({
        config: {
          ...config,
          captureMediaSetting: {
            ...config.captureMediaSetting,
            mediaType: option.mediaType
          }
        }
      });
      captureControlStore.testOption = {
        firstTestPurpose: option.firstTestPurpose,
        firstTestPurposeDetails: option.firstTestPurposeDetails,
        shouldRecordTestPurpose: option.shouldRecordTestPurpose
      };

      await operationHistoryStore.createTestResult({
        initialUrl: option.url,
        name: option.testResultName
      });

      const newTestResult = operationHistoryStore.testResultInfo;

      addTestResultToSession({
        id: newTestResult.id,
        name: option.testResultName,
        initialUrl: option.url,
        testingTime: 0
      });

      await loadTestResultForCapture(newTestResult.id);

      await onStart();
    };

    const loadTestResultForCapture = async (testResultId: string) => {
      await operationHistoryStore.loadTestResultSummaries({
        testResultIds: [testResultId]
      });

      await operationHistoryStore.loadTestResult({
        testResultId
      });

      operationHistoryStore.canUpdateModels = false;
    };

    const memo = computed((): string => {
      const testItems = session.value?.testItem ? [`Test Item: ${session.value.testItem}`] : [];
      const memos = session.value?.memo ? [session.value.memo] : [];
      return [...testItems, ...memos].join("\n");
    });

    const isCapturing = computed(() => {
      return captureControlStore.isCapturing;
    });

    const isReplaying = computed(() => {
      return captureControlStore.isReplaying;
    });

    reportSectionDisplayed.value = true;

    return {
      t: rootStore.message,
      reportSectionDisplayed,
      captureOptionDialogOpened,
      testResultSelectionDialogOpened,
      errorMessageDialogOpened,
      errorMessage,
      confirmDialogOpened,
      confirmDialogTitle,
      confirmDialogMessage,
      confirmDialogAccept,
      attachedFileOpened,
      attachedImageFileSource,
      isViewerMode,
      session,
      unrelatedTestResults,
      openCaptureOptionDialog,
      openTestResultSelectionDialog,
      openAttachedFile,
      addAttachedFile,
      reload,
      addTestResultToSession,
      openConfirmDialogToDeleteAttachedFile,
      openConfirmDialogToDeleteTestResultFile,
      millisecondsToHHmmss,
      updateSession,
      openCaptureTool,
      startCapture,
      memo,
      isCapturing,
      isReplaying
    };
  }
});
</script>

<style lang="sass" scoped>
.pre-wrap
  white-space: pre-wrap
.break-all
  word-break: break-all
</style>
