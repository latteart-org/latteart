<!--
 Copyright 2024 NTT Corporation.

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
      :target="[x, y]"
      location="top"
      :persistent="false"
      close-on-content-click
    >
      <v-list>
        <v-list-subheader>{{ $t("common.test-purpose") }}</v-list-subheader>
        <v-list-item
          v-for="intention in intentionItems"
          :key="intention.label"
          prepend-icon="event_note"
          append-icon="keyboard_arrow_right"
          slim
          @click="intention.onClick"
        >
          <v-list-item-title>{{ intention.label }}</v-list-item-title>
          <v-menu
            v-if="intention.subItems.length > 0"
            location="end"
            :open-on-focus="false"
            activator="parent"
            open-on-hover
            submenu
            close-on-content-click
          >
            <v-list>
              <v-list-item
                v-for="(menu, index) in intention.subItems"
                :key="index"
                :prepend-icon="menu.icon"
                slim
                @click="menu.onClick"
              >
                <v-list-item-title>{{ menu.label }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item>
        <v-list-item
          v-if="intentionItems.length === 0"
          prepend-icon="add"
          slim
          @click="editIntention"
        >
          <v-list-item-title>{{ $t("common.add") }}</v-list-item-title>
        </v-list-item>

        <v-list-subheader>{{ $t("common.notice") }}</v-list-subheader>
        <v-list-item
          v-for="notice in noticeItems"
          :key="notice.label"
          prepend-icon="announcement"
          append-icon="keyboard_arrow_right"
          slim
          @click="notice.onClick"
        >
          <v-list-item-title>{{ notice.label }}</v-list-item-title>
          <v-menu
            location="end"
            :open-on-focus="false"
            activator="parent"
            open-on-hover
            submenu
            close-on-content-click
          >
            <v-list>
              <v-list-item
                v-for="(menu, index) in notice.subItems"
                :key="index"
                :prepend-icon="menu.icon"
                slim
                @click="menu.onClick"
              >
                <v-list-item-title>{{ menu.label }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item>
        <v-list-item prepend-icon="add" slim @click="addNote">
          <v-list-item-title>{{ $t("common.add") }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
import { NoteForGUI } from "@/lib/operationHistory/NoteForGUI";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useRootStore } from "@/stores/root";
import { computed, defineComponent, ref, type PropType } from "vue";

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
      default: () => {
        return { sequence: -1, selectedSequences: [] };
      },
      required: true
    }
  },
  emits: ["operationContextMenuClose"],
  setup(props, context) {
    const t = useRootStore().message;
    const operationHistoryStore = useOperationHistoryStore();

    const editIntention = () => {
      operationHistoryStore.openNoteEditDialog("intention", props.operationInfo.sequence);
    };

    const addNote = () => {
      operationHistoryStore.openNoteEditDialog("notice", props.operationInfo.sequence);
    };

    const currentHistoryItem = ref<{
      operation: OperationForGUI;
      notices: NoteForGUI[] | null;
      intention: NoteForGUI | null;
    } | null>(null);

    const intentionItems = computed(
      (): {
        label: string;
        onClick: () => void;
        subItems: { label: string; icon: string; onClick: () => void }[];
      }[] => {
        const deleteIntention = () => {
          operationHistoryStore.openNoteDeleteConfirmDialog(
            "intention",
            currentHistoryItem.value?.intention?.value ?? "",
            props.operationInfo.sequence
          );
        };

        if (!currentHistoryItem.value?.intention) {
          return [];
        }

        return [
          {
            label: currentHistoryItem.value?.intention?.value ?? "",
            onClick: editIntention,
            subItems: [
              { label: t("common.details"), icon: "edit", onClick: editIntention },
              { label: t("common.delete"), icon: "delete", onClick: deleteIntention }
            ]
          }
        ];
      }
    );

    const noticeItems = computed(
      (): {
        label: string;
        onClick: () => void;
        subItems: { label: string; icon: string; onClick: () => void }[];
      }[] => {
        return (currentHistoryItem.value?.notices ?? []).map((notice: NoteForGUI, i: number) => {
          const editNote = () => {
            operationHistoryStore.openNoteEditDialog("notice", props.operationInfo.sequence, i);
          };
          const deleteNote = () => {
            operationHistoryStore.openNoteDeleteConfirmDialog(
              "notice",
              notice.value,
              props.operationInfo.sequence,
              i
            );
          };

          return {
            label: notice.value,
            onClick: editNote,
            subItems: [
              { label: t("common.details"), icon: "edit", onClick: editNote },
              { label: t("common.delete"), icon: "delete", onClick: deleteNote }
            ]
          };
        });
      }
    );

    const updateCurrentHistoryItem = (value: any) => {
      currentHistoryItem.value = value;
    };

    const show = computed({
      get: () => {
        if (props.opened) {
          updateCurrentHistoryItem(
            operationHistoryStore.findHistoryItem(props.operationInfo.sequence)
          );
        }

        return props.opened;
      },
      set: (opened) => {
        if (!opened) {
          context.emit("operationContextMenuClose");
        }
      }
    });

    return {
      intentionItems,
      noticeItems,
      show,
      addNote,
      editIntention
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
