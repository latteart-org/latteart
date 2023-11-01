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
  <v-card flat class="pa-2">
    <v-card-title>{{
      $store.getters.message("optional-features.test-script-generation.title")
    }}</v-card-title>

    <v-card-text>
      <script-generation-option @update="updateOption" />
    </v-card-text>
    <v-card-actions>
      <v-btn
        :disabled="disabled"
        :dark="!disabled"
        color="primary"
        @click="generateTestScript"
        >{{
          $store.getters.message(
            "optional-features.test-script-generation.execute-button"
          )
        }}</v-btn
      >
    </v-card-actions>

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
  </v-card>
</template>

<script lang="ts">
import DownloadLinkDialog from "@/components/molecules/DownloadLinkDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import ScriptGenerationOption from "@/components/organisms/common/ScriptGenerationOption.vue";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    "download-link-dialog": DownloadLinkDialog,
    "error-message-dialog": ErrorMessageDialog,
    "script-generation-option": ScriptGenerationOption,
  },
})
export default class TestScriptGenerationLauncher extends Vue {
  private downloadLinkDialogOpened = false;
  private downloadLinkDialogTitle = "";
  private downloadLinkDialogMessage = "";
  private downloadLinkDialogAlertMessage = "";
  private downloadLinkDialogLinkUrl = "";
  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private option: {
    testScript: {
      isSimple: boolean;
      useMultiLocator: boolean;
    };
    testData: {
      useDataDriven: boolean;
      maxGeneration: number;
    };
    buttonDefinitions: {
      tagname: string;
      attribute?: { name: string; value: string };
    }[];
  } = {
    testScript: {
      isSimple: false,
      useMultiLocator: false,
    },
    testData: {
      useDataDriven: false,
      maxGeneration: 0,
    },
    buttonDefinitions: [],
  };

  private updateOption(option: {
    testScript: {
      isSimple: boolean;
      useMultiLocator: boolean;
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
    this.option = option;
  }

  private generateTestScript() {
    (async () => {
      try {
        this.$store.dispatch("openProgressDialog", {
          message: this.$store.getters.message(
            "manage-header.generating-test-script"
          ),
        });
        const testScriptInfo = await this.$store.dispatch(
          "testManagement/generateAllSessionTestScripts",
          {
            option: this.option,
          }
        );
        this.$store.dispatch("closeProgressDialog");
        this.downloadLinkDialogTitle =
          this.$store.getters.message("common.confirm");
        this.downloadLinkDialogMessage = this.$store.getters.message(
          "test-result-page.generate-testscript-succeeded"
        );
        if (testScriptInfo.invalidOperationTypeExists) {
          this.downloadLinkDialogAlertMessage = this.$store.getters.message(
            "test-result-page.generate-alert-info"
          );
        } else {
          this.downloadLinkDialogAlertMessage = "";
        }
        this.downloadLinkDialogLinkUrl = `${this.currentRepositoryUrl}/${testScriptInfo.outputUrl}`;
        this.downloadLinkDialogOpened = true;
      } catch (error) {
        if (error instanceof Error) {
          this.errorMessage = error.message;
          this.errorMessageDialogOpened = true;
        } else {
          throw error;
        }
      } finally {
        this.$store.dispatch("closeProgressDialog");
      }
    })();
  }

  private get currentRepositoryUrl() {
    return this.$store.state.repositoryService.serviceUrl;
  }

  private get disabled() {
    return !this.hasAnySessionHistory;
  }

  private get hasAnySessionHistory(): boolean {
    return this.$store.getters["testManagement/anySessionHasHistory"]();
  }
}
</script>

<style lang="sass">
#max-test-data-generation
  .v-text-field__details
    display: none

  .v-input--selection-controls
    margin-top: 0px

  .v-messages
    display: none
</style>
