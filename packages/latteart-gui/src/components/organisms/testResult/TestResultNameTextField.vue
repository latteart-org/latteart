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
    :label="$t('app.test-result-name')"
    prepend-icon="save_alt"
    v-model="testResultName"
    @change="changeCurrentTestResultName"
    :disabled="isDisabled"
    id="outputDirectoryTextField"
  ></v-text-field>
</template>

<script lang="ts">
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useRootStore } from "@/stores/root";
import { computed, defineComponent } from "vue";

export default defineComponent({
  props: {
    singleLine: { type: Boolean, default: false, required: true },
    hideDetails: { type: Boolean, default: false, required: true }
  },
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();

    const isDisabled = computed((): boolean => {
      return isCapturing.value || isResuming.value;
    });

    const isCapturing = computed((): boolean => {
      return captureControlStore.isCapturing;
    });

    const isResuming = computed((): boolean => {
      return captureControlStore.isResuming;
    });

    const testResultName = computed({
      get: () => operationHistoryStore.testResultInfo.name,
      set: (name: string) => {
        operationHistoryStore.testResultInfo.name = name;
      }
    });

    const changeCurrentTestResultName = () => {
      operationHistoryStore.changeCurrentTestResult({
        startTime: null,
        initialUrl: ""
      });
    };

    return {
      t: rootStore.message,
      isDisabled,
      testResultName,
      changeCurrentTestResultName
    };
  }
});
</script>
