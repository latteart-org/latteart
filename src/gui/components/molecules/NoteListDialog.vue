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
  <scrollable-dialog :opened="opened" :maxWidth="800">
    <template v-slot:title>
      <span>{{ message("note-list-dialog.note-list") }}</span>
    </template>
    <template v-slot:content>
      <v-card
        flat
        class="pre-wrap break-word"
        v-for="(note, index) in notes"
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
          <v-chip
            v-for="(tag, index) in note.tags"
            :key="index"
            :color="getTagsColor(tag)"
            >{{ tag }}</v-chip
          >
          <v-textarea
            solo
            auto-grow
            v-if="note.details"
            :value="note.details"
            :label="message('note-list-dialog.details')"
            readonly
          >
          </v-textarea>
          <v-img :src="note.imageFilePath" />
        </v-card-text>
        <v-divider v-if="index + 1 !== notes.length"></v-divider>
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
import {
  MessageProvider,
  OperationWithNotes,
} from "@/lib/operationHistory/types";
import { noteTagPreset } from "@/lib/operationHistory/NoteTagPreset";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
  },
})
export default class NoteListDialog extends Vue {
  @Prop({ type: Boolean, default: false }) opened?: boolean;
  @Prop({ type: Array, default: [] }) testSteps?: OperationWithNotes[];
  @Prop({ type: Function }) public readonly message!: MessageProvider;

  private bugColor = "";
  private reportedColor = "";
  private invalidColor = "";
  private tagsColor = noteTagPreset.items.map((item) => {
    if (item.name === "bug") {
      this.bugColor = item.color;
    } else if (item.name === "reported") {
      this.reportedColor = item.color;
    } else if (item.name === "invalid") {
      this.invalidColor = item.color;
    }
  });

  private close() {
    this.$emit("close");
  }

  private get notes() {
    return (
      this.testSteps?.flatMap((testStep) => {
        return (
          testStep.notices?.map(
            ({ value, details, sequence, tags, imageFilePath }) => {
              return {
                value,
                details,
                tags,
                sequence,
                imageFilePath:
                  imageFilePath || testStep.operation.imageFilePath,
              };
            }
          ) ?? []
        );
      }) ?? []
    );
  }

  private getTagsColor(tag: string) {
    return tag === "bug"
      ? this.bugColor
      : tag === "reported"
      ? this.reportedColor
      : tag === "invalid"
      ? this.invalidColor
      : "";
  }
}
</script>
