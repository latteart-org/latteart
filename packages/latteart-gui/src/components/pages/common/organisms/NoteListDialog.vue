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
      <v-card
        flat
        class="pre-wrap break-word"
        v-for="(note, index) in noteWithTime"
        :key="index"
      >
        <v-card-title primary-title class="pb-0">
          <h3>
            {{ note.value }}
          </h3>
          <v-spacer></v-spacer>
          <div>
            {{ message("note-edit.target-sequence") }}
            {{ note.sequence }}
          </div>
        </v-card-title>
        <v-card-text>
          <note-tag-chip-group :tags="note.tags"></note-tag-chip-group>
          <v-textarea
            solo
            v-if="note.details"
            :value="note.details"
            :label="message('note-list-dialog.details')"
            readonly
          >
          </v-textarea>
          <video-display
            v-if="note.image.videoFrame"
            :videoUrl="note.videoUrl"
          />
          <v-img
            v-else-if="note.image.imageFileUrl"
            :src="note.image.imageFileUrl"
          />
        </v-card-text>
        <v-divider v-if="index + 1 !== noteWithTime.length"></v-divider>
      </v-card>
    </template>
    <template v-slot:footer>
      <v-spacer></v-spacer>
      <v-btn color="blue" dark @click="close()">{{
        message("common.ok")
      }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import ScrollableDialog from "@/components/molecules/ScrollableDialog.vue";
import { MessageProvider } from "@/lib/operationHistory/types";
import NoteTagChipGroup from "./NoteTagChipGroup.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import VideoDisplay from "@/components/molecules/VideoDisplay.vue";
import { VideoFrame } from "latteart-client";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
    "note-tag-chip-group": NoteTagChipGroup,
    "video-display": VideoDisplay,
  },
})
export default class NoteListDialog extends Vue {
  @Prop({ type: Boolean, default: false }) opened?: boolean;
  @Prop({ type: Array, default: [] }) notes?: {
    sequence: number;
    id: string;
    imageFileUrl: string;
    tags: string[];
    value: string;
    details: string;
    timestamp: number;
    image: { imageFileUrl?: string; videoFrame?: VideoFrame };
  }[];
  @Prop({ type: Function }) public readonly message!: MessageProvider;

  private get noteWithTime() {
    return this.notes
      ? this.notes.map((note) => {
          const time = note.image.videoFrame?.time ?? 0;
          const videoUrl = note.image.videoFrame?.url
            ? `${note.image.videoFrame.url}#t=${time}`
            : "";
          return { ...note, videoUrl };
        })
      : [];
  }

  private get operationHistoryState() {
    return this.$store.state.operationHistory as OperationHistoryState;
  }

  private close() {
    this.$emit("close");
  }
}
</script>
