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
      :title="$store.getters.message('app.record-note')"
      @accept="
        saveNote();
        close();
      "
      @cancel="
        cancel();
        close();
      "
      :acceptButtonDisabled="!canSave"
      :maxWidth="800"
    >
      <template>
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
            <div v-if="shouldRecordAsIssue">
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
                multiple
                small-chips
                hide-selected
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
                    <v-icon small @click="parent.selectItem(item)"
                      >$delete</v-icon
                    >
                  </v-chip>
                </template>
              </v-combobox>
              <h4>{{ $store.getters.message("note-edit.take-screenshot") }}</h4>
              <v-radio-group
                v-model="shouldTakeScreenshot"
                row
                hide-details
                class="mt-2"
                :disabled="!screenshot && !video"
              >
                <v-radio
                  :label="$store.getters.message('note-edit.previous-screen')"
                  :value="false"
                ></v-radio>
                <v-radio
                  :label="$store.getters.message('note-edit.current-screen')"
                  :value="true"
                ></v-radio>
              </v-radio-group>

              <div v-if="!shouldTakeScreenshot">
                <v-btn
                  class="mx-2 my-3"
                  :disabled="!screenshot"
                  @click="showStillImage"
                  >{{
                    $store.getters.message("note-edit.check-still-Image")
                  }}</v-btn
                >

                <v-btn
                  class="mx-2 my-3"
                  :disabled="!video"
                  @click="showVideo"
                  >{{ $store.getters.message("note-edit.check-video") }}</v-btn
                >

                <popup-image v-if="isImageVisible" :imageFileUrl="screenshot" />

                <video-display v-if="isVideoVisible" :videoUrl="video" />
              </div>
            </div>
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
    </execute-dialog>
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
import NumberField from "@/components/molecules/NumberField.vue";
import ErrorMessageDialog from "@/components/pages/common/ErrorMessageDialog.vue";
import {
  NoteTagItem,
  noteTagPreset,
} from "@/lib/operationHistory/NoteTagPreset";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import VideoDisplay from "@/components/molecules/VideoDisplay.vue";
import PopupImage from "@/components/molecules/PopupImage.vue";

@Component({
  components: {
    "number-field": NumberField,
    "execute-dialog": ExecuteDialog,
    "error-message-dialog": ErrorMessageDialog,
    "video-display": VideoDisplay,
    "popup-image": PopupImage,
  },
})
export default class TakeNoteWithPurposeDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private search = null;
  private newNote = "";
  private newNoteDetails = "";
  private newTags: NoteTagItem[] = [];
  private newTargetSequence: number | null = null;
  private maxSequence: number | null = null;
  private shouldTakeScreenshot = false;
  private shouldRecordAsIssue = false;
  private newTestPurpose = "";
  private newTestPurposeDetails = "";
  private shouldContinueSameTestPurpose = false;
  private screenshot = "";
  private video = "";

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private isImageVisible = false;
  private isVideoVisible = false;

  private tagsItem = noteTagPreset.items;

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }

    const { sequence } =
      this.$store.state.operationHistory.selectedOperationNote;
    const targetOperation = (
      this.$store.state.operationHistory as OperationHistoryState
    ).history[sequence - 1].operation;

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
    this.screenshot = targetOperation.imageFilePath ?? "";

    const time = targetOperation.videoFrame?.time ?? 0;
    this.video = targetOperation.videoFrame?.url
      ? `${targetOperation.videoFrame.url}#t=${time}`
      : "";

    this.isImageVisible = false;
    this.isVideoVisible = false;

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

  private saveNote() {
    (async () => {
      try {
        const noteInfo: NoteEditInfo = {
          oldSequence: this.newTargetSequence,
          newSequence: this.newTargetSequence,
          note: this.newNote,
          noteDetails: this.newNoteDetails,
          tags: this.newTags.map((tag) => tag.text),
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
          await this.$store.dispatch("captureControl/takeNote", {
            noteEditInfo: noteInfo,
          });
        }

        if (!this.shouldContinueSameTestPurpose) {
          await this.$store.dispatch("captureControl/setNextTestPurpose", {
            noteEditInfo: intentionInfo,
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

  private showStillImage() {
    this.isImageVisible = true;
    this.isVideoVisible = false;
  }

  private showVideo() {
    this.isVideoVisible = true;
    this.isImageVisible = false;
  }
}
</script>
