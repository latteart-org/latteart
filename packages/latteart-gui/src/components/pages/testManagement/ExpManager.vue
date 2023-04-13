<!--
 Copyright 2022 NTT Corporation.

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
  <v-app>
    <v-main>
      <router-view></router-view>
    </v-main>
    <config-viewer></config-viewer>
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
    <test-purpose-edit-dialog
      :opened="testPurposeEditDialogOpened"
      @close="testPurposeEditDialogOpened = false"
    />
    <note-register-dialog
      :opened="noteRegisterDialogOpened"
      @close="noteRegisterDialogOpened = false"
    />

    <note-update-dialog
      :opened="noteUpdateDialogOpened"
      @close="noteUpdateDialogOpened = false"
    />

    <context-menu
      :opened="contextMenuOpened"
      :x="contextMenuX"
      :y="contextMenuY"
      :items="contextMenuItems"
      @contextMenuClose="contextMenuOpened = false"
    />
    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :onAccept="confirmDialogAccept"
      @close="confirmDialogOpened = false"
    />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ConfigViewer from "@/components/pages/operationHistory/organisms/configViewer/ConfigViewer.vue";
import AlertDialog from "@/components/pages/common/AlertDialog.vue";
import ErrorMessageDialog from "@/components/pages/common/ErrorMessageDialog.vue";
import { OperationWithNotes } from "@/lib/operationHistory/types";
import TestPurposeEditDialog from "../common/TestPurposeEditDialog.vue";
import ConfirmDialog from "../common/ConfirmDialog.vue";
import ContextMenu from "@/components/molecules/ContextMenu.vue";
import NoteRegisterDialog from "../common/NoteRegisterDialog.vue";
import NoteUpdateDialog from "../common/NoteUpdateDialog.vue";

@Component({
  components: {
    "config-viewer": ConfigViewer,
    "alert-dialog": AlertDialog,
    "error-message-dialog": ErrorMessageDialog,
    "test-purpose-edit-dialog": TestPurposeEditDialog,
    "confirm-dialog": ConfirmDialog,
    "context-menu": ContextMenu,
    "note-register-dialog": NoteRegisterDialog,
    "note-update-dialog": NoteUpdateDialog,
  },
})
export default class Manager extends Vue {
  private isConfirmButtonDisabled = false;

  private errorMessageDialogOpened = false;
  private errorMessage = "";
  private testPurposeEditDialogOpened = false;
  private noteUpdateDialogOpened = false;
  private noteRegisterDialogOpened = false;

  private contextMenuOpened = false;
  private contextMenuX = -1;
  private contextMenuY = -1;
  private contextMenuItems: Array<{ label: string; onClick: () => void }> = [];

  private confirmDialogOpened = false;
  private confirmDialogTitle = "";
  private confirmDialogMessage = "";
  private confirmDialogAccept() {
    /* Do nothing */
  }

  public created(): void {
    (async () => {
      try {
        this.$store.dispatch("openProgressDialog");
        await this.$store.dispatch("testManagement/initialize");
      } catch (error) {
        console.error(error);
        if (!(error instanceof Error)) {
          throw error;
        }
        this.errorMessage = error.message;
        this.errorMessageDialogOpened = true;
      } finally {
        this.$nextTick(() => {
          this.$store.dispatch("closeProgressDialog");
        });
      }
    })();
  }

  private mounted() {
    this.$store.commit("operationHistory/setOpenNoteEditDialogFunction", {
      openNoteEditDialog: this.openNoteEditDialog,
    });
    this.$store.commit(
      "operationHistory/setOpenNoteDeleteConfirmDialogFunction",
      {
        openNoteDeleteConfirmDialog: this.openNoteDeleteConfirmDialog,
      }
    );
    this.$store.commit("operationHistory/setOpenNoteMenu", {
      menu: this.openNoteMenu,
    });

    this.$store.commit("operationHistory/setDeleteNoteFunction", {
      deleteNote: this.deleteNote,
    });
  }

