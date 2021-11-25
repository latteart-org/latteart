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
    <scrollable-dialog :opened="confirmOpened">
      <template v-slot:title>{{ title }}</template>
      <template v-slot:content>
        <span class="pre-wrap break-word">{{ confirmMessage }}</span>
      </template>
      <template v-slot:footer>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="isExecuting"
          :loading="isExecuting"
          color="red"
          :dark="!isExecuting"
          @click="execute()"
          >{{ $store.getters.message("common.ok") }}</v-btn
        >
        <v-btn
          v-if="!isExecuting"
          color="white"
          @click="
            cancel();
            close();
          "
          >{{ $store.getters.message("common.cancel") }}</v-btn
        >
        <v-btn
          v-if="isExecuting"
          color="white"
          :disabled="isCanceling"
          :loading="isCanceling"
          @click="cancelExecution()"
          >{{ $store.getters.message("common.cancel") }}</v-btn
        >
      </template>
    </scrollable-dialog>

    <alert-dialog
      :opened="alertDialogOpened"
      :title="title"
      :message="alertDialogMessage"
      @close="
        complete();
        close();
      "
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ScrollableDialog from "@/vue/molecules/ScrollableDialog.vue";
import AlertDialog from "@/vue/pages/common/AlertDialog.vue";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
    "alert-dialog": AlertDialog,
  },
})
export default class SyncConfirmDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({ type: String, default: "" }) public readonly title!: string;
  @Prop({ type: String, default: "" }) public readonly message!: string;
  @Prop({ type: String, default: "" }) public readonly progressMessage!: string;
  @Prop({ type: String, default: "" }) public readonly resultMessage!: string;
  @Prop(Function) public readonly onExecute!: () => Promise<string>;
  @Prop(Function) public readonly oncancelExecution!: () => Promise<string>;

  private isExecuting = false;
  private isCanceling = false;
  private confirmOpened = false;
  private confirmMessage = "";
  private alertDialogOpened = false;
  private alertDialogMessage = "";

  @Watch("opened")
  private initialize(): void {
    if (!this.opened) {
      this.alertDialogOpened = false;
      this.confirmOpened = false;
      return;
    }

    this.isExecuting = false;
    this.isCanceling = false;
    this.alertDialogOpened = false;
    this.confirmMessage = this.message;
    this.confirmOpened = true;
  }

  private execute(): void {
    if (this.isExecuting) {
      return;
    }

    this.isExecuting = true;
    if (this.progressMessage) {
      this.confirmMessage = this.progressMessage;
    }

    (async () => {
      const replyMessage = await this.onExecute();

      this.alertDialogMessage = replyMessage
        ? replyMessage
        : this.resultMessage;
      this.confirmOpened = false;
      this.alertDialogOpened = true;
    })();
  }

  private cancelExecution(): void {
    this.isCanceling = true;
    (async () => {
      if (this.oncancelExecution) {
        await this.oncancelExecution();
      }
    })();
  }

  private cancel(): void {
    this.$emit("cancel");
  }

  private complete(): void {
    this.$emit("complete");
  }

  private close(): void {
    this.$emit("close");
  }
}
</script>
