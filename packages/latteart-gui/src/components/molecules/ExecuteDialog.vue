<!--
 Copyright 2024 NTT Corporation.

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
  <scrollable-dialog :opened="opened" :max-width="maxWidth">
    <template #title
      ><span :title="title">{{ title }}</span></template
    >
    <template #content>
      <slot />
    </template>
    <template #footer>
      <v-spacer></v-spacer>
      <v-btn
        variant="elevated"
        :disabled="disabled"
        :color="strong ? 'red' : 'blue'"
        @click="accept()"
        >{{ $t("common.ok") }}</v-btn
      >
      <v-btn variant="elevated" color="white" @click="cancel()">{{ $t("common.cancel") }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import ScrollableDialog from "@/components/molecules/ScrollableDialog.vue";
import { computed, defineComponent, ref, toRefs, watch } from "vue";

export default defineComponent({
  components: {
    "scrollable-dialog": ScrollableDialog
  },
  props: {
    opened: { type: Boolean, default: false, required: true },
    title: { type: String, default: "", required: true },
    acceptButtonDisabled: { type: Boolean, default: false },
    strong: { type: Boolean, default: false },
    maxWidth: { type: Number, default: 550 }
  },
  emits: ["accept", "cancel"],
  setup(props, context) {
    const isExecuted = ref(false);

    const disabled = computed(() => {
      return props.acceptButtonDisabled || isExecuted.value;
    });

    const changeOpenedDialog = (newValue: boolean) => {
      if (newValue) {
        isExecuted.value = false;
      }
    };

    const accept = (): void => {
      isExecuted.value = true;
      context.emit("accept");
    };

    const cancel = (): void => {
      context.emit("cancel");
    };

    const { opened } = toRefs(props);
    watch(opened, changeOpenedDialog);

    return { disabled, accept, cancel };
  }
});
</script>
