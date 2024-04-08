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
      :title="$t('app.record-note')"
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
      <h3 class="text-h6 mb-0">
        {{ $t("note-edit.note-for-current-purpose") }}
      </h3>

      <v-card flat>
        <v-card-text>
          <v-radio-group v-model="shouldRecordAsIssue">
            <v-radio :label="$t('note-edit.no-problem')" :value="false"></v-radio>
            <v-radio :label="$t('note-edit.problem-occured')" :value="true"></v-radio>
          </v-radio-group>
          <div v-if="shouldRecordAsIssue">
            <v-text-field :label="$t('note-edit.summary')" v-model="newNote"></v-text-field>
            <v-textarea :label="$t('note-edit.details')" v-model="newNoteDetails"></v-textarea>

            <note-tag-select-box
              :label="$t('note-edit.tags')"
              v-model="newTags"
            ></note-tag-select-box>

            <h4>{{ $t("note-edit.take-screenshot") }}</h4>
            <v-radio-group
              v-model="shouldTakeScreenshot"
              inline
              hide-details
              class="mt-2"
              :disabled="!screenshot && !video"
            >
              <v-radio :label="$t('note-edit.previous-screen')" :value="false"></v-radio>
              <v-radio :label="$t('note-edit.current-screen')" :value="true"></v-radio>
            </v-radio-group>

            <div v-if="!shouldTakeScreenshot">
              <v-btn class="mx-2 my-3" :disabled="!screenshot" @click="showStillImage">{{
                $t("note-edit.check-still-Image")
              }}</v-btn>

              <v-btn class="mx-2 my-3" :disabled="!video" @click="showVideo">{{
                $t("note-edit.check-video")
              }}</v-btn>

              <popup-image v-if="isImageVisible" :imageFileUrl="screenshot" />

              <video-display v-if="isVideoVisible" :videoUrl="video" />
            </div>
          </div>
        </v-card-text>
      </v-card>

      <h3 class="text-h6 mb-0">
        {{ $t("note-edit.next-purpose") }}
      </h3>

      <v-card flat>
        <v-card-text>
          <v-text-field
            :disabled="shouldContinueSameTestPurpose"
            :label="$t('note-edit.summary')"
            v-model="newTestPurpose"
          ></v-text-field>
          <v-textarea
            :disabled="shouldContinueSameTestPurpose"
            :label="$t('note-edit.details')"
            v-model="newTestPurposeDetails"
          ></v-textarea>

          <v-checkbox
            v-model="shouldContinueSameTestPurpose"
            :label="$t('note-edit.continue-same-purpose')"
          ></v-checkbox>
        </v-card-text>
      </v-card>
    </execute-dialog>
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { type NoteEditInfo } from "@/lib/captureControl/types";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import VideoDisplay from "@/components/molecules/VideoDisplay.vue";
import PopupImage from "@/components/molecules/PopupImage.vue";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import NoteTagSelectBox from "../common/NoteTagSelectBox.vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true }
  },
  components: {
    "execute-dialog": ExecuteDialog,
    "error-message-dialog": ErrorMessageDialog,
    "video-display": VideoDisplay,
    "popup-image": PopupImage,
    "note-tag-select-box": NoteTagSelectBox
  },
  setup(props, context) {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();

    const newNote = ref("");
    const newNoteDetails = ref("");
    const newTags = ref<string[]>([]);
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

    const initialize = () => {
      if (!props.opened) {
        return;
      }

      const sequence = operationHistoryStore.selectedOperationNote.sequence ?? 0;
      const targetOperation = operationHistoryStore.history[sequence - 1].operation;

      newNote.value = "";
      newNoteDetails.value = "";
      newTags.value = [];
      newTargetSequence.value = sequence;
      maxSequence.value = operationHistoryStore.history.length;
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

      operationHistoryStore.selectedOperationNote = { sequence: null, index: null };
    };

    const saveNote = () => {
      (async () => {
        try {
          const noteInfo: NoteEditInfo = {
            oldSequence: newTargetSequence.value,
            newSequence: newTargetSequence.value,
            note: newNote.value,
            noteDetails: newNoteDetails.value,
            tags: newTags.value.map((tag) => tag),
            shouldTakeScreenshot: shouldTakeScreenshot.value
          } as NoteEditInfo;

          const intentionInfo = {
            oldSequence: newTargetSequence.value ?? undefined,
            newSequence: newTargetSequence.value ?? undefined,
            note: newTestPurpose.value,
            noteDetails: newTestPurposeDetails.value,
            tags: [],
            shouldTakeScreenshot: false
          } as NoteEditInfo;

          if (shouldRecordAsIssue.value) {
            captureControlStore.takeNote({
              noteEditInfo: noteInfo
            });
          }

          if (!shouldContinueSameTestPurpose.value) {
            captureControlStore.setNextTestPurpose({
              noteEditInfo: intentionInfo
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

    return {
      t: rootStore.message,
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
      saveNote,
      cancel,
      close,
      canSave,
      showStillImage,
      showVideo
    };
  }
});
</script>