  private openNoteMenu(
    note: { id: number; sequence: number; index: number; type: string },
    eventInfo: { clientX: number; clientY: number }
  ) {
    if ((this as any).$isViewerMode) {
      console.log("isViewerMode");
      return;
    }

    const context = this.$store;

    this.contextMenuX = eventInfo.clientX;
    this.contextMenuY = eventInfo.clientY;
    this.contextMenuItems = [];

    this.contextMenuItems.push({
      label: context.getters.message("history-view.edit-comment"),
      onClick: () => {
        if (context.state.operationHistory.tmpNoteInfoForEdit) {
          context.state.operationHistory.openNoteEditDialog(
            note.type,
            note.sequence,
            note.index
          );
        }

        this.contextMenuOpened = false;
        context.commit("operationHistory/setTmpNoteInfoForEdit", {
          tmpNoteInfoForEdit: null,
        });
      },
    });
    this.contextMenuItems.push({
      label: context.getters.message("history-view.delete-comment"),
      onClick: () => {
        if (context.state.operationHistory.tmpNoteInfoForEdit) {
          context.state.operationHistory.deleteNote(
            note.type,
            note.sequence,
            note.index
          );
        }

        this.contextMenuOpened = false;
        context.commit("operationHistory/setTmpNoteInfoForEdit", {
          tmpNoteInfoForEdit: null,
        });
      },
    });

    context.commit("operationHistory/setTmpNoteInfoForEdit", {
      tmpNoteInfoForEdit: {
        noteType: note.type,
        sequence: note.sequence,
        index: note.index,
      },
    });
    this.contextMenuOpened = true;
  }

  private openNoteEditDialog(
    noteType: string,
    sequence: number,
    index?: number
  ) {
    const historyItem: OperationWithNotes =
      this.$store.getters["operationHistory/findHistoryItem"](sequence);
    if (historyItem === undefined) {
      return;
    }
    switch (noteType) {
      case "intention":
        this.$store.commit("operationHistory/selectOperationNote", {
          selectedOperationNote: {
            sequence: sequence ?? null,
            index: index ?? null,
          },
        });
        this.testPurposeEditDialogOpened = true;
        return;
      case "bug":
      case "notice":
        this.$store.commit("operationHistory/selectOperationNote", {
          selectedOperationNote: {
            sequence: sequence ?? null,
            index: index ?? null,
          },
        });

        if (index !== undefined) {
          this.noteUpdateDialogOpened = true;
        } else {
          this.noteRegisterDialogOpened = true;
        }

        return;
      default:
        return;
    }
  }

  private openNoteDeleteConfirmDialog(
    noteType: string,
    title: string,
    sequence: number,
    index?: number
  ) {
    if (noteType === "intention") {
      this.confirmDialogTitle = this.$store.getters.message(
        "history-view.delete-intention"
      );
      this.confirmDialogMessage = this.$store.getters.message(
        "history-view.delete-intention-message",
        { value: title }
      );
    } else {
      this.confirmDialogTitle = this.$store.getters.message(
        "history-view.delete-notice-title"
      );
      this.confirmDialogMessage = this.$store.getters.message(
        "history-view.delete-notice-message",
        { value: title }
      );
    }

    this.confirmDialogAccept = () => {
      this.deleteNote(noteType, sequence, index ?? 0);
    };
    this.confirmDialogOpened = true;
  }

  private deleteNote(noteType: string, sequence: number, index: number) {
    (async () => {
      try {
        switch (noteType) {
          case "intention":
            this.$store.dispatch("operationHistory/deleteTestPurpose", {
              sequence,
            });
            return;
          case "bug":
          case "notice":
            this.$store.dispatch("operationHistory/deleteNotice", {
              sequence,
              index,
            });
            return;
          default:
            return;
        }
      } catch (error) {
        if (error instanceof Error) {
          this.errorMessageDialogOpened = true;
          this.errorMessage = error.message;
        } else {
          throw error;
        }
      }
    })();
  }
}
</script>

<style lang="sass">
.pre-wrap
  white-space: pre-wrap
.break-word
  word-wrap: break-word

@mixin ellipsis
  overflow: hidden !important
  text-overflow: ellipsis !important
  white-space: nowrap !important

.ellipsis
  @include ellipsis

.ellipsis_short
  @include ellipsis
  max-width: 200px
</style>
