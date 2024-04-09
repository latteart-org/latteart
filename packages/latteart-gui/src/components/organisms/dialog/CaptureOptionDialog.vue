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
  <execute-dialog
    :opened="opened"
    :title="$t('start-capture-page.title')"
    @accept="
      execute();
      close();
    "
    @cancel="close()"
    :acceptButtonDisabled="isOkButtonDisabled"
  >
    <capture-option v-if="isOptionDisplayed" @update="updateOption" />
  </execute-dialog>
</template>

<script lang="ts">
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { type CaptureOptionParams } from "@/lib/common/captureOptionParams";
import CaptureOption from "@/components/organisms/common/CaptureOption.vue";
import { computed, defineComponent, ref, toRefs, watch, nextTick } from "vue";
import { useRootStore } from "@/stores/root";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false }
  },
  components: {
    "execute-dialog": ExecuteDialog,
    "capture-option": CaptureOption
  },
  setup(props, context) {
    const rootStore = useRootStore();

    const isOptionDisplayed = ref<boolean>(false);
    const captureOption = ref<CaptureOptionParams>({
      url: "",
      testResultName: "",
      platform: "PC",
      device: { deviceName: "", modelNumber: "", osVersion: "" },
      waitTimeForStartupReload: 0,
      browser: "Chrome",
      mediaType: "image",
      shouldRecordTestPurpose: false,
      firstTestPurpose: "",
      firstTestPurposeDetails: ""
    });

    const updateOption = (option: CaptureOptionParams) => {
      captureOption.value = option;
    };

    const isOkButtonDisabled = computed(() => {
      return !captureOption.value.url || !isUrlValid.value;
    });

    const isUrlValid = computed((): boolean => {
      try {
        new URL(captureOption.value.url);
        return true;
      } catch (error) {
        return false;
      }
    });

    const execute = (): void => {
      context.emit("execute", captureOption.value);
    };

    const close = (): void => {
      context.emit("close");
    };

    const rerenderOption = () => {
      if (props.opened) {
        isOptionDisplayed.value = false;
        nextTick(() => {
          isOptionDisplayed.value = true;
        });
      }
    };

    const { opened } = toRefs(props);
    watch(opened, rerenderOption);

    return {
      t: rootStore.message,
      isOptionDisplayed,
      updateOption,
      isOkButtonDisabled,
      execute,
      close
    };
  }
});
</script>
