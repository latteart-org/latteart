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
      $store.getters.message("optional-features.project-import.title")
    }}</v-card-title>

    <v-card-text>
      <import-option @update="updateOption" />
    </v-card-text>

    <v-card-actions>
      <v-btn
        :disabled="disabled"
        :dark="!disabled"
        color="primary"
        @click="importData"
        >{{
          $store.getters.message(
            "optional-features.project-import.execute-button"
          )
        }}</v-btn
      >
    </v-card-actions>

    <information-message-dialog
      :opened="informationMessageDialogOpened"
      :title="informationTitle"
      :message="informationMessage"
      @close="informationMessageDialogOpened = false"
    />

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </v-card>
</template>

<script lang="ts">
import ErrorMessageDialog from "@/components/pages/common/ErrorMessageDialog.vue";
import ImportOption from "@/components/pages/common/ImportOption.vue";
import InformationMessageDialog from "@/components/pages/common/InformationMessageDialog.vue";
import { loadFileAsBase64 } from "@/lib/common/util";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    "information-message-dialog": InformationMessageDialog,
    "error-message-dialog": ErrorMessageDialog,
    "import-option": ImportOption,
  },
})
export default class ProjectImportLauncher extends Vue {
  private informationMessageDialogOpened = false;
  private informationTitle = "";
  private informationMessage = "";
  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private option: {
    selectedOptionProject: boolean;
    selectedOptionTestresult: boolean;
    selectedOptionConfig: boolean;
    targetFile: File | null;
  } = {
    selectedOptionProject: true,
    selectedOptionTestresult: true,
    selectedOptionConfig: true,
    targetFile: null,
  };

  private get disabled() {
    if (!this.option.targetFile) {
      return true;
    }

    if (
      !this.option.selectedOptionProject &&
      !this.option.selectedOptionTestresult &&
      !this.option.selectedOptionConfig
    ) {
      return true;
    }

    return false;
  }

  private updateOption(option: {
    selectedOptionProject: boolean;
    selectedOptionTestresult: boolean;
    selectedOptionConfig: boolean;
    targetFile: File | null;
  }) {
    this.option = option;
  }

  private importData(): void {
    if (!this.option.targetFile) {
      return;
    }

    this.$store.dispatch("openProgressDialog", {
      message: this.$store.getters.message(
        "import-export-dialog.importing-data"
      ),
    });

    const targetFile = this.option.targetFile;
    const option = {
      selectedOptionProject: this.option.selectedOptionProject,
      selectedOptionTestresult: this.option.selectedOptionTestresult,
      selectedOptionConfig: this.option.selectedOptionConfig,
    };

    setTimeout(async () => {
      try {
        const projectFile = await loadFileAsBase64(targetFile);

        const source = { projectFile };
        const { projectId, config } = await this.$store.dispatch(
          "testManagement/importData",
          { source, option }
        );

        if (projectId) {
          await this.$store.dispatch("testManagement/readProject");
        }
        if (config) {
          this.$store.commit(
            "setProjectSettings",
            { settings: config },
            { root: true }
          );
        }

        this.informationMessageDialogOpened = true;
        this.informationTitle = this.$store.getters.message(
          "import-export-dialog.project-import-title"
        );
        this.informationMessage = this.$store.getters.message(
          "import-export-dialog.import-data-succeeded",
          {
            returnName: projectFile.name,
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
      }
    }, 300);
  }
}
</script>
