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
    <v-content>
      <router-view></router-view>
    </v-content>
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
    <bug-edit-dialog
      :opened="bugEditDialogOpened"
      @close="bugEditDialogOpened = false"
    />
    <notice-edit-dialog
      :opened="noticeEditDialogOpened"
      @close="noticeEditDialogOpened = false"
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
import ConfigViewer from "@/vue/pages/operationHistory/organisms/configViewer/ConfigViewer.vue";
import AlertDialog from "@/vue/pages/common/AlertDialog.vue";
import ErrorMessageDialog from "@/vue/pages/common/ErrorMessageDialog.vue";
import { OperationWithNotes } from "@/lib/operationHistory/types";
import TestPurposeEditDialog from "../common/TestPurposeEditDialog.vue";
import BugEditDialog from "../common/BugEditDialog.vue";
import NoticeEditDialog from "../common/NoticeEditDialog.vue";
import ConfirmDialog from "../common/ConfirmDialog.vue";

@Component({
  components: {
    "config-viewer": ConfigViewer,
    "alert-dialog": AlertDialog,
    "error-message-dialog": ErrorMessageDialog,
    "test-purpose-edit-dialog": TestPurposeEditDialog,
    "bug-edit-dialog": BugEditDialog,
    "notice-edit-dialog": NoticeEditDialog,
    "confirm-dialog": ConfirmDialog,
  },
})
export default class Manager extends Vue {
  private isConfirmButtonDisabled = false;

  private errorMessageDialogOpened = false;
  private errorMessage = "";
  private testPurposeEditDialogOpened = false;
  private bugEditDialogOpened = false;
  private noticeEditDialogOpened = false;

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
    switch (noteType) {
      case "intention":
        this.$store.dispatch("operationHistory/deleteTestPurpose", {
          sequence,
        });
        return;
      case "bug":
        this.$store.dispatch("operationHistory/deleteBug", { sequence, index });
        return;
      case "notice":
        this.$store.dispatch("operationHistory/deleteNotice", {
          sequence,
          index,
        });
        return;
      default:
        return;
    }
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
