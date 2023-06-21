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
  <scrollable-dialog :opened="opened">
    <template v-slot:title>{{
      $store.getters.message("note-ditails-dialog.details")
    }}</template>
    <template v-slot:content>
      <v-list class="note-details-dialog">
        <v-list-item v-if="isNote">
          <v-list-item-content>
            <v-list-item-title>{{
              $store.getters.message("note-ditails-dialog.status")
            }}</v-list-item-title>
            <p class="break-all">{{ status }}</p>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>{{
              $store.getters.message("note-ditails-dialog.summary")
            }}</v-list-item-title>
            <p class="break-all">{{ summary }}</p>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>{{
              $store.getters.message("note-ditails-dialog.details")
            }}</v-list-item-title>
            <p class="break-all pre-wrap">{{ details }}</p>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="tags.length > 0 && isNote" class="mb-2">
          <v-list-item-content>
            <v-list-item-title>{{
              $store.getters.message("note-ditails-dialog.tags")
            }}</v-list-item-title>
            <note-tag-chip-group :tags="tags"></note-tag-chip-group>
          </v-list-item-content>
        </v-list-item>
        <popup-image v-if="isNote" :imageFileUrl="imageFilePath" />
      </v-list>
    </template>
    <template v-slot:footer>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-btn color="primary" text @click="close()">{{
        $store.getters.message("common.close")
      }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import PopupImage from "@/components/molecules/PopupImage.vue";
import ScrollableDialog from "@/components/molecules/ScrollableDialog.vue";
import NoteTagChipGroup from "@/components/pages/common/organisms/NoteTagChipGroup.vue";
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
    "note-tag-chip-group": NoteTagChipGroup,
    "popup-image": PopupImage,
  },
})
export default class NoteDetailsDialog extends Vue {
  @Prop({ type: Boolean, default: false }) opened!: boolean;
  @Prop({ type: String, default: "" }) type!: string;
  @Prop({ type: String, default: "" }) status!: string;
  @Prop({ type: String, default: "" }) summary!: string;
  @Prop({ type: String, default: "" }) details!: string;
  @Prop({ type: Array, default: [] }) tags!: string[];
  @Prop({ type: String, default: "" }) imageFilePath!: string;

  private get isNote() {
    return this.type !== "intention";
  }

  private close() {
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
