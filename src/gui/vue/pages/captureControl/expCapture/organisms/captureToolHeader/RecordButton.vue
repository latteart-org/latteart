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
  <div>
    <v-btn
      v-if="!isCapturing"
      :disabled="isDisabled"
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

    <test-option-dialog
      :opened="testOptionDialogOpened"
      @close="testOptionDialogOpened = false"
      @ok="startCapture"
    />

    <window-selector-dialog
      :opened="windowSelectorOpened"
      @close="windowSelectorOpened = false"
    >
    </window-selector-dialog>

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

    <information-message-dialog
      :opened="informationMessageDialogOpened"
      :title="informationTitle"
      :message="informationMessage"
      @close="informationMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { CaptureConfig } from "@/lib/captureControl/CaptureConfig";
import ErrorMessageDialog from "@/vue/pages/common/ErrorMessageDialog.vue";
import TestOptionDialog from "../../../testOptionDialog/TestOptionDialog.vue";
import InformationMessageDialog from "../../../../common/InformationMessageDialog.vue";
import ConfirmDialog from "../../../../common/ConfirmDialog.vue";
import { TimestampImpl } from "@/lib/common/Timestamp";
import WindowSelectorDialog from "../WindowSelectorDialog.vue";
import {
  RepositoryContainer,
  RepositoryContainerImpl,
} from "@/lib/eventDispatcher/RepositoryContainer";

@Component({
  components: {
    "test-option-dialog": TestOptionDialog,
    "error-message-dialog": ErrorMessageDialog,
    "information-message-dialog": InformationMessageDialog,
    "confirm-dialog": ConfirmDialog,
    "window-selector-dialog": WindowSelectorDialog,
  },
})
export default class RecordButton extends Vue {
  private testOptionDialogOpened = false;
  private errorMessageDialogOpened = false;
  private errorMessage = "";
  private confirmDialogOpened = false;
  private confirmDialogTitle = "";
  private confirmDialogMessage = "";
  private confirmDialogAccept() {
    /* Do nothing */
  }
  private windowSelectorOpened = false;

  private informationMessageDialogOpened = false;
  private informationTitle = "";
  private informationMessage = "";

  private get testResultName(): string {
    return this.$store.state.operationHistory.testResultInfo.name;
  }

  private get url(): string {
    return this.$store.state.captureControl.url;
  }

  private set url(value: string) {
    this.$store.commit("captureControl/setUrl", { url: value });
  }

  private get config(): CaptureConfig {
    return this.$store.state.operationHistory.config;
  }

  private get isDisabled(): boolean {
    return !this.url || this.isReplaying || this.isResuming || !this.urlIsValid;
  }

  private get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  private get isReplaying(): boolean {
    return this.$store.state.captureControl.isReplaying;
  }

  private get isResuming(): boolean {
    return this.$store.state.captureControl.isResuming;
  }

  private get urlIsValid(): boolean {
    return this.$store.getters["captureControl/urlIsValid"]();
  }

  private startCapture(): void {
    this.goToHistoryView();

    (async () => {
      try {
        const currentRepositoryInfo = (() => {
          const currentRepository: RepositoryContainer =
            this.$store.state.repositoryContainer;

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
          "setRepositoryContainer",
          {
            repositoryContainer: new RepositoryContainerImpl({
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
          callbacks: {
            onChangeNumberOfWindows: () => {
              this.windowSelectorOpened = true;
            },
          },
        });

        // switch to before repository
        this.$store.commit(
          "setRepositoryContainer",
          {
            repositoryContainer: new RepositoryContainerImpl(
              currentRepositoryInfo
            ),
          },
          { root: true }
        );

        if (currentRepositoryInfo.isRemote) {
          const localTestResultId =
            this.$store.state.operationHistory.testResultInfo.id;

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
        if (error instanceof Error) {
          this.errorMessage = `${error.message}`;
          this.errorMessageDialogOpened = true;
        } else {
          throw error;
        }
      }
    })();
  }

  private endCapture(): void {
    this.$store.dispatch("captureControl/endCapture");
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

  private goToHistoryView() {
    this.$router.push({ path: "history" }).catch((err: Error) => {
      if (err.name !== "NavigationDuplicated") {
        throw err;
      }
    });
  }
}
</script>
