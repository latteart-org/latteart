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
        $store.getters.message("app.record-notice")
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

        <v-combobox
          :label="$store.getters.message('note-edit.tags')"
          :items="tagsItem"
          :search-input.sync="search"
          v-model="newTags"
          multiple
          small-chips
          hide-selected
        >
          <template v-slot:no-data>
            <v-list-tile v-if="search">
              <v-list-tile-content>
                <v-list-tile-title>
                  No results matching "<strong>{{ search }}</strong
                  >". Press <kbd>enter</kbd> to create a new one
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-combobox>

        <v-checkbox
          v-if="oldSequence === null && oldIndex === null"
          v-model="shouldTakeScreenshot"
          :disabled="alertIsVisible"
          :label="$store.getters.message('note-edit.take-screenshot')"
          :error-messages="takeScreenshotErrorMessage"
        ></v-checkbox>
      </template>
      <template v-slot:footer>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="!canSave"
          :dark="canSave"
          color="purple"
          @click="
            saveNotice();
            close();
          "
        >
          {{ $store.getters.message("common.ok") }}
        </v-btn>
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
import { noteTagPreset } from "@/lib/operationHistory/NoteTagPreset";

@Component({
  components: {
    "number-field": NumberField,
    "scrollable-dialog": ScrollableDialog,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class NoticeEditDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private search = "";
  private oldNote = "";
  private oldNoteDetails = "";
  private oldTags: string[] = [];
  private newNote = "";
  private newNoteDetails = "";
  private newTags: string[] = [];

  private oldSequence: number | null = null;
  private newTargetSequence: number | null = null;
  private maxSequence: number | null = null;
  private oldIndex: number | null = null;
  private shouldTakeScreenshot = false;

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private alertIsVisible = false;

  private tagsItem = noteTagPreset.items.map((item) => {
    return item.name;
  });

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }

    this.alertIsVisible = this.$store.state.captureControl.alertIsVisible;

    const { sequence, index } =
      this.$store.state.operationHistory.selectedOperationNote;
    const historyItem: OperationWithNotes =
      this.$store.getters["operationHistory/findHistoryItem"](sequence);

    if (!historyItem || !historyItem.notices || !historyItem.notices[index]) {
      // new note
      this.oldNote = "";
      this.oldNoteDetails = "";
      this.oldIndex = null;
      this.oldTags = [];
    } else {
      // update note
      this.oldNote = historyItem.notices![index].value;
      this.oldNoteDetails = historyItem.notices![index].details;
      this.oldIndex = index;
      this.oldTags = historyItem.notices![index].tags;
    }
    this.newNote = this.oldNote;
    this.newNoteDetails = this.oldNoteDetails;
    this.newTags = [...this.oldTags];
    this.oldSequence = sequence;
    this.newTargetSequence = this.oldSequence;
    this.maxSequence = this.$store.state.operationHistory.history.length;
    this.shouldTakeScreenshot = false;

    this.$store.commit("operationHistory/selectOperationNote", {
      selectedOperationNote: { sequence: null, index: null },
    });
  }

  private get takeScreenshotErrorMessage(): string {
    return this.alertIsVisible
      ? this.$store.getters.message("note-edit.error-cannot-take-screenshots")
      : "";
  }

  private saveNotice() {
    const args = {
      oldSequence: this.oldSequence,
      oldIndex: this.oldIndex,
      newSequence: this.newTargetSequence,
      note: this.newNote,
      noteDetails: this.newNoteDetails,
      shouldTakeScreenshot: this.shouldTakeScreenshot,
      tags: this.newTags,
    } as NoteEditInfo;
    (async () => {
      try {
        await this.$store.dispatch("operationHistory/saveNotice", {
          noteEditInfo: args,
        });
      } catch (error) {
        if (error instanceof Error) {
          this.errorMessage = `${error.message}`;
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
  }

  private get canSave() {
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
