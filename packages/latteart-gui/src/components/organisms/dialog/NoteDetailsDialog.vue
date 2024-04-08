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
    :title="store.getters.message('note-details-dialog.details')"
    @accept="
      execute();
      close();
    "
    @cancel="close()"
    :acceptButtonDisabled="isViewerMode"
  >
    <template>
      <v-list class="note-details-dialog">
        <v-list-item>
          <v-list-item-title>{{
            store.getters.message("note-details-dialog.summary")
          }}</v-list-item-title>
          <p class="break-all">{{ summary }}</p>
        </v-list-item>

        <v-list-item>
          <v-list-item-title>{{
            store.getters.message("note-details-dialog.details")
          }}</v-list-item-title>
          <p class="break-all pre-wrap">{{ details }}</p>
        </v-list-item>

        <v-list-item class="mb-2">
          <v-list-item-title>{{
            store.getters.message("note-details-dialog.tags")
          }}</v-list-item-title>
          <v-combobox
            v-model="newTags"
            :hide-no-data="!search"
            :items="tagsItem"
            v-model:search-input="search"
            hide-selected
            hide-details
            multiple
            small-chips
            :readonly="isViewerMode"
          >
            <template v-slot:no-data>
              <v-list-item>
                <v-list-item-title>
                  No results matching "<strong>{{ search }}</strong
                  >". Press <kbd>enter</kbd> to create a new one
                </v-list-item-title>
              </v-list-item>
            </template>
            <template v-slot:selection="{ attrs, item, parent, selected }">
              <v-chip
                v-if="item === Object(item)"
                v-bind="attrs"
                :color="item.color"
                :model-value="selected"
                size="small"
              >
                <span class="pr-2">{{ item.text }} </span>
                <v-icon size="small" @click="parent.selectItem(item)">$delete</v-icon>
              </v-chip>
            </template>
          </v-combobox>
        </v-list-item>

        <media-display-group
          v-if="isMediaDisplayed"
          :imageFileUrl="imageFilePath"
          :videoUrl="videoUrl"
        />
      </v-list>
    </template>
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </execute-dialog>
</template>

<script lang="ts">
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { NoteTagItem, noteTagPreset } from "@/lib/operationHistory/NoteTagPreset";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import MediaDisplayGroup from "@/components/organisms/common/MediaDisplayGroup.vue";
import { defineComponent, ref, toRefs, watch, inject, nextTick } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true },
    testResultId: { type: String, default: "", required: true },
    noteId: { type: String, default: "", required: true },
    summary: { type: String, default: "", required: true },
    details: { type: String, default: "", required: true },
    tags: {
      type: Array as PropType<string[]>,
      default: [],
      required: true
    },
    imageFilePath: { type: String, default: "", required: true },
    videoUrl: { type: String, default: "", required: true }
  },
  components: {
    "execute-dialog": ExecuteDialog,
    "error-message-dialog": ErrorMessageDialog,
    "media-display-group": MediaDisplayGroup
  },
  setup(props, context) {
    const store = useStore();

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const search = ref(null);
    const newTags = ref<NoteTagItem[]>([]);
    const tagsItem = ref(noteTagPreset.items);

    const isViewerMode = inject("isViewerMode") ?? false;

    const isMediaDisplayed = ref<boolean>(false);

    const initialize = () => {
      if (!props.opened) {
        return;
      }
      newTags.value = props.tags.map((tag) => {
        const targetTagItem = tagsItem.value.find((item) => item.text === tag);
        if (targetTagItem) {
          return targetTagItem;
        }

        return {
          text: tag,
          color: "#E0E0E0"
        };
      });

      isMediaDisplayed.value = false;
      nextTick(() => {
        isMediaDisplayed.value = true;
      });
    };

    const changeTags = (val: NoteTagItem[], prev: NoteTagItem[]) => {
      if (val.length === prev.length) return;

      newTags.value = val.map((v) => {
        if (typeof v === "string") {
          v = {
            text: v,
            color: "#E0E0E0"
          };

          newTags.value.push(v);
        }

        return v;
      });
    };

    const execute = async () => {
      try {
        await store.dispatch("testManagement/updateNotes", {
          testResultId: props.testResultId,
          noteId: props.noteId,
          value: props.summary,
          details: props.details,
          tags: newTags.value.map((tag) => tag.text)
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
    watch(newTags, changeTags);

    return {
      store,
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
