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
    <v-btn
      :disabled="!isCapturing"
      color="green"
      :dark="isCapturing"
      @click="open"
      fab
      small
      :title="$store.getters.message('app.record-note')"
      class="mx-2"
    >
      <v-icon>add_comment</v-icon>
    </v-btn>

    <take-not-with-purpose-dialog
      :opened="takeNoteWithPurposeDialogOpened"
      @close="takeNoteWithPurposeDialogOpened = false"
    />
    <take-note-dialog
      :opened="takeNoteDialogOpened"
      @close="takeNoteDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import TakeNoteWithPurposeDialog from "@/components/pages/common/TakeNoteWithPurposeDialog.vue";
import TakeNoteDialog from "@/components/pages/common/TakeNoteDialog.vue";

@Component({
  components: {
    "take-not-with-purpose-dialog": TakeNoteWithPurposeDialog,
    "take-note-dialog": TakeNoteDialog,
  },
})
export default class NoteRegisterButton extends Vue {
  private takeNoteWithPurposeDialogOpened = false;
  private takeNoteDialogOpened = false;

  private get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  private open() {
    const sequence = this.$store.state.operationHistory.history.length;
    this.$store.commit("operationHistory/selectOperation", { sequence });
    this.$store.commit("operationHistory/selectOperationNote", {
      selectedOperationNote: { sequence, index: null },
    });
    if (this.$store.state.captureControl.testOption.shouldRecordTestPurpose) {
      this.takeNoteWithPurposeDialogOpened = true;
    } else {
      this.takeNoteDialogOpened = true;
    }
  }
}
</script>
