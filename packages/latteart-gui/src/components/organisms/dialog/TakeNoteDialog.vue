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
      :isCapturing="true"
      :noteInfo="noteInfo"
      @execute="takeNote"
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
import { type NoteEditInfo } from "@/lib/captureControl/types";
import { type NoteDialogInfo } from "@/lib/operationHistory/types";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import NoteCommonDialog from "@/components/organisms/dialog/NoteCommonDialog.vue";
import { defineComponent, ref, toRefs, watch } from "vue";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true }
  },
  components: {
    "note-common-dialog": NoteCommonDialog,
    "error-message-dialog": ErrorMessageDialog
  },
  setup(props, context) {
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();

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
      const sequence = operationHistoryStore.selectedOperationNote.sequence ?? 0;
      const targetOperation = operationHistoryStore.history[sequence - 1].operation;

      const time = targetOperation.videoFrame?.time ?? 0;
      const videoUrl = targetOperation.videoFrame?.url
        ? `${targetOperation.videoFrame.url}#t=${time}`
        : "";

      noteInfo.value = {
        value: "",
        details: "",
        index: null,
        tags: [],
        imageFilePath: targetOperation.imageFilePath ?? "",
        sequence: sequence,
        maxSequence: operationHistoryStore.history.length,
        videoFilePath: videoUrl
      };
    };

    const takeNote = (noteEditInfo: NoteEditInfo) => {
      (async () => {
        close();
        try {
          captureControlStore.takeNote({
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
      takeNote,
      close
    };
  }
});
</script>
