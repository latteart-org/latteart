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
      :title="store.getters.message('common.confirm')"
      :message="store.getters.message('test-result-page.generate-screenshots')"
      :linkUrl="linkUrl"
      @close="dialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import DownloadLinkDialog from "@/components/molecules/DownloadLinkDialog.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import { CaptureControlState } from "@/store/captureControl";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  components: {
    "download-link-dialog": DownloadLinkDialog,
  },
  setup() {
    const store = useStore();

    const dialogOpened = ref(false);
    const processing = ref(false);
    const linkUrl = ref("");

    const obj = computed(() => {
      return {
        isDisabled: isDisabled.value,
        processing: processing.value,
        execute: execute,
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
      return ((store.state as any).captureControl as CaptureControlState)
        .isCapturing;
    });

    const isReplaying = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState)
        .isReplaying;
    });

    const isResuming = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState)
        .isResuming;
    });

    const operationHistoryState = computed(() => {
      return (store.state as any).operationHistory as OperationHistoryState;
    });

    const testResultId = computed((): string => {
      return operationHistoryState.value.testResultInfo.id;
    });

    const hasImageUrl = computed((): boolean => {
      const operation = operationHistoryState.value.history.find(
        (item) => item.operation.imageFilePath !== ""
      );
      return operation ? true : false;
    });

    const execute = async () => {
      processing.value = true;
      try {
        store.dispatch("openProgressDialog", {
          message: store.getters.message("test-result-page.export-screenshots"),
        });
        const url = await store.dispatch("operationHistory/getScreenshots", {
          testResultId: testResultId.value,
        });
        store.dispatch("closeProgressDialog");
        linkUrl.value = `${store.state.repositoryService.serviceUrl}/${url}`;
        dialogOpened.value = true;
      } catch (e) {
        store.dispatch("closeProgressDialog");
        console.error(e);
      } finally {
        processing.value = false;
      }
    };

    return {
      store,
      dialogOpened,
      linkUrl,
      obj,
    };
  },
});
</script>
