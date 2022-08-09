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
    <v-toolbar color="latteart-main" dark tabs height="40" class="no-print">
      <v-toolbar-title height="40">{{
        $store.getters.message("manage-header.tool-name")
      }}</v-toolbar-title>
      <template v-slot:extension>
        <v-layout row>
          <v-flex>
            <v-layout row>
              <v-tabs v-model="tabNum" color="latteart-main" align-with-title>
                <v-tabs-slider color="yellow"></v-tabs-slider>
                <v-tab
                  id="manageShowViewButton"
                  @click="toOtherManagePage('manageShowView')"
                  >{{ $store.getters.message("manage-header.top") }}</v-tab
                >
                <v-tab
                  id="manageProgressViewButton"
                  :disabled="!isTestMatrixSelected"
                  @click="toOtherManagePage('manageProgressView')"
                  >{{
                    $store.getters.message("manage-header.manage-progress")
                  }}</v-tab
                >
                <v-tab
                  id="manageQualityViewButton"
                  :disabled="!isTestMatrixSelected"
                  @click="toOtherManagePage('manageQualityView')"
                  >{{
                    $store.getters.message("manage-header.manage-quality")
                  }}</v-tab
                >
              </v-tabs>
              <v-btn
                v-if="!isViewerMode"
                id="editPlanButton"
                color="primary"
                @click="toManageEdit"
                >{{ $store.getters.message("manage-header.edit-plan") }}</v-btn
              >
              <v-btn
                v-if="!isViewerMode"
                id="viewerConfigButton"
                color="primary"
                @click="toViewerConfig"
                >{{
                  $store.getters.message("manage-header.capture-config")
                }}</v-btn
              >
              <v-menu offset-y>
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-if="!isViewerMode"
                    id="optionMenuButton"
                    color="primary"
                    dark
                    @click="getOptionMenuList"
                    v-on="on"
                    >{{
                      $store.getters.message("manage-header.optional-function")
                    }}</v-btn
                  >
                </template>
                <v-list>
                  <v-list-tile
                    v-for="(menu, index) in optionMenuList"
                    :key="index"
                    @click="getMenuMethod(menu.method)"
                  >
                    <v-list-tile-title>{{ menu.title }}</v-list-tile-title>
                  </v-list-tile>
                </v-list>
              </v-menu>
            </v-layout>
          </v-flex>
          <v-flex xs1 pl-3 v-if="!isViewerMode">
            <v-select
              hide-details
              :label="$store.getters.message('manage-header.locale')"
              :items="locales"
              :value="initLocale"
              v-on:change="changeLocale"
            ></v-select>
          </v-flex>
          <v-flex xs2 pl-3 v-if="!isViewerMode">
            <remote-access-field
              color="primary"
              hide-details
            ></remote-access-field
          ></v-flex>
        </v-layout>
      </template>
    </v-toolbar>
    <router-view @selectTestMatrix="changeMatrixId"></router-view>
    <download-link-dialog
      :opened="downloadLinkDialogOpened"
      :title="downloadLinkDialogTitle"
      :message="downloadLinkDialogMessage"
      :alertMessage="downloadLinkDialogAlertMessage"
      :linkUrl="downloadLinkDialogLinkUrl"
      @close="downloadLinkDialogOpened = false"
    />
    <script-generation-option-dialog
      :opened="scriptGenerationOptionDialogIsOpened"
      @execute="generateTestScript"
      @close="scriptGenerationOptionDialogIsOpened = false"
    >
    </script-generation-option-dialog>
    <import-option-dialog
      :opened="importOptionDialogIsOpened"
      @execute="importData"
      @close="importOptionDialogIsOpened = false"
    >
    </import-option-dialog>
    <information-message-dialog
      :opened="informationMessageDialogOpened"
      :title="informationTitle"
      :message="informationMessage"
      @close="informationMessageDialogOpened = false"
    />
    <export-option-dialog
      :opened="exportOptionDialogIsOpened"
      @execute="exportData"
      @close="exportOptionDialogIsOpened = false"
    >
    </export-option-dialog>
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ErrorMessageDialog from "@/vue/pages/common/ErrorMessageDialog.vue";
import ScriptGenerationOptionDialog from "@/vue/pages/common/ScriptGenerationOptionDialog.vue";
import DownloadLinkDialog from "../common/DownloadLinkDialog.vue";
import ImportOptionDialog from "../common/ImportOptionDialog.vue";
import ExportOptionDialog from "../common/ExportOptionDialog.vue";
import InformationMessageDialog from "../common/InformationMessageDialog.vue";
import RemoteAccessField from "@/vue/pages/common/organisms/RemoteAccessField.vue";

