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
      :title="$t('common.confirm')"
      :message="$t('test-result-page.generate-screenshots')"
      :linkUrl="linkUrl"
      @close="dialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import DownloadLinkDialog from "@/components/molecules/DownloadLinkDialog.vue";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useRootStore } from "@/stores/root";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  components: {
    "download-link-dialog": DownloadLinkDialog
  },
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();

    const dialogOpened = ref(false);
    const processing = ref(false);
    const linkUrl = ref("");

    const obj = computed(() => {
      return {
        isDisabled: isDisabled.value,
        processing: processing.value,
        execute: execute
      };
    });

    const isDisabled = computed((): boolean => {
      return (
        isCapturing.value ||
        isReplaying.value ||
        isResuming.value ||
        processing.value ||
        !hasImageUrl.value
      );
    });

    const isCapturing = computed((): boolean => {
      return captureControlStore.isCapturing;
    });

    const isReplaying = computed((): boolean => {
      return captureControlStore.isReplaying;
    });

    const isResuming = computed((): boolean => {
      return captureControlStore.isResuming;
    });

    const testResultId = computed((): string => {
      return operationHistoryStore.testResultInfo.id;
    });

    const hasImageUrl = computed((): boolean => {
      const operation = operationHistoryStore.history.find(
        (item) => item.operation.imageFilePath !== ""
      );
      return operation ? true : false;
    });

    const execute = async () => {
      processing.value = true;
      try {
        rootStore.openProgressDialog({
          message: rootStore.message("test-result-page.export-screenshots")
        });
        const url = await operationHistoryStore.getScreenshots({
          testResultId: testResultId.value
        });
        rootStore.closeProgressDialog();
        linkUrl.value = rootStore.repositoryService
          ? `${rootStore.repositoryService.serviceUrl}/${url}`
          : "";
        dialogOpened.value = true;
      } catch (e) {
        rootStore.closeProgressDialog();
        console.error(e);
      } finally {
        processing.value = false;
      }
    };

    return {
      t: rootStore.message,
      dialogOpened,
      linkUrl,
      obj
    };
  }
});
</script>
