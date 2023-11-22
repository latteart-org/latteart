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
import AlertDialog from "../../molecules/AlertDialog.vue";
import { CaptureControlState } from "@/store/captureControl";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  components: {
    "alert-dialog": AlertDialog,
  },
  setup() {
    const store = useStore();

    const opened = ref(false);

    const captureControlState = computed(() => {
      return (store.state as any).captureControl as CaptureControlState;
    });

    const completionDialogData = computed(
      (): {
        title: string;
        message: string;
      } | null => {
        opened.value = !!captureControlState.value?.completionDialogData;
        return captureControlState.value?.completionDialogData ?? null;
      }
    );

    const title = computed((): string => {
      return completionDialogData.value?.title ?? "aa";
    });

    const message = computed((): string => {
      return completionDialogData.value?.message ?? "";
    });

    const close = async (): Promise<void> => {
      opened.value = false;
      await new Promise((s) => setTimeout(s, 300));
      store.commit("captureControl/setCompletionDialog", null);
    };

    return {
      opened,
      title,
      message,
      close,
    };
  },
});
</script>
