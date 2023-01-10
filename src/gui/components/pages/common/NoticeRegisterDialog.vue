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
    <notice-common-dialog
      :opened="opened"
      :noteInfo="noteInfo"
      @close="close()"
    />
  </div>
</template>

<script lang="ts">
import { NoteDialogInfo } from "@/lib/operationHistory/types";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import NoticeCommonDialog from "./NoticeCommonDialog.vue";

@Component({
  components: {
    "notice-common-dialog": NoticeCommonDialog,
  },
})
export default class NoticeRegisterDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private noteInfo: NoteDialogInfo = {
    value: "",
    details: "",
    index: null,
    tags: [],
    imageFilePath: "",
    sequence: 1,
    maxSequence: 1,
  };

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }
    const { sequence } =
      this.$store.state.operationHistory.selectedOperationNote;

    this.noteInfo = {
      value: "",
      details: "",
      index: null,
      tags: [],
      imageFilePath:
        this.$store.state.operationHistory.history[sequence - 1].operation
          .imageFilePath ?? "",
      sequence: sequence,
      maxSequence: this.$store.state.operationHistory.history.length,
    };
  }

  private close(): void {
    this.$emit("close");
  }
}
</script>
