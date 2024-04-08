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
  <scrollable-dialog :opened="opened" :maxWidth="800">
    <template v-slot:title>
      <span>{{ message("note-list-dialog.note-list") }}</span>
    </template>
    <template v-slot:content>
      <v-card flat class="pre-wrap break-word" v-for="(note, index) in noteWithTime" :key="index">
        <v-card-title primary-title class="pb-0">
          <h3>
            {{ note.value }}
          </h3>
          <v-spacer></v-spacer>
          <div>
            <span class="label">{{ `${message("test-result-page.test-result-name")}:` }}</span>
            <span class="value">{{ note.testResultName }}</span>
            <span class="label">{{ `${message("note-edit.target-sequence")}:` }}</span>
            <span class="label">{{ note.sequence }}</span>
          </div>
        </v-card-title>
        <v-card-text>
          <note-tag-chip-group :tags="note.tags"></note-tag-chip-group>
          <v-textarea
            variant="solo"
            v-if="note.details"
            :model-value="note.details"
            :label="message('note-list-dialog.details')"
            readonly
          >
          </v-textarea>

          <media-display-group
            v-if="isMediaDisplayed"
            :imageFileUrl="note.image.imageFileUrl"
            :videoUrl="note.videoUrl"
            :message="message"
          />
        </v-card-text>
        <v-divider v-if="index + 1 !== noteWithTime.length"></v-divider>
      </v-card>
    </template>
    <template v-slot:footer>
      <v-spacer></v-spacer>
      <v-btn color="blue" dark @click="close()">{{ message("common.ok") }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import ScrollableDialog from "@/components/molecules/ScrollableDialog.vue";
import { MessageProvider } from "@/lib/operationHistory/types";
import NoteTagChipGroup from "@/components/organisms/common/NoteTagChipGroup.vue";
import { VideoFrame } from "latteart-client";
import MediaDisplayGroup from "@/components/organisms/common/MediaDisplayGroup.vue";
import { computed, defineComponent, ref, toRefs, watch, nextTick } from "vue";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false },
    notes: {
      type: Array as PropType<
        {
          sequence: number;
          id: string;
          tags: string[];
          value: string;
          details: string;
          timestamp: number;
          testResultName: string;
          image: { imageFileUrl?: string; videoFrame?: VideoFrame };
        }[]
      >,
      default: []
    },
    message: {
      type: Function as PropType<MessageProvider>,
      required: true
    }
  },
  components: {
    "scrollable-dialog": ScrollableDialog,
    "note-tag-chip-group": NoteTagChipGroup,
    "media-display-group": MediaDisplayGroup
  },
  setup(props, context) {
    const isMediaDisplayed = ref<boolean>(false);

    const rerenderMediaDisplay = () => {
      if (props.opened) {
        isMediaDisplayed.value = false;
        nextTick(() => {
          isMediaDisplayed.value = true;
        });
      }
    };

    const noteWithTime = computed(() => {
      return props.notes
        ? props.notes.map((note) => {
            const time = note.image.videoFrame?.time ?? 0;
            const videoUrl = note.image.videoFrame?.url
              ? `${note.image.videoFrame.url}#t=${time}`
              : "";
            return { ...note, videoUrl };
          })
        : [];
    });

    const close = (): void => {
      context.emit("close");
    };

    const { opened } = toRefs(props);
    watch(opened, rerenderMediaDisplay);

    return {
      isMediaDisplayed,
      noteWithTime,
      close
    };
  }
});
</script>

<style lang="sass" scoped>
.value
  font-size: medium
  font-weight: normal
  margin-left: 8px
.label
  font-size: medium
  font-weight: normal
  margin-left: 16px
</style>
