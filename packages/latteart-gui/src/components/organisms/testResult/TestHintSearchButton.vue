<!--
 Copyright 2025 NTT Corporation.

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
  <div :title="$t('test-hint-search-button.details')">
    <v-list-item :disabled="isDisabled" @click="open">
      <v-list-item-title>{{ $t("test-hint-search-button.title") }}</v-list-item-title>
    </v-list-item>
  </div>

  <test-hint-search-dialog :opened="opened" @close="opened = false" />
</template>

<script lang="ts">
import TestHintSearchDialog from "@/components/organisms/dialog/TestHintSearchDialog.vue";
import { computed, defineComponent, ref } from "vue";
import { useCaptureControlStore } from "@/stores/captureControl";

export default defineComponent({
  components: {
    "test-hint-search-dialog": TestHintSearchDialog
  },
  setup() {
    const captureControlStore = useCaptureControlStore();

    const opened = ref(false);

    const isDisabled = computed((): boolean => {
      return !captureControlStore.isCapturing || captureControlStore.isRunning;
    });

    const open = () => {
      opened.value = true;
    };

    return { opened, isDisabled, open };
  }
});
</script>
