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
      <import-option v-if="isOptionDisplayed" @update="updateOption" />
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { loadFileAsBase64 } from "@/lib/common/util";
import SelectFileButton from "@/components/molecules/SelectFileButton.vue";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import ImportOption from "./ImportOption.vue";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
    "select-file-button": SelectFileButton,
    "import-option": ImportOption,
  },
})
export default class ImportOptionDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private isOptionDisplayed: boolean = false;

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

  private get okButtonIsDisabled() {
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

  private execute(): void {
    if (!this.option.targetFile) {
      return;
    }

    (async (targetFile, option) => {
      const file = await loadFileAsBase64(targetFile);

      this.$emit("execute", file, option);
    })(this.option.targetFile, {
      selectedOptionProject: this.option.selectedOptionProject,
      selectedOptionTestresult: this.option.selectedOptionTestresult,
      selectedOptionConfig: this.option.selectedOptionConfig,
    });
  }

  private close(): void {
    this.$emit("close");
  }

  @Watch("opened")
  private rerenderOption() {
    if (this.opened) {
      this.isOptionDisplayed = false;
      this.$nextTick(() => {
        this.isOptionDisplayed = true;
      });
    }
  }
}
</script>
