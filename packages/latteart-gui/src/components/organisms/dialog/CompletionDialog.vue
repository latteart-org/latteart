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
import { useCaptureControlStore } from "@/stores/captureControl";
import AlertDialog from "../../molecules/AlertDialog.vue";
import { computed, defineComponent, ref, watch } from "vue";

export default defineComponent({
  components: {
    "alert-dialog": AlertDialog
  },
  setup() {
    const captureControlStore = useCaptureControlStore();

    const opened = ref(false);

    const completionDialogData = computed(
      (): {
        title: string;
        message: string;
      } | null => {
        return captureControlStore.completionDialogData ?? null;
      }
    );

    watch(completionDialogData, () => {
      opened.value = !!captureControlStore.completionDialogData;
    });

    const title = computed((): string => {
      return completionDialogData.value?.title ?? "aa";
    });

    const message = computed((): string => {
      return completionDialogData.value?.message ?? "";
    });

    const close = async (): Promise<void> => {
      opened.value = false;
      await new Promise((s) => setTimeout(s, 300));
      captureControlStore.completionDialogData = null;
    };

    return {
      opened,
      title,
      message,
      close
    };
  }
});
</script>
