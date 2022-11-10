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
  <execute-dialog
    :opened="opened"
    :title="$store.getters.message('config-io.import-config')"
    @accept="
      execute();
      close();
    "
    @cancel="close()"
    :acceptButtonDisabled="okButtonIsDisabled"
  >
    <template>
      <v-container class="px-0 pt-0 pb-0" fluid id="import-option-dialog">
        <v-layout column>
          <v-flex xs12>
            {{ $store.getters.message("config-io.select-config-file") }}
          </v-flex>

          <v-flex xs12 class="pl-2 pr-2 pt-2">
            <select-file-button
              accept=".json"
              :details-message="targetFile ? targetFile.name : ''"
              @select="selectImportFile"
            >
              {{
                $store.getters.message(
                  "import-export-dialog.select-test-result-file-button"
                )
              }}
            </select-file-button>
          </v-flex>
        </v-layout>
      </v-container>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { loadFileAsText } from "@/lib/common/util";
import SelectFileButton from "@/vue/molecules/SelectFileButton.vue";
import ExecuteDialog from "@/vue/molecules/ExecuteDialog.vue";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
    "select-file-button": SelectFileButton,
  },
})
export default class ConfigImportDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private targetFile: File | null = null;

  private get okButtonIsDisabled() {
    return !this.targetFile;
  }

  @Watch("opened")
  private initialize() {
    if (this.opened) {
      this.targetFile = null;
    }
  }

  private selectImportFile(targetFile: File): void {
    this.targetFile = targetFile;
  }

  private execute(): void {
    if (!this.targetFile) {
      return;
    }

    (async (targetFile) => {
      const configText = await loadFileAsText(targetFile);
      await this.$store.dispatch("operationHistory/setSettings", {
        settings: JSON.parse(configText),
      });
      this.$emit("execute");

      this.close();
    })(this.targetFile);
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
