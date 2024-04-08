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
    :title="$t('test-result-page.generate-testscript-title')"
    @accept="
      execute();
      close();
    "
    @cancel="close()"
  >
    <script-generation-option v-if="isOptionDisplayed" @update="updateOption" />
  </execute-dialog>
</template>

<script lang="ts">
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import ScriptGenerationOption from "../common/ScriptGenerationOption.vue";
import { defineComponent, ref, toRefs, watch, nextTick } from "vue";
import { useRootStore } from "@/stores/root";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false }
  },
  components: {
    "execute-dialog": ExecuteDialog,
    "script-generation-option": ScriptGenerationOption
  },
  setup(props, context) {
    const rootStore = useRootStore();

    const isOptionDisplayed = ref<boolean>(false);

    const option = ref<{
      testScript: { isSimple: boolean; useMultiLocator: boolean };
      testData: { useDataDriven: boolean; maxGeneration: number };
      buttonDefinitions: {
        tagname: string;
        attribute?: { name: string; value: string };
      }[];
    }>({
      testScript: { isSimple: false, useMultiLocator: false },
      testData: { useDataDriven: false, maxGeneration: 0 },
      buttonDefinitions: []
    });

    const updateOption = (updateOption: {
      testScript: { isSimple: boolean; useMultiLocator: boolean };
      testData: { useDataDriven: boolean; maxGeneration: number };
      buttonDefinitions: {
        tagname: string;
        attribute?: { name: string; value: string };
      }[];
    }) => {
      option.value = updateOption;
    };

    const execute = (): void => {
      context.emit("execute", option.value);
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
      execute,
      close
    };
  }
});
</script>
