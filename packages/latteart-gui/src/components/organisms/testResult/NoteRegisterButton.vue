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
      icon="add_comment"
      @click="open"
      size="small"
      :title="$t('app.record-note')"
      class="mx-2"
    >
    </v-btn>

    <take-not-with-purpose-dialog
      :opened="takeNoteWithPurposeDialogOpened"
      @close="takeNoteWithPurposeDialogOpened = false"
    />
    <take-note-dialog :opened="takeNoteDialogOpened" @close="takeNoteDialogOpened = false" />
  </div>
</template>

<script lang="ts">
import TakeNoteWithPurposeDialog from "@/components/organisms/dialog/TakeNoteWithPurposeDialog.vue";
import TakeNoteDialog from "@/components/organisms/dialog/TakeNoteDialog.vue";
import { computed, defineComponent, ref } from "vue";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";

export default defineComponent({
  components: {
    "take-not-with-purpose-dialog": TakeNoteWithPurposeDialog,
    "take-note-dialog": TakeNoteDialog
  },
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();

    const takeNoteWithPurposeDialogOpened = ref(false);
    const takeNoteDialogOpened = ref(false);

    const isCapturing = computed((): boolean => {
      return captureControlStore.isCapturing;
    });

    const open = () => {
      const sequence = operationHistoryStore.history.length;
      operationHistoryStore.selectOperation({ sequence, doScroll: false });
      operationHistoryStore.selectedOperationNote = { sequence, index: null };
      if (captureControlStore.testOption.shouldRecordTestPurpose) {
        takeNoteWithPurposeDialogOpened.value = true;
      } else {
        takeNoteDialogOpened.value = true;
      }
    };

    return {
      t: rootStore.message,
      takeNoteWithPurposeDialogOpened,
      takeNoteDialogOpened,
      isCapturing,
      open
    };
  }
});
</script>
