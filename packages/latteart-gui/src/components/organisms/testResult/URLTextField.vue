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
  <v-text-field
    :single-line="singleLine"
    :hide-details="hideDetails"
    label="URL"
    prepend-icon="open_in_browser"
    v-model="url"
    :disabled="isDisabled"
    id="urlTextField"
  ></v-text-field>
</template>

<script lang="ts">
import { useCaptureControlStore } from "@/stores/captureControl";
import { computed, defineComponent } from "vue";

export default defineComponent({
  props: {
    singleLine: { type: Boolean, default: false, required: true },
    hideDetails: { type: Boolean, default: false, required: true }
  },
  setup() {
    const captureControlStore = useCaptureControlStore();

    const isDisabled = computed((): boolean => {
      return isCapturing.value || isReplaying.value || isResuming.value;
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

    const url = computed({
      get: (): string => captureControlStore.url,
      set: (value: string) => {
        captureControlStore.url = value;
      }
    });

    return {
      isDisabled,
      url
    };
  }
});
</script>
