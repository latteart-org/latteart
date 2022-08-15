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
  <div>
    <v-menu
      v-model="show"
      :position-x="x"
      :position-y="y"
      top
      close-on-click
      close-on-content-click
    >
      <v-list subheader>
        <v-subheader>{{ $store.getters.message("app.intention") }}</v-subheader>
        <v-list-tile
          v-for="intention in intentionItems"
          :key="intention.label"
          @click="intention.onClick"
        >
          <v-list-tile-title>{{ intention.label }}</v-list-tile-title>
        </v-list-tile>

        <v-subheader>{{ $store.getters.message("app.notice") }}</v-subheader>
        <v-list-tile
          v-for="notice in noticeItems"
          :key="notice.label"
          @click="notice.onClick"
        >
          <v-list-tile-title>{{ notice.label }}</v-list-tile-title>
        </v-list-tile>

        <v-divider></v-divider>

        <v-subheader>{{ $store.getters.message("app.replay") }}</v-subheader>
        <v-list-tile
          v-for="replay in replayItems"
          :key="replay.label"
          @click="replay.onClick"
          :disabled="replay.disabled"
        >
          <v-list-tile-title>{{ replay.label }}</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
    <information-message-dialog
      :opened="informationMessageDialogOpened"
      :title="$store.getters.message('replay.done-title')"
      :message="informationMessage"
      @close="informationMessageDialogOpened = false"
    />
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Note } from "@/lib/operationHistory/Note";
import { Operation } from "@/lib/operationHistory/Operation";
import ErrorMessageDialog from "@/vue/pages/common/ErrorMessageDialog.vue";
import InformationMessageDialog from "@/vue/pages/common/InformationMessageDialog.vue";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "information-message-dialog": InformationMessageDialog,
  },
})
export default class OperationContextMenu extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({ type: Number, default: 0 }) public readonly x!: number;
  @Prop({ type: Number, default: 0 }) public readonly y!: number;
  @Prop({ type: Object, default: { sequence: -1, selectedSequences: [] } })
  public readonly operationInfo!: {
    sequence: number;
    selectedSequences: number[];
  };

  private currentHistoryItem: {
    operation: Operation;
    bugs: Note[] | null;
    notices: Note[] | null;
    intention: Note | null;
  } | null = null;
  private intentionItems: Array<{ label: string; onClick: () => void }> = [];
  private noticeItems: Array<{ label: string; onClick: () => void }> = [];
  private replayItems: Array<{
    label: string;
    onClick: () => void;
    disabled: boolean;
  }> = [];
  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private informationMessageDialogOpened = false;
  private informationMessage = "";

  private get show() {
    if (this.opened) {
      this.currentHistoryItem = this.$store.getters[
        "operationHistory/findHistoryItem"
      ](this.operationInfo.sequence);
      this.initializeIntentionMenu();
      this.initializeNoticesMenu();
      this.initializeReplayMenu();
    }

    return this.opened;
  }
  private set show(opened) {
    if (!opened) {
      this.$emit("operationContextMenuClose");
    }
  }

  private initializeIntentionMenu() {
    this.intentionItems = [];

    this.intentionItems.push({
      label: this.$store.getters.message("history-view.edit-intention"),
      onClick: () => {
        this.$store.state.operationHistory.openNoteEditDialog(
          "intention",
          this.operationInfo.sequence
        );
      },
    });
    if (this.currentHistoryItem?.intention) {
      this.intentionItems.push({
        label: this.$store.getters.message("history-view.delete-intention"),
        onClick: () => {
          this.$store.state.operationHistory.openNoteDeleteConfirmDialog(
            "intention",
            this.currentHistoryItem?.intention?.value ?? "",
            this.operationInfo.sequence
          );
        },
      });
    }
  }

  private initializeNoticesMenu() {
    this.noticeItems = [];

    this.noticeItems.push({
      label: this.$store.getters.message("history-view.add-notice"),
      onClick: () => {
        this.$store.state.operationHistory.openNoteEditDialog(
          "notice",
          this.operationInfo.sequence
        );
      },
    });

    (this.currentHistoryItem?.bugs ?? []).forEach((bug: Note, i: number) => {
      const value = bug.value;
      this.noticeItems.push({
        label: this.$store.getters.message("history-view.edit-bug", {
          value,
        }),
        onClick: () => {
          this.$store.state.operationHistory.openNoteEditDialog(
            "bug",
            this.operationInfo.sequence,
            i
          );
        },
      });
      this.noticeItems.push({
        label: this.$store.getters.message("history-view.delete-notice", {
          value,
        }),
        onClick: () => {
          this.$store.state.operationHistory.openNoteDeleteConfirmDialog(
            "bug",
            bug.value,
            this.operationInfo.sequence,
            i
          );
        },
      });
    });

    (this.currentHistoryItem?.notices ?? []).forEach(
      (notice: Note, i: number) => {
        const value = notice.value;
        this.noticeItems.push({
          label: this.$store.getters.message("history-view.edit-notice", {
            value,
          }),
          onClick: () => {
            this.$store.state.operationHistory.openNoteEditDialog(
              "notice",
              this.operationInfo.sequence,
              i
            );
          },
        });
        this.noticeItems.push({
          label: this.$store.getters.message("history-view.delete-notice", {
            value,
          }),
          onClick: () => {
            this.$store.state.operationHistory.openNoteDeleteConfirmDialog(
              "notice",
              notice.value,
              this.operationInfo.sequence,
              i
            );
          },
        });
      }
    );
  }

  private initializeReplayMenu(): void {
    this.replayItems = [];

    const operations: Operation[] =
      this.$store.getters["operationHistory/getOperations"]();
    const disabled = !!(
      this.$store.state.captureControl.isReplaying ||
      this.$store.state.captureControl.isCapturing ||
      this.$store.state.captureControl.isResuming
    );

    this.replayItems.push({
      label: this.$store.getters.message("history-view.auto-play-to", {
        value: this.operationInfo.sequence,
      }),
      onClick: async () => {
        const extractOperations = operations.slice(
          0,
          this.operationInfo.sequence
        );
        try {
          await this.$store.dispatch("captureControl/replayOperations", {
            operations: extractOperations,
          });

          this.informationMessageDialogOpened = true;
          this.informationMessage = this.$store.getters.message(
            `replay.done-run-operations`
          );
        } catch (error) {
          if (!(error instanceof Error)) {
            throw error;
          }
          this.errorMessageDialogOpened = true;
          this.errorMessage = error.message;
        }
      },
      disabled,
    });

    this.replayItems.push({
      label: this.$store.getters.message("history-view.auto-play-from", {
        value: this.operationInfo.sequence,
      }),
      onClick: async () => {
        const extractOperations = operations.slice(
          this.operationInfo.sequence - 1
        );
        try {
          await this.$store.dispatch("captureControl/replayOperations", {
            operations: extractOperations,
          });

          this.informationMessageDialogOpened = true;
          this.informationMessage = this.$store.getters.message(
            `replay.done-run-operations`
          );
        } catch (error) {
          if (!(error instanceof Error)) {
            throw error;
          }
          this.errorMessageDialogOpened = true;
          this.errorMessage = error.message;
        }
      },
      disabled,
    });

    if (
      this.operationInfo.selectedSequences.includes(this.operationInfo.sequence)
    ) {
      const from = this.operationInfo.selectedSequences[0];
      const to =
        this.operationInfo.selectedSequences[
          this.operationInfo.selectedSequences.length - 1
        ];
      this.replayItems.push({
        label: this.$store.getters.message("history-view.auto-play-from-to", {
          value1: from,
          value2: to,
        }),
        onClick: async () => {
          const extractOperations = operations.slice(from - 1, to);
          try {
            await this.$store.dispatch("captureControl/replayOperations", {
              operations: extractOperations,
            });

            this.informationMessageDialogOpened = true;
            this.informationMessage = this.$store.getters.message(
              `replay.done-run-operations`
            );
          } catch (error) {
            if (!(error instanceof Error)) {
              throw error;
            }
            this.errorMessageDialogOpened = true;
            this.errorMessage = error.message;
          }
        },
        disabled,
      });
    }
  }
}
</script>

<style lang="sass">
.v-list__tile
  font-size: 12px
  height: auto
  padding: 4px 16px

.v-list__tile__title
  height: auto
  line-height: normal

.v-list > .v-subheader
  font-size: 12px
  font-weight: 700
  height: auto
  padding: 4px 8px

.v-list > .v-subheader:first-child
  padding-top: 8px
</style>
