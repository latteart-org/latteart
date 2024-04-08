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
      location="top"
      :persistent="false"
      close-on-content-click
    >
      <v-list subheader>
        <v-subheader>{{ store.getters.message("app.intention") }}</v-subheader>
        <v-list-item
          v-for="intention in intentionItems"
          :key="intention.label"
          @click="intention.onClick"
        >
          <v-list-item-title>{{ intention.label }}</v-list-item-title>
        </v-list-item>

        <v-subheader>{{ store.getters.message("app.notice") }}</v-subheader>
        <v-list-item v-for="notice in noticeItems" :key="notice.label" @click="notice.onClick">
          <v-list-item-title>{{ notice.label }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
import { NoteForGUI } from "@/lib/operationHistory/NoteForGUI";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { OperationHistoryState } from "@/store/operationHistory";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true },
    x: { type: Number, default: 0, required: true },
    y: { type: Number, default: 0, required: true },
    operationInfo: {
      type: Object as PropType<{
        sequence: number;
        selectedSequences: number[];
      }>,
      default: { sequence: -1, selectedSequences: [] },
      required: true
    }
  },
  setup(props, context) {
    const store = useStore();

    const currentHistoryItem = ref<{
      operation: OperationForGUI;
      bugs: NoteForGUI[] | null;
      notices: NoteForGUI[] | null;
      intention: NoteForGUI | null;
    } | null>(null);
    const intentionItems = ref<{ label: string; onClick: () => void }[]>([]);
    const noticeItems = ref<{ label: string; onClick: () => void }[]>([]);

    const show = computed({
      get: () => {
        if (props.opened) {
          currentHistoryItem.value = store.getters["operationHistory/findHistoryItem"](
            props.operationInfo.sequence
          );
          initializeIntentionMenu();
          initializeNoticesMenu();
        }

        return props.opened;
      },
      set: (opened) => {
        if (!opened) {
          context.emit("operationContextMenuClose");
        }
      }
    });

    const initializeIntentionMenu = () => {
      intentionItems.value = [];

      intentionItems.value.push({
        label: store.getters.message("test-result-page.edit-intention"),
        onClick: () => {
          ((store.state as any).operationHistory as OperationHistoryState).openNoteEditDialog(
            "intention",
            props.operationInfo.sequence
          );
        }
      });
      if (currentHistoryItem.value?.intention) {
        intentionItems.value.push({
          label: store.getters.message("test-result-page.delete-intention"),
          onClick: () => {
            (
              (store.state as any).operationHistory as OperationHistoryState
            ).openNoteDeleteConfirmDialog(
              "intention",
              currentHistoryItem.value?.intention?.value ?? "",
              props.operationInfo.sequence
            );
          }
        });
      }
    };

    const initializeNoticesMenu = () => {
      noticeItems.value = [];

      noticeItems.value.push({
        label: store.getters.message("test-result-page.add-notice"),
        onClick: () => {
          ((store.state as any).operationHistory as OperationHistoryState).openNoteEditDialog(
            "notice",
            props.operationInfo.sequence
          );
        }
      });
      (currentHistoryItem.value?.bugs ?? []).forEach((bug: NoteForGUI, i: number) => {
        const value = bug.value;
        noticeItems.value.push({
          label: store.getters.message("test-result-page.edit-bug", {
            value
          }),
          onClick: () => {
            ((store.state as any).operationHistory as OperationHistoryState).openNoteEditDialog(
              "bug",
              props.operationInfo.sequence,
              i
            );
          }
        });
        noticeItems.value.push({
          label: store.getters.message("test-result-page.delete-notice", {
            value
          }),
          onClick: () => {
            (
              (store.state as any).operationHistory as OperationHistoryState
            ).openNoteDeleteConfirmDialog("bug", bug.value, props.operationInfo.sequence, i);
          }
        });
      });
      (currentHistoryItem.value?.notices ?? []).forEach((notice: NoteForGUI, i: number) => {
        const value = notice.value;
        noticeItems.value.push({
          label: store.getters.message("test-result-page.edit-notice", {
            value
          }),
          onClick: () => {
            ((store.state as any).operationHistory as OperationHistoryState).openNoteEditDialog(
              "notice",
              props.operationInfo.sequence,
              i
            );
          }
        });
        noticeItems.value.push({
          label: store.getters.message("test-result-page.delete-notice", {
            value
          }),
          onClick: () => {
            (
              (store.state as any).operationHistory as OperationHistoryState
            ).openNoteDeleteConfirmDialog("notice", notice.value, props.operationInfo.sequence, i);
          }
        });
      });
    };

    return {
      store,
      intentionItems,
      noticeItems,
      show
    };
  }
});
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