@Component({
  components: {
    "download-link-dialog": DownloadLinkDialog,
    "error-message-dialog": ErrorMessageDialog,
    "script-generation-option-dialog": ScriptGenerationOptionDialog,
    "import-option-dialog": ImportOptionDialog,
    "export-option-dialog": ExportOptionDialog,
    "information-message-dialog": InformationMessageDialog,
    "remote-access-field": RemoteAccessField,
  },
})
export default class ManageView extends Vue {
  public get initLocale(): string {
    return this.$store.getters.getLocale();
  }
  public isViewerMode = (this as any).$isViewerMode
    ? (this as any).$isViewerMode
    : false;
  public outputHtmlProcessing = false;
  public exportDataProcessing = false;
  public importDataProcessing = false;
  public tabNum = 0;
  public locales: string[] = ["ja", "en"];

  private isGeneratingTestScripts = false;
  private scriptGenerationOptionDialogIsOpened = false;
  private importOptionDialogIsOpened = false;
  private exportOptionDialogIsOpened = false;

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private downloadLinkDialogOpened = false;
  private downloadLinkDialogTitle = "";
  private downloadLinkDialogMessage = "";
  private downloadLinkDialogAlertMessage = "";
  private downloadLinkDialogLinkUrl = "";

  private informationMessageDialogOpened = false;
  private informationTitle = "";
  private informationMessage = "";

  private selectedTestMatrixId = "";

  private optionMenuList: Array<{
    title: string;
    method: string;
    isEnabled: boolean;
  }> = [];
  private remoteUrl = "";

  private get hasAnyTestMatrix(): boolean {
    return this.$store.state.testManagement.testMatrices.length > 0;
  }

  private get isTestMatrixSelected(): boolean {
    return this.selectedTestMatrixId !== "";
  }

  public toManageEdit(): void {
    this.$router.push({ name: "manageEditView" });
  }

  public changeLocale(locale: string): void {
    this.$store.dispatch("changeLocale", { locale });
  }

  private toOtherManagePage(pageName: string) {
    this.$router
      .push({
        name: pageName,
        params: { testMatrixId: this.selectedTestMatrixId },
      })
      .catch((err: Error) => {
        if (err.name !== "NavigationDuplicated") {
          throw err;
        }
      });
  }

  private outputHtml() {
    if (this.outputHtmlProcessing) {
      return;
    }

    (async () => {
      this.outputHtmlProcessing = true;
      this.$store.dispatch("openProgressDialog", {
        message: this.$store.getters.message("manage-header.creating-snapshot"),
      });

      try {
        const snapshotUrl = await this.$store.dispatch(
          "testManagement/writeSnapshot"
        );

        this.downloadLinkDialogOpened = true;
        this.downloadLinkDialogTitle = this.$store.getters.message(
          "manage-header.output-html"
        );
        this.downloadLinkDialogMessage = this.$store.getters.message(
          "manage.print-html-succeeded"
        );
        this.downloadLinkDialogAlertMessage = "";
        this.downloadLinkDialogLinkUrl = `${this.currentRepositoryUrl}/${snapshotUrl}`;
      } catch (error) {
        if (error instanceof Error) {
          this.errorMessage = error.message;
          this.errorMessageDialogOpened = true;
        } else {
          throw error;
        }
      } finally {
        this.outputHtmlProcessing = false;
        this.$store.dispatch("closeProgressDialog");
      }
    })();
  }

