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
      :title="store.getters.message('app.record-note')"
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
          {{ store.getters.message("note-edit.note-for-current-purpose") }}
        </h3>

        <v-card flat>
          <v-card-text>
            <v-radio-group v-model="shouldRecordAsIssue">
              <v-radio
                :label="store.getters.message('note-edit.no-problem')"
                :value="false"
              ></v-radio>
              <v-radio
                :label="store.getters.message('note-edit.problem-occured')"
                :value="true"
              ></v-radio>
            </v-radio-group>
            <div v-if="shouldRecordAsIssue">
              <v-text-field
                :label="store.getters.message('note-edit.summary')"
                v-model="newNote"
              ></v-text-field>
              <v-textarea
                :label="store.getters.message('note-edit.details')"
                v-model="newNoteDetails"
              ></v-textarea>

              <v-combobox
                :label="store.getters.message('note-edit.tags')"
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
              <h4>{{ store.getters.message("note-edit.take-screenshot") }}</h4>
              <v-radio-group
                v-model="shouldTakeScreenshot"
                row
                hide-details
                class="mt-2"
                :disabled="!screenshot && !video"
              >
                <v-radio
                  :label="store.getters.message('note-edit.previous-screen')"
                  :value="false"
                ></v-radio>
                <v-radio
                  :label="store.getters.message('note-edit.current-screen')"
                  :value="true"
                ></v-radio>
              </v-radio-group>

              <div v-if="!shouldTakeScreenshot">
                <v-btn
                  class="mx-2 my-3"
                  :disabled="!screenshot"
                  @click="showStillImage"
                  >{{
                    store.getters.message("note-edit.check-still-Image")
                  }}</v-btn
                >

                <v-btn
                  class="mx-2 my-3"
                  :disabled="!video"
                  @click="showVideo"
                  >{{ store.getters.message("note-edit.check-video") }}</v-btn
                >

                <popup-image v-if="isImageVisible" :imageFileUrl="screenshot" />

                <video-display v-if="isVideoVisible" :videoUrl="video" />
              </div>
            </div>
          </v-card-text>
        </v-card>

        <h3 class="title mb-0">
          {{ store.getters.message("note-edit.next-purpose") }}
        </h3>

        <v-card flat>
          <v-card-text>
            <v-text-field
              :disabled="shouldContinueSameTestPurpose"
              :label="store.getters.message('note-edit.summary')"
              v-model="newTestPurpose"
            ></v-text-field>
            <v-textarea
              :disabled="shouldContinueSameTestPurpose"
              :label="store.getters.message('note-edit.details')"
              v-model="newTestPurposeDetails"
            ></v-textarea>

            <v-checkbox
              v-model="shouldContinueSameTestPurpose"
              :label="store.getters.message('note-edit.continue-same-purpose')"
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
import { NoteEditInfo } from "@/lib/captureControl/types";
import NumberField from "@/components/molecules/NumberField.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import {
  NoteTagItem,
  noteTagPreset,
} from "@/lib/operationHistory/NoteTagPreset";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import VideoDisplay from "@/components/molecules/VideoDisplay.vue";
import PopupImage from "@/components/molecules/PopupImage.vue";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true },
  },
  components: {
    "number-field": NumberField,
    "execute-dialog": ExecuteDialog,
    "error-message-dialog": ErrorMessageDialog,
    "video-display": VideoDisplay,
    "popup-image": PopupImage,
  },
  setup(props, context) {
    const store = useStore();

    const search = ref(null);
    const newNote = ref("");
    const newNoteDetails = ref("");
    const newTags = ref<NoteTagItem[]>([]);
    const newTargetSequence = ref<number | null>(null);
    const maxSequence = ref<number | null>(null);
    const shouldTakeScreenshot = ref(false);
    const shouldRecordAsIssue = ref(false);
    const newTestPurpose = ref("");
    const newTestPurposeDetails = ref("");
    const shouldContinueSameTestPurpose = ref(false);
    const screenshot = ref("");
    const video = ref("");

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const isImageVisible = ref(false);
    const isVideoVisible = ref(false);

    const tagsItem = ref(noteTagPreset.items);

    const initialize = () => {
      if (!props.opened) {
        return;
      }

      const sequence = (
        (store.state as any).operationHistory as OperationHistoryState
      ).selectedOperationNote.sequence as number;
      const targetOperation = (
        (store.state as any).operationHistory as OperationHistoryState
      ).history[sequence - 1].operation;

      newNote.value = "";
      newNoteDetails.value = "";
      newTags.value = [];
      newTargetSequence.value = sequence;
      maxSequence.value = (
        (store.state as any).operationHistory as OperationHistoryState
      ).history.length;
      shouldTakeScreenshot.value = false;
      shouldRecordAsIssue.value = false;
      newTestPurpose.value = "";
      newTestPurposeDetails.value = "";
      shouldContinueSameTestPurpose.value = false;
      screenshot.value = targetOperation.imageFilePath ?? "";

      const time = targetOperation.videoFrame?.time ?? 0;
      video.value = targetOperation.videoFrame?.url
        ? `${targetOperation.videoFrame.url}#t=${time}`
        : "";

      isImageVisible.value = false;
      isVideoVisible.value = false;

      store.commit("operationHistory/selectOperationNote", {
        selectedOperationNote: { sequence: null, index: null },
      });
    };

    const changeTags = (val: NoteTagItem[], prev: NoteTagItem[]) => {
      if (val.length === prev.length) return;

      newTags.value = val.map((v) => {
        if (typeof v === "string") {
          v = {
            text: v,
            color: "#E0E0E0",
          };

          newTags.value.push(v);
        }

        return v;
      });
    };

    const saveNote = () => {
      (async () => {
        try {
          const noteInfo: NoteEditInfo = {
            oldSequence: newTargetSequence.value,
            newSequence: newTargetSequence.value,
            note: newNote.value,
            noteDetails: newNoteDetails.value,
            tags: newTags.value.map((tag) => tag.text),
            shouldTakeScreenshot: shouldTakeScreenshot.value,
          } as NoteEditInfo;

          const intentionInfo = {
            oldSequence: newTargetSequence.value ?? undefined,
            newSequence: newTargetSequence.value ?? undefined,
            note: newTestPurpose.value,
            noteDetails: newTestPurposeDetails.value,
            tags: [],
            shouldTakeScreenshot: false,
          } as NoteEditInfo;

          if (shouldRecordAsIssue.value) {
            await store.dispatch("captureControl/takeNote", {
              noteEditInfo: noteInfo,
            });
          }

          if (!shouldContinueSameTestPurpose.value) {
            await store.dispatch("captureControl/setNextTestPurpose", {
              noteEditInfo: intentionInfo,
            });
          }
        } catch (error) {
          if (error instanceof Error) {
            errorMessage.value = error.message;
            errorMessageDialogOpened.value = true;
          } else {
            throw error;
          }
        }
      })();
    };

    const cancel = (): void => {
      context.emit("cancel");
    };

    const close = (): void => {
      context.emit("close");
    };

    const canSave = computed(() => {
      if (shouldRecordAsIssue.value && newNote.value === "") {
        return false;
      }

      if (!shouldContinueSameTestPurpose.value && newTestPurpose.value === "") {
        return false;
      }

      if (sequenceIsOutOfRange()) {
        return false;
      }

      return true;
    });

    const sequenceIsOutOfRange = () => {
      if (!maxSequence.value || newTargetSequence.value === null) {
        return false;
      }

      if (isNaN(newTargetSequence.value)) {
        return true;
      }

      if (newTargetSequence.value <= maxSequence.value) {
        return false;
      }

      if (newTargetSequence.value >= 1) {
        return false;
      }

      return true;
    };

    const showStillImage = () => {
      isImageVisible.value = true;
      isVideoVisible.value = false;
    };

    const showVideo = () => {
      isVideoVisible.value = true;
      isImageVisible.value = false;
    };

    const { opened } = toRefs(props);
    watch(opened, initialize);
    watch(newTags, changeTags);

    return {
      store,
      search,
      newNote,
      newNoteDetails,
      newTags,
      shouldTakeScreenshot,
      shouldRecordAsIssue,
      newTestPurpose,
      newTestPurposeDetails,
      shouldContinueSameTestPurpose,
      screenshot,
      video,
      errorMessageDialogOpened,
      errorMessage,
      isImageVisible,
      isVideoVisible,
      tagsItem,
      saveNote,
      cancel,
      close,
      canSave,
      showStillImage,
      showVideo,
    };
  },
});
</script>
