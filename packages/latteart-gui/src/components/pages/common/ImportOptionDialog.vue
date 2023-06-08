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
  <execute-dialog
    :opened="opened"
    :title="$store.getters.message('import-export-dialog.project-import-title')"
    @accept="
      execute();
      close();
    "
    @cancel="close()"
    :acceptButtonDisabled="okButtonIsDisabled"
  >
    <template>
      <v-container fluid id="import-option-dialog">
        <v-row>
          <v-col cols="12">
            {{
              $store.getters.message(
                "import-export-dialog.select-project-file-label"
              )
            }}
          </v-col>

          <v-col cols="12" class="pl-2 pr-2 pt-2">
            <select-file-button
              accept=".zip"
              :details-message="targetFile ? targetFile.name : ''"
              @select="selectImportFile"
            >
              {{
                $store.getters.message(
                  "import-export-dialog.select-project-file-button"
                )
              }}
            </select-file-button>
          </v-col>

          <v-col class="pt-3">
            <v-checkbox
              :label="
                $store.getters.message('import-export-dialog.project-data')
              "
              v-model="importOption.selectedOptionProject"
            />
            <v-checkbox
              :label="
                $store.getters.message('import-export-dialog.testresult-data')
              "
              v-model="importOption.selectedOptionTestresult"
            />
            <v-checkbox
              :label="
                $store.getters.message('import-export-dialog.config-data')
              "
              v-model="importOption.selectedOptionConfig"
            />
          </v-col>
        </v-row>
      </v-container>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { loadFileAsBase64 } from "@/lib/common/util";
import SelectFileButton from "@/components/molecules/SelectFileButton.vue";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
    "select-file-button": SelectFileButton,
  },
})
export default class ImportOptionDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private importOption = {
    selectedOptionProject: true,
    selectedOptionTestresult: true,
    selectedOptionConfig: true,
  };

  private targetFile: File | null = null;

  private get okButtonIsDisabled() {
    if (!this.targetFile) {
      return true;
    }

    if (
      !this.importOption.selectedOptionProject &&
      !this.importOption.selectedOptionTestresult &&
      !this.importOption.selectedOptionConfig
    ) {
      return true;
    }

    return false;
  }

  @Watch("opened")
  private initialize() {
    if (this.opened) {
      this.targetFile = null;
      this.importOption.selectedOptionProject = true;
      this.importOption.selectedOptionTestresult = true;
      this.importOption.selectedOptionConfig = true;
    }
  }

  private selectImportFile(targetFile: File): void {
    this.targetFile = targetFile;
  }

  private execute(): void {
    if (!this.targetFile) {
      return;
    }

    (async (targetFile, importOption) => {
      const file = await loadFileAsBase64(targetFile);

      this.$emit("execute", file, importOption);

      this.close();
    })(this.targetFile, this.importOption);
  }

  private close(): void {
    this.$emit("close");
  }
}
</script>

<style lang="sass">
#import-option-dialog
  .v-text-field__details
    display: none

  .v-input--selection-controls
    margin-top: 0px

  .v-messages
    display: none

  .v-text-field
    padding-top: 0px
</style>
