<!--
 Copyright 2025 NTT Corporation.

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
      :title="$t('common.record-note')"
      :accept-button-disabled="!canSave"
      :max-width="800"
      @accept="
        saveNote();
        close();
      "
      @cancel="
        cancel();
        close();
      "
    >
      <h3 class="text-h6 mb-0">
        {{ $t("take-note-with-purpose-dialog.note-for-current-test-purpose") }}
      </h3>

      <v-card flat :disabled="isDisabled">
        <v-card-text>
          <v-radio-group v-model="shouldRecordAsIssue">
            <v-radio
              :label="$t('take-note-with-purpose-dialog.no-problem')"
              :value="false"
            ></v-radio>
            <v-radio
              :label="$t('take-note-with-purpose-dialog.problem-occured')"
              :value="true"
            ></v-radio>
          </v-radio-group>
          <div v-if="shouldRecordAsIssue">
            <v-text-field
              v-model="newNote"
              variant="underlined"
              :label="$t('common.summary')"
            ></v-text-field>
            <v-textarea
              v-model="newNoteDetails"
              variant="underlined"
              :label="$t('common.non-required-details')"
            ></v-textarea>

            <note-tag-select-box v-model="newTags" :label="$t('common.tags')"></note-tag-select-box>

            <h4>{{ $t("common.take-screenshot") }}</h4>
            <v-radio-group
              v-model="shouldTakeScreenshot"
              inline
              hide-details
              class="mt-2"
              :disabled="!screenshot && !video"
            >
              <v-radio :label="$t('common.previous-screen')" :value="false"></v-radio>
              <v-radio :label="$t('common.current-screen')" :value="true"></v-radio>
            </v-radio-group>

            <div v-if="!shouldTakeScreenshot">
              <v-btn class="mx-2 my-3" :disabled="!screenshot" @click="showStillImage">{{
                $t("common.check-still-image")
              }}</v-btn>

              <v-btn class="mx-2 my-3" :disabled="!video" @click="showVideo">{{
                $t("common.check-video")
              }}</v-btn>

              <popup-image v-if="isImageVisible" :image-file-url="screenshot" />

              <video-display v-if="isVideoVisible" :video-url="video" />
            </div>
          </div>
        </v-card-text>
      </v-card>

      <h3 class="text-h6 mb-0">
        {{ $t("take-note-with-purpose-dialog.next-test-purpose") }}
      </h3>

      <v-card flat>
        <v-card-text>
          <v-text-field
            v-model="newTestPurpose"
            variant="underlined"
            :disabled="shouldContinueSameTestPurpose"
            :label="$t('common.summary')"
          ></v-text-field>
          <v-textarea
            v-model="newTestPurposeDetails"
            variant="underlined"
            :disabled="shouldContinueSameTestPurpose"
            :label="$t('common.non-required-details')"
          ></v-textarea>

          <v-checkbox
            v-model="shouldContinueSameTestPurpose"
            :label="$t('take-note-with-purpose-dialog.continue-same-test-purpose')"
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
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import NoteTagSelectBox from "../common/NoteTagSelectBox.vue";
import { checkExcludeOperationType } from "@/lib/common/util";

export default defineComponent({
  components: {
    "execute-dialog": ExecuteDialog,
    "error-message-dialog": ErrorMessageDialog,
    "video-display": VideoDisplay,
    "popup-image": PopupImage,
    "note-tag-select-box": NoteTagSelectBox
  },
  props: {
    opened: { type: Boolean, default: false, required: true }
  },
  setup(props, context) {
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

    const isDisabled = computed((): boolean => {
      const target = operationHistoryStore.history.at(-1)?.operation.type ?? "";
      return checkExcludeOperationType(target);
    });

    const { opened } = toRefs(props);
    watch(opened, initialize);

    return {
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
      showVideo,
      isDisabled
    };
  }
});
</script>
