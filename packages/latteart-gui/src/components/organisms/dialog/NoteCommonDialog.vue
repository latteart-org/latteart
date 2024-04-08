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
      :title="$t('app.record-notice')"
      @accept="execute"
      @cancel="
        cancel();
        close();
      "
      :acceptButtonDisabled="!canSave"
      :maxWidth="800"
    >
      <number-field
        :label="$t('note-edit.target-sequence')"
        :value="newTargetSequence ?? undefined"
        :minValue="1"
        :maxValue="maxSequence ?? undefined"
        @updateNumberFieldValue="updateNewTargetSequence"
        :disabled="oldNote === ''"
      ></number-field>
      <v-text-field :label="$t('note-edit.summary')" v-model="newNote"></v-text-field>
      <v-textarea :label="$t('note-edit.details')" v-model="newNoteDetails"></v-textarea>

      <note-tag-select-box :label="$t('note-edit.tags')" v-model="newTags"></note-tag-select-box>

      <h4 v-if="isCapturing && oldIndex === null">
        {{ $t("note-edit.take-screenshot") }}
      </h4>
      <v-radio-group
        v-if="isCapturing && oldIndex === null"
        v-model="shouldTakeScreenshot"
        inline
        hide-details
        class="mt-2"
        :disabled="isAlertVisible || (!screenshot && !video)"
        :error-messages="takeScreenshotErrorMessage"
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
    </execute-dialog>
  </div>
</template>

<script lang="ts">
import { type NoteEditInfo } from "@/lib/captureControl/types";
import NumberField from "@/components/molecules/NumberField.vue";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { type NoteDialogInfo } from "@/lib/operationHistory/types";
import VideoDisplay from "@/components/molecules/VideoDisplay.vue";
import PopupImage from "@/components/molecules/PopupImage.vue";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import type { PropType } from "vue";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import NoteTagSelectBox from "../common/NoteTagSelectBox.vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true },
    isCapturing: { type: Boolean, default: false },
    noteInfo: {
      type: Object as PropType<NoteDialogInfo>,
      default: undefined,
      required: true
    }
  },
  components: {
    "number-field": NumberField,
    "execute-dialog": ExecuteDialog,
    "video-display": VideoDisplay,
    "popup-image": PopupImage,
    "note-tag-select-box": NoteTagSelectBox
  },
  setup(props, context) {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();

    const oldNote = ref("");
    const oldNoteDetails = ref("");
    const oldTags = ref<string[]>([]);
    const newNote = ref("");
    const newNoteDetails = ref("");
    const newTags = ref<string[]>([]);
    const screenshot = ref("");
    const video = ref("");

    const oldSequence = ref<number | null>(null);
    const newTargetSequence = ref<number | null>(null);
    const maxSequence = ref<number | null>(null);
    const oldIndex = ref<number | null>(null);
    const shouldTakeScreenshot = ref(false);

    const isAlertVisible = ref(false);
    const isImageVisible = ref(false);
    const isVideoVisible = ref(false);

    const initialize = () => {
      if (!props.opened) {
        return;
      }

      isAlertVisible.value = captureControlStore.captureSession?.isAlertVisible ?? false;

      oldNote.value = props.noteInfo?.value ?? "";
      oldNoteDetails.value = props.noteInfo?.details ?? "";
      oldIndex.value = props.noteInfo?.index ?? null;
      oldTags.value = props.noteInfo?.tags ?? [];
      screenshot.value = props.noteInfo?.imageFilePath ?? "";
      video.value = props.noteInfo?.videoFilePath ?? "";
      newNote.value = oldNote.value;
      newNoteDetails.value = oldNoteDetails.value;
      newTags.value = oldTags.value;
      oldSequence.value = props.noteInfo?.sequence ?? null;
      newTargetSequence.value = oldSequence.value;
      maxSequence.value = props.noteInfo?.maxSequence ?? null;
      shouldTakeScreenshot.value = false;
      isImageVisible.value = false;
      isVideoVisible.value = false;

      operationHistoryStore.selectedOperationNote = { sequence: null, index: null };
    };

    const takeScreenshotErrorMessage = computed((): string => {
      return isAlertVisible.value
        ? rootStore.message("note-edit.error-cannot-take-screenshots")
        : "";
    });

    const execute = (): void => {
      const noteEditInfo = {
        oldSequence: oldSequence.value,
        oldIndex: oldIndex.value,
        newSequence:
          oldSequence.value !== newTargetSequence.value ? newTargetSequence.value : undefined,
        note: newNote.value,
        noteDetails: newNoteDetails.value,
        shouldTakeScreenshot: shouldTakeScreenshot.value,
        tags: newTags.value.map((tag) => tag)
      } as NoteEditInfo;
      context.emit("execute", noteEditInfo);
    };

    const cancel = (): void => {
      context.emit("cancel");
    };

    const close = (): void => {
      context.emit("close");
    };

    const updateNewTargetSequence = (data: { id: string; value: number }): void => {
      newTargetSequence.value = data.value;
    };

    const canSave = computed(() => {
      if (newNote.value === "") {
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
      oldNote,
      newNote,
      newNoteDetails,
      newTags,
      screenshot,
      video,
      newTargetSequence,
      maxSequence,
      oldIndex,
      shouldTakeScreenshot,
      isAlertVisible,
      isImageVisible,
      isVideoVisible,
      takeScreenshotErrorMessage,
      execute,
      cancel,
      close,
      updateNewTargetSequence,
      canSave,
      showStillImage,
      showVideo
    };
  }
});
</script>
