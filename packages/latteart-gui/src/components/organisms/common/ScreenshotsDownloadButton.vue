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
  <div>
    <slot v-bind:obj="obj"> </slot>

    <download-link-dialog
      :opened="dialogOpened"
      :title="$store.getters.message('common.confirm')"
      :message="$store.getters.message('test-result-page.generate-screenshots')"
      :linkUrl="linkUrl"
      @close="dialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import DownloadLinkDialog from "@/components/molecules/DownloadLinkDialog.vue";
import { OperationHistoryState } from "@/store/operationHistory";

@Component({
  components: {
    "download-link-dialog": DownloadLinkDialog,
  },
})
export default class ScreenshotsDownloadButton extends Vue {
  private dialogOpened = false;
  private processing = false;
  private linkUrl = "";

  private get obj() {
    return {
      isDisabled: this.isDisabled,
      processing: this.processing,
      execute: this.execute,
    };
  }

  private get isDisabled(): boolean {
    return (
      this.isCapturing ||
      this.isReplaying ||
      this.isResuming ||
      this.processing ||
      !this.hasImageUrl
    );
  }

  private get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  private get isReplaying(): boolean {
    return this.$store.state.captureControl.isReplaying;
  }

  private get isResuming(): boolean {
    return this.$store.state.captureControl.isResuming;
  }

  private get operationHistoryState() {
    return this.$store.state.operationHistory as OperationHistoryState;
  }

  private get testResultId(): string {
    return this.operationHistoryState.testResultInfo.id;
  }

  private get hasImageUrl(): boolean {
    const operation = this.operationHistoryState.history.find(
      (item) => item.operation.imageFilePath !== ""
    );
    return operation ? true : false;
  }

  private async execute() {
    this.processing = true;
    try {
      this.$store.dispatch("openProgressDialog", {
        message: this.$store.getters.message(
          "test-result-page.export-screenshots"
        ),
      });
      const url = await this.$store.dispatch(
        "operationHistory/getScreenshots",
        { testResultId: this.testResultId }
      );
      this.$store.dispatch("closeProgressDialog");
      this.linkUrl = `${this.$store.state.repositoryService.serviceUrl}/${url}`;
      this.dialogOpened = true;
    } catch (e) {
      this.$store.dispatch("closeProgressDialog");
      console.error(e);
    } finally {
      this.processing = false;
    }
  }
}
</script>