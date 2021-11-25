<!--
 Copyright 2021 NTT Corporation.

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
    <v-btn
      :class="[shadowMode ? 'px-0, mx-1' : '']"
      :disabled="disabled"
      color="green"
      :dark="!disabled"
      @click="open"
      fab
      small
      :title="buttonText"
    >
      <v-icon>{{ buttonIcon }}</v-icon>
    </v-btn>

    <note-edit-dialog
      :opened="noteEditDialogOpened"
      @close="noteEditDialogOpened = false"
    />
    <notice-edit-dialog
      :opened="noticeEditDialogOpened"
      @close="noticeEditDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import NoteEditDialog from "@/vue/pages/common/NoteEditDialog.vue";
import NoticeEditDialog from "@/vue/pages/common/NoticeEditDialog.vue";

@Component({
  components: {
    "note-edit-dialog": NoteEditDialog,
    "notice-edit-dialog": NoticeEditDialog,
  },
})
export default class NoteRegisterButton extends Vue {
  @Prop({ type: String, default: "" }) public readonly buttonText!: string;
  @Prop({ type: String, default: "" }) public readonly buttonIcon!: string;
  @Prop({ type: Boolean, default: false }) public readonly disabled!: boolean;
  @Prop({ type: Boolean, default: false }) public readonly shadowMode!: boolean;

  private noteEditDialogOpened = false;
  private noticeEditDialogOpened = false;

  private open() {
    if (this.$store.state.captureControl.testOption.shouldRecordTestPurpose) {
      this.noteEditDialogOpened = true;
    } else {
      this.noticeEditDialogOpened = true;
    }
  }
}
</script>
