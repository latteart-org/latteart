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
    :label="store.getters.message('app.test-result-name')"
    prepend-icon="save_alt"
    v-model="testResultName"
    @change="changeCurrentTestResultName"
    :disabled="isDisabled"
    id="outputDirectoryTextField"
  ></v-text-field>
</template>

<script lang="ts">
import { CaptureControlState } from "@/store/captureControl";
import { OperationHistoryState } from "@/store/operationHistory";
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  props: {
    singleLine: { type: Boolean, default: false, required: true },
    hideDetails: { type: Boolean, default: false, required: true },
  },
  setup() {
    const store = useStore();

    const isDisabled = computed((): boolean => {
      return isCapturing.value || isResuming.value;
    });

    const isCapturing = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState)
        .isCapturing;
    });

    const isResuming = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState)
        .isResuming;
    });

    const testResultName = computed({
      get: () =>
        ((store.state as any).operationHistory as OperationHistoryState)
          .testResultInfo.name,
      set: (name: string) => {
        store.commit("operationHistory/setTestResultName", { name });
      },
    });

    const changeCurrentTestResultName = () => {
      store.dispatch("operationHistory/changeCurrentTestResult", {
        startTime: null,
        initialUrl: "",
      });
    };

    return {
      store,
      isDisabled,
      testResultName,
      changeCurrentTestResultName,
    };
  },
});
</script>
