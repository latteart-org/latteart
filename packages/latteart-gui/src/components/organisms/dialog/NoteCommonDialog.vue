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
      :title="store.getters.message('app.record-notice')"
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
          :label="store.getters.message('note-edit.target-sequence')"
          :value="newTargetSequence"
          :minValue="1"
          :maxValue="maxSequence"
          @updateNumberFieldValue="updateNewTargetSequence"
          :disabled="oldNote === ''"
        ></number-field>
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
        <h4 v-if="isCapturing && oldIndex === null">
          {{ store.getters.message("note-edit.take-screenshot") }}
        </h4>
        <v-radio-group
          v-if="isCapturing && oldIndex === null"
          v-model="shouldTakeScreenshot"
          row
          hide-details
          class="mt-2"
          :disabled="isAlertVisible || (!screenshot && !video)"
          :error-messages="takeScreenshotErrorMessage"
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
            >{{ store.getters.message("note-edit.check-still-Image") }}</v-btn
          >

          <v-btn class="mx-2 my-3" :disabled="!video" @click="showVideo">{{
            store.getters.message("note-edit.check-video")
          }}</v-btn>

          <popup-image v-if="isImageVisible" :imageFileUrl="screenshot" />

          <video-display v-if="isVideoVisible" :videoUrl="video" />
        </div>
      </template>
    </execute-dialog>
  </div>
</template>

<script lang="ts">
import { NoteEditInfo } from "@/lib/captureControl/types";
import NumberField from "@/components/molecules/NumberField.vue";
import {
  NoteTagItem,
  noteTagPreset,
} from "@/lib/operationHistory/NoteTagPreset";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { CaptureControlState } from "@/store/captureControl";
import { NoteDialogInfo } from "@/lib/operationHistory/types";
import VideoDisplay from "@/components/molecules/VideoDisplay.vue";
import PopupImage from "@/components/molecules/PopupImage.vue";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true },
    isCapturing: { type: Boolean, default: false },
    noteInfo: {
      type: Object as PropType<NoteDialogInfo>,
      default: undefined,
      required: true,
    },
  },
  components: {
    "number-field": NumberField,
    "execute-dialog": ExecuteDialog,
    "video-display": VideoDisplay,
    "popup-image": PopupImage,
  },
  setup(props, context) {
    const store = useStore();

    const search = ref(null);
    const oldNote = ref("");
    const oldNoteDetails = ref("");
    const oldTags = ref<string[]>([]);
    const newNote = ref("");
    const newNoteDetails = ref("");
    const newTags = ref<NoteTagItem[]>([]);
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

    const tagsItem = ref(noteTagPreset.items);

    const initialize = () => {
      if (!props.opened) {
        return;
      }

      isAlertVisible.value =
        ((store.state as any).captureControl as CaptureControlState)
          .captureSession?.isAlertVisible ?? false;

      oldNote.value = props.noteInfo.value;
      oldNoteDetails.value = props.noteInfo.details;
      oldIndex.value = props.noteInfo.index;
      oldTags.value = props.noteInfo.tags;
      screenshot.value = props.noteInfo.imageFilePath;
      video.value = props.noteInfo.videoFilePath;
      newNote.value = oldNote.value;
      newNoteDetails.value = oldNoteDetails.value;
      newTags.value = oldTags.value.map((tag) => {
        const targetTagItem = tagsItem.value.find((item) => item.text === tag);
        if (targetTagItem) {
          return targetTagItem;
        }

        return {
          text: tag,
          color: "#E0E0E0",
        };
      });
      oldSequence.value = props.noteInfo.sequence;
      newTargetSequence.value = oldSequence.value;
      maxSequence.value = props.noteInfo.maxSequence;
      shouldTakeScreenshot.value = false;
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

    const takeScreenshotErrorMessage = computed((): string => {
      return isAlertVisible.value
        ? store.getters.message("note-edit.error-cannot-take-screenshots")
        : "";
    });

    const execute = (): void => {
      const noteEditInfo = {
        oldSequence: oldSequence.value,
        oldIndex: oldIndex.value,
        newSequence:
          oldSequence.value !== newTargetSequence.value
            ? newTargetSequence.value
            : undefined,
        note: newNote.value,
        noteDetails: newNoteDetails.value,
        shouldTakeScreenshot: shouldTakeScreenshot.value,
        tags: newTags.value.map((tag) => tag.text),
      } as NoteEditInfo;
      context.emit("execute", noteEditInfo);
    };

    const cancel = (): void => {
      context.emit("cancel");
    };

    const close = (): void => {
      context.emit("close");
    };

    const updateNewTargetSequence = (data: {
      id: string;
      value: number;
    }): void => {
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
    watch(newTags, changeTags);

    return {
      store,
      search,
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
      tagsItem,
      takeScreenshotErrorMessage,
      execute,
      cancel,
      close,
      updateNewTargetSequence,
      canSave,
      showStillImage,
      showVideo,
    };
  },
});
</script>
