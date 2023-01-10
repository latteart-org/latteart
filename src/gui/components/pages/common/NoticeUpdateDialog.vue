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
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import NoticeCommonDialog from "./NoticeCommonDialog.vue";
import {
  NoteDialogInfo,
  OperationWithNotes,
} from "@/lib/operationHistory/types";

@Component({
  components: {
    "notice-common-dialog": NoticeCommonDialog,
  },
})
export default class NoticeUpdateDialog extends Vue {
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

    const { sequence, index } =
      this.$store.state.operationHistory.selectedOperationNote;
    const historyItem: OperationWithNotes =
      this.$store.getters["operationHistory/findHistoryItem"](sequence);

    if (historyItem.notices && historyItem.notices[index]) {
      this.noteInfo = {
        value: historyItem.notices[index].value,
        details: historyItem.notices[index].details,
        index: index,
        tags: historyItem.notices[index].tags,
        imageFilePath:
          historyItem.notices[index].imageFilePath !== ""
            ? historyItem.notices[index].imageFilePath
            : historyItem.operation.imageFilePath,
        sequence: sequence,
        maxSequence: this.$store.state.operationHistory.history.length,
      };
    }
  }

  private close(): void {
    this.$emit("close");
  }
}
</script>
