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
  <alert-dialog
    :opened="opened"
    :title="title"
    :message="message"
    :iconOpts="{ text: 'info', color: 'blue' }"
    @close="close()"
  />
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import AlertDialog from "../../molecules/AlertDialog.vue";
import { CaptureControlState } from "@/store/captureControl";

@Component({
  components: {
    "alert-dialog": AlertDialog,
  },
})
export default class CompletionDialog extends Vue {
  private opened = false;

  private get captureControlState() {
    return this.$store.state.captureControl as CaptureControlState;
  }

  private get completionDialogData(): {
    title: string;
    message: string;
  } | null {
    this.opened = !!this.captureControlState?.completionDialogData;
    return this.captureControlState?.completionDialogData ?? null;
  }

  private get title(): string {
    return this.completionDialogData?.title ?? "aa";
  }

  private get message(): string {
    return this.completionDialogData?.message ?? "";
  }

  private async close(): Promise<void> {
    this.opened = false;
    await new Promise((s) => setTimeout(s, 300));
    this.$store.commit("captureControl/setCompletionDialog", null);
  }
}
</script>
