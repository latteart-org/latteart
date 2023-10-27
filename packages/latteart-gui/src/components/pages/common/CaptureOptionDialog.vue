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
    :title="$store.getters.message('start-capture-view.title')"
    @accept="
      execute();
      close();
    "
    @cancel="close()"
  >
    <template>
      <capture-option v-if="isOptionDisplayed" @update="updateOption" />
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { CaptureOptionParams } from "@/lib/common/captureOptionParams";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import CaptureOption from "./CaptureOption.vue";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
    "capture-option": CaptureOption,
  },
})
export default class CaptureOptionDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened?: boolean;

  private isOptionDisplayed: boolean = false;

  private captureOption: CaptureOptionParams = {
    url: "",
    testResultName: "",
    platform: "PC",
    device: { deviceName: "", modelNumber: "", osVersion: "" },
    waitTimeForStartupReload: 0,
    browser: "Chrome",
    mediaType: "image",
    shouldRecordTestPurpose: false,
    firstTestPurpose: "",
    firstTestPurposeDetails: "",
  };

  private updateOption(option: CaptureOptionParams) {
    this.captureOption = option;
  }

  private execute(): void {
    this.$emit("execute", this.captureOption);
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
