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
    <note-common-dialog
      :opened="opened"
      :noteInfo="noteInfo"
      @execute="editNote"
      @close="close()"
    />
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { NoteDialogInfo, OperationWithNotes } from "@/lib/operationHistory/types";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { NoteEditInfo } from "@/lib/captureControl/types";
import NoteCommonDialog from "@/components/organisms/dialog/NoteCommonDialog.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import { defineComponent, ref, toRefs, watch } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true }
  },
  components: {
    "note-common-dialog": NoteCommonDialog,
    "error-message-dialog": ErrorMessageDialog
  },
  setup(props, context) {
    const store = useStore();

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const noteInfo = ref<NoteDialogInfo>({
      value: "",
      details: "",
      index: null,
      tags: [],
      imageFilePath: "",
      sequence: 1,
      maxSequence: 1,
      videoFilePath: ""
    });

    const initialize = () => {
      if (!props.opened) {
        return;
      }

      const selectedOperationNote = ((store.state as any).operationHistory as OperationHistoryState)
        .selectedOperationNote;
      const sequence = selectedOperationNote.sequence as number;
      const index = selectedOperationNote.index as number;
      const historyItem: OperationWithNotes =
        store.getters["operationHistory/findHistoryItem"](sequence);

      if (historyItem.notices && historyItem.notices[index]) {
        const time =
          historyItem.notices[index].videoFrame?.time ??
          historyItem.operation.videoFrame?.time ??
          0;
        const videoUrl =
          historyItem.notices[index].videoFrame?.url ?? historyItem.operation.videoFrame?.url ?? "";
        const videoFilePath = videoUrl ? `${videoUrl}#t=${time}` : "";

        noteInfo.value = {
          value: historyItem.notices[index].value,
          details: historyItem.notices[index].details,
          index: index,
          tags: historyItem.notices[index].tags,
          imageFilePath:
            historyItem.notices[index].imageFilePath !== ""
              ? historyItem.notices[index].imageFilePath
              : historyItem.operation.imageFilePath,
          sequence: sequence,
          maxSequence: ((store.state as any).operationHistory as OperationHistoryState).history
            .length,
          videoFilePath
        };
      }
    };

    const editNote = (noteEditInfo: NoteEditInfo) => {
      (async () => {
        close();
        try {
          await store.dispatch("operationHistory/editNote", {
            noteEditInfo
          });
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

    const close = (): void => {
      context.emit("close");
    };

    const { opened } = toRefs(props);
    watch(opened, initialize);

    return {
      errorMessageDialogOpened,
      errorMessage,
      noteInfo,
      editNote,
      close
    };
  }
});
</script>
