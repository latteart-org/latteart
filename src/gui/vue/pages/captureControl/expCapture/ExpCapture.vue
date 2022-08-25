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
    <v-toolbar color="white" fixed flat app height="64px">
      <capture-tool-header />
    </v-toolbar>

    <v-content>
      <v-container
        fluid
        pa-0
        fill-height
        :style="{ 'max-height': 'calc(100vh - 64px - 64px)' }"
      >
        <router-view />
      </v-container>
    </v-content>

    <v-footer app height="auto" mt-5>
      <capture-tool-footer />
    </v-footer>

    <intention-edit-dialog
      :opened="intentionEditDialogOpened"
      @close="intentionEditDialogOpened = false"
    />
    <bug-edit-dialog
      :opened="bugEditDialogOpened"
      @close="bugEditDialogOpened = false"
    />
    <notice-edit-dialog
      :opened="noticeEditDialogOpened"
      @close="noticeEditDialogOpened = false"
    />

    <autofill-select-dialog />
    <autofill-register-dialog />

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

    <error-message-dialog
      :opened="errorDialogOpened"
      :message="errorDialogMessage"
      @close="errorDialogOpened = false"
    />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { OperationWithNotes } from "@/lib/operationHistory/types";
import IntentionEditDialog from "@/vue/pages/common/IntentionEditDialog.vue";
import BugEditDialog from "@/vue/pages/common/BugEditDialog.vue";
import NoticeEditDialog from "@/vue/pages/common/NoticeEditDialog.vue";
import ContextMenu from "@/vue/molecules/ContextMenu.vue";
import CaptureToolHeader from "./organisms/captureToolHeader/CaptureToolHeader.vue";
import CaptureToolFooter from "./organisms/captureToolFooter/CaptureToolFooter.vue";
import ConfirmDialog from "../../common/ConfirmDialog.vue";
import ErrorMessageDialog from "../../common/ErrorMessageDialog.vue";
import AutofillSelectDialog from "@/vue/pages/common/AutofillSelectDialog.vue";
import AutofillRegisterDialog from "@/vue/pages/common/AutofillRegisterDialog.vue";

@Component({
  components: {
    "capture-tool-header": CaptureToolHeader,
    "capture-tool-footer": CaptureToolFooter,
    "intention-edit-dialog": IntentionEditDialog,
    "bug-edit-dialog": BugEditDialog,
    "notice-edit-dialog": NoticeEditDialog,
    "context-menu": ContextMenu,
    "confirm-dialog": ConfirmDialog,
    "error-message-dialog": ErrorMessageDialog,
    "autofill-select-dialog": AutofillSelectDialog,
    "autofill-register-dialog": AutofillRegisterDialog,
  },
})
export default class ExpCapture extends Vue {
  private intentionEditDialogOpened = false;
  private bugEditDialogOpened = false;
  private noticeEditDialogOpened = false;

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

  private errorDialogOpened = false;
  private errorDialogMessage = "";

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
        "history-view.delete-notice-title",
        { value: title }
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
        this.intentionEditDialogOpened = true;
        return;
      case "bug":
        this.$store.commit("operationHistory/selectOperationNote", {
          selectedOperationNote: {
            sequence: sequence ?? null,
            index: index ?? null,
          },
        });
        this.bugEditDialogOpened = true;
        return;
      case "notice":
        this.$store.commit("operationHistory/selectOperationNote", {
          selectedOperationNote: {
            sequence: sequence ?? null,
            index: index ?? null,
          },
        });
        this.noticeEditDialogOpened = true;
        return;
      default:
        return;
    }
  }

  private deleteNote(noteType: string, sequence: number, index: number) {
    (async () => {
      try {
        switch (noteType) {
          case "intention":
            await this.$store.dispatch("operationHistory/deleteIntention", {
              sequence,
            });

            return;
          case "bug":
            await this.$store.dispatch("operationHistory/deleteBug", {
              sequence,
              index,
            });

            return;
          case "notice":
            await this.$store.dispatch("operationHistory/deleteNotice", {
              sequence,
              index,
            });

            return;
          default:
            return;
        }
      } catch (error) {
        if (error instanceof Error) {
          this.errorDialogOpened = true;
          this.errorDialogMessage = error.message;
        } else {
          throw error;
        }
      }
    })();
  }
}
</script>

<style lang="sass" scoped>
html
  overflow: hidden
</style>

<style lang="sass">
#windowHandlesSelectedBox
  max-height: 50px !important
</style>
