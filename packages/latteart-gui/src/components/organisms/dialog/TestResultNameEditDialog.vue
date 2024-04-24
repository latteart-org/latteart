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
    <execute-dialog
      :opened="opened"
      :title="$t('test-result-list.edit')"
      :accept-button-disabled="okButtonIsDisabled"
      @accept="
        execute();
        close();
      "
      @cancel="
        cancel();
        close();
      "
    >
      <v-text-field v-model="testResultName" variant="underlined"></v-text-field>
    </execute-dialog>
  </div>
</template>

<script lang="ts">
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { computed, defineComponent, ref, toRefs, watch } from "vue";

export default defineComponent({
  components: {
    "execute-dialog": ExecuteDialog
  },
  props: {
    opened: { type: Boolean, default: false, required: true },
    oldTestResultName: { type: String, default: "", required: true }
  },
  setup(props, context) {
    const testResultName = ref("");

    const okButtonIsDisabled = computed(() => {
      return !testResultName.value;
    });

    const initialize = () => {
      if (!props.opened) {
        return;
      }

      testResultName.value = props.oldTestResultName;
    };

    const execute = () => {
      context.emit("execute", testResultName.value);
    };

    const cancel = (): void => {
      context.emit("cancel");
    };

    const close = (): void => {
      context.emit("close");
    };

    const { opened } = toRefs(props);
    watch(opened, initialize);

    return {
      testResultName,
      okButtonIsDisabled,
      execute,
      cancel,
      close
    };
  }
});
</script>
