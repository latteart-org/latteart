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
  <execute-dialog
    :opened="opened"
    :title="$t('note-details-dialog.details')"
    @accept="
      execute();
      close();
    "
    @cancel="close()"
    :acceptButtonDisabled="isViewerMode"
  >
    <v-list class="note-details-dialog">
      <v-list-item>
        <v-list-item-title>{{ $t("note-details-dialog.summary") }}</v-list-item-title>
        <p class="break-all">{{ summary }}</p>
      </v-list-item>

      <v-list-item>
        <v-list-item-title>{{ $t("note-details-dialog.details") }}</v-list-item-title>
        <p class="break-all pre-wrap">{{ details }}</p>
      </v-list-item>

      <v-list-item class="mb-2">
        <v-list-item-title>{{ $t("note-details-dialog.tags") }}</v-list-item-title>
        <note-tag-select-box v-model="newTags" :readonly="isViewerMode" />
      </v-list-item>

      <media-display-group
        v-if="isMediaDisplayed"
        :imageFileUrl="imageFilePath"
        :videoUrl="videoUrl"
      />
    </v-list>

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </execute-dialog>
</template>

<script lang="ts">
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { noteTagPreset } from "@/lib/operationHistory/NoteTagPreset";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import MediaDisplayGroup from "@/components/organisms/common/MediaDisplayGroup.vue";
import { defineComponent, ref, toRefs, watch, inject, nextTick, type PropType } from "vue";
import { useTestManagementStore } from "@/stores/testManagement";
import { useRootStore } from "@/stores/root";
import NoteTagSelectBox from "../common/NoteTagSelectBox.vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true },
    testResultId: { type: String, default: "", required: true },
    noteId: { type: String, default: "", required: true },
    summary: { type: String, default: "", required: true },
    details: { type: String, default: "", required: true },
    tags: {
      type: Array as PropType<string[]>,
      default: () => [],
      required: true
    },
    imageFilePath: { type: String, default: "", required: true },
    videoUrl: { type: String, default: "", required: true }
  },
  components: {
    "execute-dialog": ExecuteDialog,
    "error-message-dialog": ErrorMessageDialog,
    "media-display-group": MediaDisplayGroup,
    "note-tag-select-box": NoteTagSelectBox
  },
  setup(props, context) {
    const rootStore = useRootStore();
    const testManagementStore = useTestManagementStore();

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const search = ref(null);
    const newTags = ref<string[]>([]);
    const tagsItem = ref(noteTagPreset.items);

    const isViewerMode: boolean = inject("isViewerMode") ?? false;

    const isMediaDisplayed = ref<boolean>(false);

    const initialize = () => {
      if (!props.opened) {
        return;
      }
      newTags.value = props.tags;

      isMediaDisplayed.value = false;
      nextTick(() => {
        isMediaDisplayed.value = true;
      });
    };

    const execute = async () => {
      try {
        await testManagementStore.updateNotes({
          testResultId: props.testResultId,
          noteId: props.noteId,
          value: props.summary,
          details: props.details,
          tags: newTags.value.map((tag) => tag)
        });
      } catch (error) {
        if (error instanceof Error) {
          errorMessage.value = error.message;
          errorMessageDialogOpened.value = true;
        } else {
          throw error;
        }
      }

      context.emit("execute");
    };

    const close = (): void => {
      context.emit("close");
    };

    const { opened } = toRefs(props);
    watch(opened, initialize);

    return {
      t: rootStore.message,
      errorMessageDialogOpened,
      errorMessage,
      search,
      newTags,
      tagsItem,
      isViewerMode,
      isMediaDisplayed,
      execute,
      close
    };
  }
});
</script>

<style lang="sass" scoped>
.note-details-dialog
  .v-list__tile
    font-size: 12px
    height: auto
    padding: 4px 16px
  .v-list__tile__title
    font-size: 12px
    height: auto
    line-height: normal
  .break-all
    font-size: 12px
</style>