  private toViewerConfig() {
    this.$store.commit("operationHistory/setDefaultDisplayExclusionList");
    this.$store.commit("openConfigViewer");
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

      const testScriptInfo = await this.$store
        .dispatch("testManagement/generateAllSessionTestScripts", {
          option,
        })
        .catch((error) => {
          console.error(error);
          this.errorMessage = error.message;
        })
        .finally(() => {
          this.$store.dispatch("closeProgressDialog");
        });

      if (testScriptInfo.outputUrl) {
        this.downloadLinkDialogTitle =
          this.$store.getters.message("common.confirm");
        this.downloadLinkDialogMessage = this.$store.getters.message(
          "manage-header.generate-script-succeeded"
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
      } else {
        this.scriptGenerationOptionDialogIsOpened = false;
        this.errorMessageDialogOpened = true;
      }
      this.isGeneratingTestScripts = false;
    })();
  }

  private importData(
    projectImportFile: { data: string; name: string },
    option: {
      selectedOptionProject: boolean;
      selectedOptionTestresult: boolean;
    }
  ): void {
    this.importDataProcessing = true;
    this.$store.dispatch("openProgressDialog", {
      message: this.$store.getters.message(
        "import-export-dialog.importing-data"
      ),
    });

    setTimeout(async () => {
      try {
        const source = { projectFile: projectImportFile };
        const { projectId } = await this.$store.dispatch(
          "testManagement/importData",
          { source, option }
        );

        if (projectId) {
          await this.$store.dispatch("testManagement/readDataFile");
        }

        this.informationMessageDialogOpened = true;
        this.informationTitle = this.$store.getters.message(
          "import-export-dialog.project-import-title"
        );
        this.informationMessage = this.$store.getters.message(
          "import-export-dialog.import-data-succeeded",
          {
            returnName: projectImportFile.name,
          }
        );
      } catch (error) {
        if (error instanceof Error) {
          this.errorMessage = error.message;
          this.errorMessageDialogOpened = true;
        } else {
          throw error;
        }
      } finally {
        this.$store.dispatch("closeProgressDialog");
        this.importDataProcessing = false;
      }
    }, 300);
  }

  private exportData(option: {
    selectedOptionProject: boolean;
    selectedOptionTestresult: boolean;
  }) {
    (async () => {
      this.exportDataProcessing = true;
      this.$store.dispatch("openProgressDialog", {
        message: this.$store.getters.message(
          "import-export-dialog.creating-export-data"
        ),
      });

      try {
        const exportDataUrl = await this.$store.dispatch(
          "testManagement/exportData",
          { option }
        );

        this.downloadLinkDialogOpened = true;
        this.downloadLinkDialogTitle = this.$store.getters.message(
          "import-export-dialog.project-export-title"
        );
        this.downloadLinkDialogMessage = this.$store.getters.message(
          "import-export-dialog.create-export-data-succeeded"
        );
        this.downloadLinkDialogAlertMessage = "";
        this.downloadLinkDialogLinkUrl = `${this.currentRepositoryUrl}/${exportDataUrl}`;
      } catch (error) {
        if (error instanceof Error) {
          this.errorMessage = error.message;
          this.errorMessageDialogOpened = true;
        } else {
          throw error;
        }
      } finally {
        this.exportDataProcessing = false;
        this.$store.dispatch("closeProgressDialog");
      }
    })();
  }

  private anySessionHasHistory(): boolean {
    return this.$store.getters["testManagement/anySessionHasHistory"]();
  }

  private changeMatrixId(testMatrixId: string): void {
    this.selectedTestMatrixId = testMatrixId;
  }

  private getMenuMethod(method: string) {
    if (method === "outputHtml") {
      this.outputHtml();
    }
    if (method === "scriptGenerate") {
      this.scriptGenerationOptionDialogIsOpened = true;
    }
    if (method === "import") {
      this.importOptionDialogIsOpened = true;
    }
    if (method === "export") {
      this.exportOptionDialogIsOpened = true;
    }
  }

  private getOptionMenuList() {
    const optionMenus = [
      {
        title: this.$store.getters.message("manage-header.output-html"),
        method: "outputHtml",
        isEnabled: this.hasAnyTestMatrix,
      },
      {
        title: this.$store.getters.message("manage-header.generate-script"),
        method: "scriptGenerate",
        isEnabled: this.anySessionHasHistory(),
      },
      {
        title: this.$store.getters.message("manage-header.import-option"),
        method: "import",
        isEnabled: true,
      },
      {
        title: this.$store.getters.message("manage-header.export-option"),
        method: "export",
        isEnabled: true,
      },
    ];
    this.optionMenuList = [...optionMenus.filter((menu) => menu.isEnabled)];
  }

  private get currentRepositoryUrl() {
    return this.$store.state.repositoryContainer.serviceUrl;
  }
}
</script>

<style lang="sass" scoped>
@media print
  .no-print
    display: none
</style>
