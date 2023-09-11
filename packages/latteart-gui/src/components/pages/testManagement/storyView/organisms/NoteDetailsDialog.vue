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
    :title="$store.getters.message('note-details-dialog.details')"
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
          <v-list-item-content>
            <v-list-item-title>{{
              $store.getters.message("note-details-dialog.summary")
            }}</v-list-item-title>
            <p class="break-all">{{ summary }}</p>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>{{
              $store.getters.message("note-details-dialog.details")
            }}</v-list-item-title>
            <p class="break-all pre-wrap">{{ details }}</p>
          </v-list-item-content>
        </v-list-item>

        <v-list-item class="mb-2">
          <v-list-item-content>
            <v-list-item-title>{{
              $store.getters.message("note-details-dialog.tags")
            }}</v-list-item-title>
            <v-combobox
              v-model="newTags"
              :hide-no-data="!search"
              :items="tagsItem"
              :search-input.sync="search"
              hide-selected
              multiple
              small-chips
              :readonly="isViewerMode"
            >
              <template v-slot:no-data>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      No results matching "<strong>{{ search }}</strong
                      >". Press <kbd>enter</kbd> to create a new one
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
              <template v-slot:selection="{ attrs, item, parent, selected }">
                <v-chip
                  v-if="item === Object(item)"
                  v-bind="attrs"
                  :color="item.color"
                  :input-value="selected"
                  small
                >
                  <span class="pr-2">{{ item.text }} </span>
                  <v-icon small @click="parent.selectItem(item)"
                    >$delete</v-icon
                  >
                </v-chip>
              </template>
            </v-combobox>
          </v-list-item-content>
        </v-list-item>

        <video-display v-if="videoUrl" :videoUrl="videoUrl" />
        <popup-image v-if="imageFilePath" :imageFileUrl="imageFilePath" />
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
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import PopupImage from "@/components/molecules/PopupImage.vue";
import {
  NoteTagItem,
  noteTagPreset,
} from "@/lib/operationHistory/NoteTagPreset";
import ErrorMessageDialog from "@/components/pages/common/ErrorMessageDialog.vue";
import VideoDisplay from "@/components/molecules/VideoDisplay.vue";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
    "popup-image": PopupImage,
    "error-message-dialog": ErrorMessageDialog,
    "video-display": VideoDisplay,
  },
})
export default class NoteDetailsDialog extends Vue {
  @Prop({ type: Boolean, default: false }) opened!: boolean;
  @Prop({ type: String, default: "" }) testResultId!: string;
  @Prop({ type: String, default: "" }) noteId!: string;
  @Prop({ type: String, default: "" }) summary!: string;
  @Prop({ type: String, default: "" }) details!: string;
  @Prop({ type: Array, default: [] }) tags!: string[];
  @Prop({ type: String, default: "" }) imageFilePath!: string;
  @Prop({ type: String, default: "" }) videoUrl!: string;

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private search = null;
  private newTags: NoteTagItem[] = [];
  private tagsItem = noteTagPreset.items;

  private isViewerMode = (this as any).$isViewerMode
    ? (this as any).$isViewerMode
    : false;

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }
    this.newTags = this.tags.map((tag) => {
      const targetTagItem = this.tagsItem.find((item) => item.text === tag);
      if (targetTagItem) {
        return targetTagItem;
      }

      return {
        text: tag,
        color: "#E0E0E0",
      };
    });
  }

  @Watch("newTags")
  private changeTags(val: NoteTagItem[], prev: NoteTagItem[]) {
    if (val.length === prev.length) return;

    this.newTags = val.map((v) => {
      if (typeof v === "string") {
        v = {
          text: v,
          color: "#E0E0E0",
        };

        this.newTags.push(v);
      }

      return v;
    });
  }

  private async execute() {
    try {
      await this.$store.dispatch("testManagement/updateNotes", {
        testResultId: this.testResultId,
        noteId: this.noteId,
        value: this.summary,
        details: this.details,
        tags: this.newTags.map((tag) => tag.text),
      });
    } catch (error) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
        this.errorMessageDialogOpened = true;
      } else {
        throw error;
      }
    }

    this.$emit("execute");
  }

  private close(): void {
    this.$emit("close");
  }
}
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
