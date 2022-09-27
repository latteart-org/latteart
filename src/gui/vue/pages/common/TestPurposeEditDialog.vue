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
    <scrollable-dialog :opened="opened">
      <template v-slot:title>{{
        $store.getters.message("app.record-intention")
      }}</template>
      <template v-slot:content>
        <number-field
          v-if="oldSequence !== null"
          :label="$store.getters.message('note-edit.target-sequence')"
          :value="newTargetSequence"
          :minValue="1"
          :maxValue="maxSequence"
          @updateNumberFieldValue="updateNewTargetSequence"
          :disabled="oldNote === ''"
        ></number-field>
        <v-text-field
          :label="$store.getters.message('note-edit.summary')"
          v-model="newNote"
        ></v-text-field>
        <v-textarea
          :label="$store.getters.message('note-edit.details')"
          v-model="newNoteDetails"
        ></v-textarea>
      </template>
      <template v-slot:footer>
        <v-icon v-if="isSaveWarning" color="red">error_outline</v-icon>
        <p v-if="isSaveWarning" class="warningMessage">
          {{ $store.getters.message("note-edit.save-warning") }}
        </p>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="!canSave"
          :dark="canSave"
          color="green"
          @click="
            saveTestPurpose();
            close();
          "
          >{{ $store.getters.message("common.ok") }}</v-btn
        >
        <v-btn
          @click="
            cancel();
            close();
          "
          >{{ $store.getters.message("common.cancel") }}</v-btn
        >
      </template>
    </scrollable-dialog>
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { NoteEditInfo } from "@/lib/captureControl/types";
import { OperationWithNotes } from "@/lib/operationHistory/types";
import NumberField from "@/vue/molecules/NumberField.vue";
import ScrollableDialog from "@/vue/molecules/ScrollableDialog.vue";
import ErrorMessageDialog from "@/vue/pages/common/ErrorMessageDialog.vue";

@Component({
  components: {
    "number-field": NumberField,
    "scrollable-dialog": ScrollableDialog,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class TestPurposeEditDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private oldNote = "";
  private oldNoteDetails = "";
  private newNote = "";
  private newNoteDetails = "";
  private oldSequence: number | null = null;
  private newTargetSequence: number | null = null;
  private maxSequence: number | null = null;
  private oldIndex: number | null = null;

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private isSaveWarning = false;

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }

    const { sequence } =
      this.$store.state.operationHistory.selectedOperationNote;
    const historyItem: OperationWithNotes =
      this.$store.getters["operationHistory/findHistoryItem"](sequence);

    if (!historyItem || !historyItem.intention) {
      // new note
      this.oldNote = "";
      this.oldNoteDetails = "";
      this.oldIndex = null;
    } else {
      // update note
      this.oldNote = historyItem.intention.value;
      this.oldNoteDetails = historyItem.intention.details;
    }
    this.newNote = this.oldNote;
    this.newNoteDetails = this.oldNoteDetails;
    this.oldSequence = sequence;
    this.newTargetSequence = this.oldSequence;
    this.maxSequence = this.$store.state.operationHistory.history.length;

    this.isSaveWarning = false;

    this.$store.commit("operationHistory/selectOperationNote", {
      selectedOperationNote: { sequence: null, index: null },
    });
  }

  private saveTestPurpose() {
    const args: NoteEditInfo = {
      oldSequence: this.oldSequence ?? undefined,
      newSequence: this.newTargetSequence ?? undefined,
      note: this.newNote,
      noteDetails: this.newNoteDetails,
      shouldTakeScreenshot: false,
      tags: [],
    };
    (async () => {
      try {
        if (this.oldNote === "") {
          await this.$store.dispatch("operationHistory/addTestPurpose", {
            noteEditInfo: args,
          });
        } else {
          await this.$store.dispatch("operationHistory/editTestPurpose", {
            noteEditInfo: args,
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          this.errorMessage = error.message;
          this.errorMessageDialogOpened = true;
        } else {
          throw error;
        }
      }
    })();
  }

  private cancel(): void {
    this.$emit("cancel");
  }

  private close(): void {
    this.$emit("close");
  }

  private updateNewTargetSequence(data: { id: string; value: number }): void {
    this.newTargetSequence = data.value;
    this.isSaveWarning = this.checkDuplicatedBySequence();
  }

  private checkDuplicatedBySequence(): boolean {
    // case in add button.
    if (!this.oldSequence) {
      return false;
    }

    if (this.oldSequence === this.newTargetSequence) {
      return false;
    }

    for (const seq of this.collectTestPurposeSequences) {
      if (seq === this.newTargetSequence) {
        return true;
      }
    }
    return false;
  }

  private get collectTestPurposeSequences(): number[] {
    const seqs = [];
    const history = this.$store.getters["operationHistory/getHistory"]();

    for (const operationWithNotes of history) {
      if (!operationWithNotes.intention) {
        continue;
      }
      seqs.push(operationWithNotes.operation.sequence);
    }
    return seqs;
  }

  private get canSave() {
    if (this.isSaveWarning) {
      return false;
    }

    if (this.newNote === "") {
      return false;
    }

    if (this.sequenceIsOutOfRange()) {
      return false;
    }

    return true;
  }

  private sequenceIsOutOfRange() {
    if (!this.maxSequence || this.newTargetSequence === null) {
      return false;
    }

    if (isNaN(this.newTargetSequence)) {
      return true;
    }

    if (this.newTargetSequence <= this.maxSequence) {
      return false;
    }

    if (this.newTargetSequence >= 1) {
      return false;
    }

    return true;
  }
}
</script>

<style lang="sass">
.warningMessage
  color: red !important
  font-size: 11px
</style>
