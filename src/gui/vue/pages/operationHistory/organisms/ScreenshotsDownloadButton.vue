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
  <div>
    <v-btn
      v-if="buttonMode"
      :disabled="isDisabled"
      color="primary"
      :loading="processing"
      :dark="!processing"
      @click="execute"
    >
      {{ $store.getters.message("history-view.export-screenshots") }}
    </v-btn>
    <v-list-tile v-else @click="execute" :disabled="isDisabled">
      <v-list-tile-title>{{
        $store.getters.message("history-view.export-screenshots")
      }}</v-list-tile-title>
    </v-list-tile>

    <download-link-dialog
      :opened="dialogOpened"
      :title="$store.getters.message('common.confirm')"
      :message="$store.getters.message('history-view.generate-screenshots')"
      :linkUrl="linkUrl"
      @close="dialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import DownloadLinkDialog from "@/vue/pages/common/DownloadLinkDialog.vue";

@Component({
  components: {
    "download-link-dialog": DownloadLinkDialog,
  },
})
export default class ScreenshotsDownloadButton extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly buttonMode!: boolean;

  private dialogOpened = false;
  private processing = false;
  private linkUrl = "";

  private get isDisabled(): boolean {
    return (
      this.$store.getters["operationHistory/getOperations"]().length === 0 ||
      this.processing
    );
  }

  private get testResultId(): string {
    return this.$store.state.operationHistory.testResultInfo.id;
  }

  private async execute() {
    this.processing = true;
    try {
      const url = await this.$store.dispatch(
        "operationHistory/getScreenshots",
        { testResultId: this.testResultId }
      );
      this.linkUrl = `${this.$store.state.repositoryContainer.serviceUrl}/${url}`;
      this.dialogOpened = true;
    } finally {
      this.processing = false;
    }
  }
}
</script>
