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
    <execute-dialog
      :opened="opened"
      :title="$store.getters.message('app.record-notice')"
      @accept="execute"
      @cancel="
        cancel();
        close();
      "
      :acceptButtonDisabled="!canSave"
      :maxWidth="800"
    >
      <template>
        <number-field
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
          :disabled="isAlertVisible"
          :label="$store.getters.message('note-edit.take-screenshot')"
          :error-messages="takeScreenshotErrorMessage"
        ></v-checkbox>
        <thumbnail-image v-if="isThumbnailVisible" :imageFileUrl="screenshot" />
      </template>
    </execute-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { NoteEditInfo } from "@/lib/captureControl/types";
import NumberField from "@/components/molecules/NumberField.vue";
import { noteTagPreset } from "@/lib/operationHistory/NoteTagPreset";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { CaptureControlState } from "@/store/captureControl";
import { NoteDialogInfo } from "@/lib/operationHistory/types";
import ThumbnailImage from "@/components/molecules/ThumbnailImage.vue";

@Component({
  components: {
    "number-field": NumberField,
    "execute-dialog": ExecuteDialog,
    "thumbnail-image": ThumbnailImage,
  },
})
export default class NoteCommonDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({ type: Object, default: undefined })
  public readonly noteInfo!: NoteDialogInfo;

  private search = "";
  private oldNote = "";
  private oldNoteDetails = "";
  private oldTags: string[] = [];
  private newNote = "";
  private newNoteDetails = "";
  private newTags: string[] = [];
  private screenshot = "";

  private oldSequence: number | null = null;
  private newTargetSequence: number | null = null;
  private maxSequence: number | null = null;
  private oldIndex: number | null = null;
  private shouldTakeScreenshot = false;

  private isAlertVisible = false;

  private isThumbnailVisible = false;

  private tagsItem = noteTagPreset.items.map((item) => {
    return item.name;
  });

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }

    this.isAlertVisible =
      (this.$store.state.captureControl as CaptureControlState).captureSession
        ?.isAlertVisible ?? false;

    this.oldNote = this.noteInfo.value;
    this.oldNoteDetails = this.noteInfo.details;
    this.oldIndex = this.noteInfo.index;
    this.oldTags = this.noteInfo.tags;
    this.screenshot = this.noteInfo.imageFilePath;
    this.newNote = this.oldNote;
    this.newNoteDetails = this.oldNoteDetails;
    this.newTags = [...this.oldTags];
    this.oldSequence = this.noteInfo.sequence;
    this.newTargetSequence = this.oldSequence;
    this.maxSequence = this.noteInfo.maxSequence;
    this.shouldTakeScreenshot = false;
    this.isThumbnailVisible = false;
    this.$nextTick(() => {
      this.isThumbnailVisible = true;
    });

    this.$store.commit("operationHistory/selectOperationNote", {
      selectedOperationNote: { sequence: null, index: null },
    });
  }

  private get takeScreenshotErrorMessage(): string {
    return this.isAlertVisible
      ? this.$store.getters.message("note-edit.error-cannot-take-screenshots")
      : "";
  }

  private execute(): void {
    const noteEditInfo = {
      oldSequence: this.oldSequence,
      oldIndex: this.oldIndex,
      newSequence: this.newTargetSequence,
      note: this.newNote,
      noteDetails: this.newNoteDetails,
      shouldTakeScreenshot: this.shouldTakeScreenshot,
      tags: this.newTags,
    } as NoteEditInfo;
    this.$emit("execute", noteEditInfo);
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
