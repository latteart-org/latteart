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
          v-model="newTags"
          :hide-no-data="!search"
          :items="tagsItem"
          :search-input.sync="search"
          hide-selected
          multiple
          small-chips
        >
          <template v-slot:no-data>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  No results matching "<strong>{{ search }}</strong
                  >". Press <kbd>enter</kbd> to create a new one
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template v-slot:selection="{ attrs, item, parent, selected }">
            <v-chip
              v-if="item === Object(item)"
              v-bind="attrs"
              :color="item.color"
              :input-value="selected"
              small
            >
              <span class="pr-2">{{ item.text }} </span>
              <v-icon small @click="parent.selectItem(item)">$delete</v-icon>
            </v-chip>
          </template>
        </v-combobox>

        <v-checkbox
          v-if="isCapturing && oldIndex === null && mediaType === 'image'"
          v-model="shouldTakeScreenshot"
          :disabled="isAlertVisible"
          :label="$store.getters.message('note-edit.take-screenshot')"
          :error-messages="takeScreenshotErrorMessage"
        ></v-checkbox>

        <thumbnail-image v-if="screenshot" :imageFileUrl="screenshot" />

        <v-btn
          v-if="video"
          :disabled="isPictureInPictureVideoDisplayed"
          @click="displayPictureInPictureVideo"
          >{{ $store.getters.message("note-edit.check-video") }}</v-btn
        >
      </template>
    </execute-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { NoteEditInfo } from "@/lib/captureControl/types";
import NumberField from "@/components/molecules/NumberField.vue";
import {
  NoteTagItem,
  noteTagPreset,
} from "@/lib/operationHistory/NoteTagPreset";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { CaptureControlState } from "@/store/captureControl";
import { NoteDialogInfo } from "@/lib/operationHistory/types";
import ThumbnailImage from "@/components/molecules/ThumbnailImage.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import { RootState } from "@/store";

@Component({
  components: {
    "number-field": NumberField,
    "execute-dialog": ExecuteDialog,
    "thumbnail-image": ThumbnailImage,
  },
})
export default class NoteCommonDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({ type: Boolean, default: false })
  public readonly isCapturing!: boolean;
  @Prop({ type: Object, default: undefined })
  public readonly noteInfo!: NoteDialogInfo;

  private search = null;
  private oldNote = "";
  private oldNoteDetails = "";
  private oldTags: string[] = [];
  private newNote = "";
  private newNoteDetails = "";
  private newTags: NoteTagItem[] = [];
  private screenshot = "";
  private video = "";

  private oldSequence: number | null = null;
  private newTargetSequence: number | null = null;
  private maxSequence: number | null = null;
  private oldIndex: number | null = null;
  private shouldTakeScreenshot = false;

  private isAlertVisible = false;

  private tagsItem = noteTagPreset.items;

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
    this.video = this.noteInfo.videoFilePath;
    this.newNote = this.oldNote;
    this.newNoteDetails = this.oldNoteDetails;
    this.newTags = this.oldTags.map((tag) => {
      const targetTagItem = this.tagsItem.find((item) => item.text === tag);
      if (targetTagItem) {
        return targetTagItem;
      }

      return {
        text: tag,
        color: "#E0E0E0",
      };
    });
    this.oldSequence = this.noteInfo.sequence;
    this.newTargetSequence = this.oldSequence;
    this.maxSequence = this.noteInfo.maxSequence;
    this.shouldTakeScreenshot = false;

    this.$store.commit("operationHistory/selectOperationNote", {
      selectedOperationNote: { sequence: null, index: null },
    });
  }

  @Watch("newTags")
  private changeTags(val: NoteTagItem[], prev: NoteTagItem[]) {
    if (val.length === prev.length) return;

    this.newTags = val.map((v) => {
      if (typeof v === "string") {
        v = {
          text: v,
          color: "#E0E0E0",
        };

        this.newTags.push(v);
      }

      return v;
    });
  }

  private get takeScreenshotErrorMessage(): string {
    return this.isAlertVisible
      ? this.$store.getters.message("note-edit.error-cannot-take-screenshots")
      : "";
  }

  private get mediaType() {
    return (this.$store.state as RootState).projectSettings.config
      .captureMediaSetting.mediaType;
  }
  private displayPictureInPictureVideo() {
    this.$store.commit("operationHistory/setPictureInPictureWindowDisplayed", {
      isDisplayed: true,
    });
  }
  private get isPictureInPictureVideoDisplayed() {
    return (this.$store.state.operationHistory as OperationHistoryState)
      .isPictureInPictureWindowDisplayed;
  }

  private execute(): void {
    const noteEditInfo = {
      oldSequence: this.oldSequence,
      oldIndex: this.oldIndex,
      newSequence:
        this.oldSequence !== this.newTargetSequence
          ? this.newTargetSequence
          : undefined,
      note: this.newNote,
      noteDetails: this.newNoteDetails,
      shouldTakeScreenshot: this.shouldTakeScreenshot,
      tags: this.newTags.map((tag) => tag.text),
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
