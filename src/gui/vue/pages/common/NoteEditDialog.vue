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
        $store.getters.message("app.record-note")
      }}</template>
      <template v-slot:content>
        <h3 class="title mb-0">
          {{ $store.getters.message("note-edit.note-for-current-purpose") }}
        </h3>

        <v-card flat>
          <v-card-text>
            <v-radio-group v-model="shouldRecordAsIssue">
              <v-radio
                :label="$store.getters.message('note-edit.no-problem')"
                :value="false"
              ></v-radio>
              <v-radio
                :label="$store.getters.message('note-edit.problem-occured')"
                :value="true"
              ></v-radio>
            </v-radio-group>

            <v-text-field
              :disabled="!shouldRecordAsIssue"
              :label="$store.getters.message('note-edit.summary')"
              v-model="newNote"
            ></v-text-field>
            <v-textarea
              :disabled="!shouldRecordAsIssue"
              :label="$store.getters.message('note-edit.details')"
              v-model="newNoteDetails"
            ></v-textarea>

            <v-combobox
              :disabled="!shouldRecordAsIssue"
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
              :disabled="!shouldRecordAsIssue"
              v-model="shouldTakeScreenshot"
              :label="$store.getters.message('note-edit.take-screenshot')"
            ></v-checkbox>
          </v-card-text>
        </v-card>

        <h3 class="title mb-0">
          {{ $store.getters.message("note-edit.next-purpose") }}
        </h3>

        <v-card flat>
          <v-card-text>
            <v-text-field
              :disabled="shouldContinueSameTestPurpose"
              :label="$store.getters.message('note-edit.summary')"
              v-model="newTestPurpose"
            ></v-text-field>
            <v-textarea
              :disabled="shouldContinueSameTestPurpose"
              :label="$store.getters.message('note-edit.details')"
              v-model="newTestPurposeDetails"
            ></v-textarea>

            <v-checkbox
              v-model="shouldContinueSameTestPurpose"
              :label="$store.getters.message('note-edit.continue-same-purpose')"
            ></v-checkbox>
          </v-card-text>
        </v-card>
      </template>
      <template v-slot:footer>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="!canSave"
          :dark="canSave"
          color="blue"
          @click="
            saveNote();
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
export default class NoteEditDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private search = "";
  private newNote = "";
  private newNoteDetails = "";
  private newTags: string[] = [];
  private newTargetSequence: number | null = null;
  private maxSequence: number | null = null;
  private shouldTakeScreenshot = false;
  private shouldRecordAsIssue = false;
  private newTestPurpose = "";
  private newTestPurposeDetails = "";
  private shouldContinueSameTestPurpose = false;

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private tagsItem = noteTagPreset.items.map((item) => {
    return item.name;
  });

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }

    const { sequence, index } =
      this.$store.state.operationHistory.selectedOperationNote;
    const historyItem: OperationWithNotes =
      this.$store.getters["operationHistory/findHistoryItem"](sequence);

    this.newNote = "";
    this.newNoteDetails = "";
    this.newTags = [];
    this.newTargetSequence = sequence;
    this.maxSequence = this.$store.state.operationHistory.history.length;
    this.shouldTakeScreenshot = false;
    this.shouldRecordAsIssue = false;
    this.newTestPurpose = "";
    this.newTestPurposeDetails = "";
    this.shouldContinueSameTestPurpose = false;

    this.$store.commit("operationHistory/selectOperationNote", {
      selectedOperationNote: { sequence: null, index: null },
    });
  }

  private saveNote() {
    (async () => {
      try {
        const noteInfo: NoteEditInfo = {
          oldSequence: this.newTargetSequence,
          newSequence: this.newTargetSequence,
          note: this.newNote,
          noteDetails: this.newNoteDetails,
          tags: this.newTags,
          shouldTakeScreenshot: this.shouldTakeScreenshot,
        } as NoteEditInfo;

        const intentionInfo = {
          oldSequence: this.newTargetSequence ?? undefined,
          newSequence: this.newTargetSequence ?? undefined,
          note: this.newTestPurpose,
          noteDetails: this.newTestPurposeDetails,
          tags: [],
          shouldTakeScreenshot: false,
        } as NoteEditInfo;

        if (this.shouldRecordAsIssue) {
          await this.$store.dispatch("operationHistory/saveNotice", {
            noteEditInfo: noteInfo,
          });
        }

        if (!this.shouldContinueSameTestPurpose) {
          await this.$store.dispatch(
            "operationHistory/addUnassignedTestPurpose",
            { noteEditInfo: intentionInfo }
          );
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
  }

  private get canSave() {
    if (this.shouldRecordAsIssue && this.newNote === "") {
      return false;
    }

    if (!this.shouldContinueSameTestPurpose && this.newTestPurpose === "") {
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
