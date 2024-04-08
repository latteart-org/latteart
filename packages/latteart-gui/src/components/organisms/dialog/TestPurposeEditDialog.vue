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
      :title="store.getters.message('app.record-intention')"
      @accept="
        saveTestPurpose();
        close();
      "
      @cancel="
        cancel();
        close();
      "
      :acceptButtonDisabled="!canSave"
    >
      <template>
        <number-field
          v-if="oldSequence !== null"
          :label="store.getters.message('note-edit.target-sequence')"
          :value="newTargetSequence"
          :minValue="1"
          :maxValue="maxSequence"
          @input="updateNewTargetSequence"
          :disabled="oldNote === ''"
        ></number-field>
        <p v-if="isSaveWarning" class="warningMessage">
          {{ store.getters.message("note-edit.save-warning") }}
        </p>
        <v-text-field
          :label="store.getters.message('note-edit.summary')"
          v-model="newNote"
        ></v-text-field>
        <v-textarea
          :label="store.getters.message('note-edit.details')"
          v-model="newNoteDetails"
        ></v-textarea>
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
import { OperationWithNotes } from "@/lib/operationHistory/types";
import NumberField from "@/components/molecules/NumberField.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true }
  },
  components: {
    "number-field": NumberField,
    "execute-dialog": ExecuteDialog,
    "error-message-dialog": ErrorMessageDialog
  },
  setup(props, context) {
    const store = useStore();

    const oldNote = ref("");
    const oldNoteDetails = ref("");
    const newNote = ref("");
    const newNoteDetails = ref("");
    const oldSequence = ref<number | null>(null);
    const newTargetSequence = ref<number | null>(null);
    const maxSequence = ref<number | null>(null);
    const oldIndex = ref<number | null>(null);

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const isSaveWarning = ref(false);

    const initialize = () => {
      if (!props.opened) {
        return;
      }

      const sequence = ((store.state as any).operationHistory as OperationHistoryState)
        .selectedOperationNote.sequence as number;
      const historyItem: OperationWithNotes =
        store.getters["operationHistory/findHistoryItem"](sequence);

      if (!historyItem || !historyItem.intention) {
        // new note
        oldNote.value = "";
        oldNoteDetails.value = "";
        oldIndex.value = null;
      } else {
        // update note
        oldNote.value = historyItem.intention.value;
        oldNoteDetails.value = historyItem.intention.details;
      }
      newNote.value = oldNote.value;
      newNoteDetails.value = oldNoteDetails.value;
      oldSequence.value = sequence;
      newTargetSequence.value = oldSequence.value;
      maxSequence.value = (
        (store.state as any).operationHistory as OperationHistoryState
      ).history.length;

      isSaveWarning.value = false;

      store.commit("operationHistory/selectOperationNote", {
        selectedOperationNote: { sequence: null, index: null }
      });
    };

    const saveTestPurpose = () => {
      const args: NoteEditInfo = {
        oldSequence: oldSequence.value ?? undefined,
        newSequence: newTargetSequence.value ?? undefined,
        note: newNote.value,
        noteDetails: newNoteDetails.value,
        shouldTakeScreenshot: false,
        tags: []
      };
      (async () => {
        try {
          if (oldNote.value === "") {
            await store.dispatch("operationHistory/addTestPurpose", {
              noteEditInfo: args
            });
          } else {
            await store.dispatch("operationHistory/editTestPurpose", {
              noteEditInfo: args
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

    const updateNewTargetSequence = (data: { id: string; value: number }): void => {
      newTargetSequence.value = data.value;
      isSaveWarning.value = checkDuplicatedBySequence();
    };

    const checkDuplicatedBySequence = (): boolean => {
      // case in add button.
      if (!oldSequence.value) {
        return false;
      }

      if (oldSequence.value === newTargetSequence.value) {
        return false;
      }

      for (const seq of collectTestPurposeSequences.value) {
        if (seq === newTargetSequence.value) {
          return true;
        }
      }
      return false;
    };

    const collectTestPurposeSequences = computed((): number[] => {
      const seqs = [];
      const history = ((store.state as any).operationHistory as OperationHistoryState).history;

      for (const operationWithNotes of history) {
        if (!operationWithNotes.intention) {
          continue;
        }
        seqs.push(operationWithNotes.operation.sequence);
      }
      return seqs;
    });

    const canSave = computed(() => {
      if (isSaveWarning.value) {
        return false;
      }

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

    const { opened } = toRefs(props);
    watch(opened, initialize);

    return {
      store,
      oldNote,
      newNote,
      newNoteDetails,
      oldSequence,
      newTargetSequence,
      maxSequence,
      errorMessageDialogOpened,
      errorMessage,
      isSaveWarning,
      saveTestPurpose,
      cancel,
      close,
      updateNewTargetSequence,
      canSave
    };
  }
});
</script>

<style lang="sass">
.warningMessage
  color: red !important
  font-size: 11px
  margin-top: -28px
</style>
