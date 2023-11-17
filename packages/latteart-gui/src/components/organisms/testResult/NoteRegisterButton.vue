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
    <v-btn
      :disabled="!isCapturing"
      color="green"
      :dark="isCapturing"
      @click="open"
      fab
      small
      :title="store.getters.message('app.record-note')"
      class="mx-2"
    >
      <v-icon>add_comment</v-icon>
    </v-btn>

    <take-not-with-purpose-dialog
      :opened="takeNoteWithPurposeDialogOpened"
      @close="takeNoteWithPurposeDialogOpened = false"
    />
    <take-note-dialog
      :opened="takeNoteDialogOpened"
      @close="takeNoteDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import TakeNoteWithPurposeDialog from "@/components/organisms/dialog/TakeNoteWithPurposeDialog.vue";
import TakeNoteDialog from "@/components/organisms/dialog/TakeNoteDialog.vue";
import { CaptureControlState } from "@/store/captureControl";
import { OperationHistoryState } from "@/store/operationHistory";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  components: {
    "take-not-with-purpose-dialog": TakeNoteWithPurposeDialog,
    "take-note-dialog": TakeNoteDialog,
  },
  setup() {
    const store = useStore();

    const takeNoteWithPurposeDialogOpened = ref(false);
    const takeNoteDialogOpened = ref(false);

    const isCapturing = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState)
        .isCapturing;
    });

    const open = () => {
      const sequence = (
        (store.state as any).operationHistory as OperationHistoryState
      ).history.length;
      store.dispatch("operationHistory/selectOperation", { sequence });
      store.commit("operationHistory/selectOperationNote", {
        selectedOperationNote: { sequence, index: null },
      });
      if (
        ((store.state as any).captureControl as CaptureControlState).testOption
          .shouldRecordTestPurpose
      ) {
        takeNoteWithPurposeDialogOpened.value = true;
      } else {
        takeNoteDialogOpened.value = true;
      }
    };

    return {
      store,
      takeNoteWithPurposeDialogOpened,
      takeNoteDialogOpened,
      isCapturing,
      open,
    };
  },
});
</script>
