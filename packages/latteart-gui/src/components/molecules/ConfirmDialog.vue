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
    :title="title"
    @accept="
      accept();
      close();
    "
    @cancel="
      cancel();
      close();
    "
    strong
  >
    <template>
      <span class="pre-wrap break-word">{{ message }}</span>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
  },
})
export default class ConfirmDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({ type: String, default: "" }) public readonly title!: string;
  @Prop({ type: String, default: "" }) public readonly message!: string;
  @Prop(Function) public readonly onAccept!: () => void;

  private accept(): void {
    this.onAccept();
  }

  private cancel(): void {
    this.$emit("cancel");
  }

  private close(): void {
    this.$emit("close");
  }
}
</script>
