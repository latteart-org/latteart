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
    :title="title"
    @accept="
      accept();
      close();
    "
    @cancel="
      cancel();
      close();
    "
    strong
  >
    <span class="pre-wrap break-word">{{ message }}</span>
  </execute-dialog>
</template>

<script lang="ts">
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true },
    title: { type: String, default: "", required: true },
    message: { type: String, default: "", required: true },
    onAccept: { type: Function as PropType<() => void>, required: true }
  },
  components: {
    "execute-dialog": ExecuteDialog
  },
  setup(props, context) {
    const accept = (): void => {
      props.onAccept();
    };

    const cancel = (): void => {
      context.emit("cancel");
    };

    const close = (): void => {
      context.emit("close");
    };

    return { accept, cancel, close };
  }
});
</script>
