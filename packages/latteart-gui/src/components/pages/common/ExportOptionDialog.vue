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
    :title="$store.getters.message('import-export-dialog.project-export-title')"
    @accept="
      execute();
      close();
    "
    @cancel="close()"
    :acceptButtonDisabled="okButtonIsDisabled"
  >
    <template>
      <export-option v-if="isOptionDisplayed" @update="updateOption" />
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import ExportOption from "./ExportOption.vue";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
    "export-option": ExportOption,
  },
})
export default class ExportOptionDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private isOptionDisplayed: boolean = false;

  private option = {
    selectedOptionProject: true,
    selectedOptionTestresult: true,
    selectedOptionConfig: true,
  };

  private get okButtonIsDisabled() {
    return (
      !this.option.selectedOptionProject &&
      !this.option.selectedOptionTestresult &&
      !this.option.selectedOptionConfig
    );
  }

  private updateOption(option: {
    selectedOptionProject: boolean;
    selectedOptionTestresult: boolean;
    selectedOptionConfig: boolean;
  }) {
    this.option = option;
  }

  private execute(): void {
    this.$emit("execute", this.option);
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
