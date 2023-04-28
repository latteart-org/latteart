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
        <v-list-item
          v-for="intention in intentionItems"
          :key="intention.label"
          @click="intention.onClick"
        >
          <v-list-item-title>{{ intention.label }}</v-list-item-title>
        </v-list-item>

        <v-subheader>{{ $store.getters.message("app.notice") }}</v-subheader>
        <v-list-item
          v-for="notice in noticeItems"
          :key="notice.label"
          @click="notice.onClick"
        >
          <v-list-item-title>{{ notice.label }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { NoteForGUI } from "@/lib/operationHistory/NoteForGUI";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";

@Component
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
    operation: OperationForGUI;
    bugs: NoteForGUI[] | null;
    notices: NoteForGUI[] | null;
    intention: NoteForGUI | null;
  } | null = null;
  private intentionItems: Array<{ label: string; onClick: () => void }> = [];
  private noticeItems: Array<{ label: string; onClick: () => void }> = [];

  private get show() {
    if (this.opened) {
      this.currentHistoryItem = this.$store.getters[
        "operationHistory/findHistoryItem"
      ](this.operationInfo.sequence);
      this.initializeIntentionMenu();
      this.initializeNoticesMenu();
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

    (this.currentHistoryItem?.bugs ?? []).forEach(
      (bug: NoteForGUI, i: number) => {
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
      }
    );

    (this.currentHistoryItem?.notices ?? []).forEach(
      (notice: NoteForGUI, i: number) => {
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
