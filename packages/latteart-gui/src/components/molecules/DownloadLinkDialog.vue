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
  <scrollable-dialog :opened="opened">
    <template #title>
      <v-icon v-if="!!iconText" class="mr-2" size="large" :color="iconColor">{{ iconText }}</v-icon>
      <span>{{ title }}</span>
    </template>
    <template #content>
      <span class="pre-wrap break-word">{{ message }}</span>
      <a :href="linkUrl" class="px-2" :download="downloadFileName">{{ downloadLinkMessage }}</a>
      <p v-if="alertMessage" class="pre-wrap break-word alert-message">
        {{ alertMessage }}
      </p>
    </template>
    <template #footer>
      <v-spacer></v-spacer>
      <v-btn color="blue" variant="elevated" @click="close()">{{ $t("common.close") }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import ScrollableDialog from "@/components/molecules/ScrollableDialog.vue";
import { useRootStore } from "@/stores/root";
import { defineComponent, ref, toRefs, watch, type PropType } from "vue";

export default defineComponent({
  components: {
    "scrollable-dialog": ScrollableDialog
  },
  props: {
    opened: { type: Boolean, default: false, required: true },
    title: { type: String, default: "", required: true },
    message: { type: String, default: "", required: true },
    alertMessage: { type: String, default: "" },
    linkUrl: { type: String, default: "" },
    downloadFileName: { type: String, default: "" },
    iconOpts: {
      type: Object as PropType<{ text: string; color?: string } | null>
    },
    downloadMessage: { type: String, default: "" }
  },
  setup(props, context) {
    const rootStore = useRootStore();

    const iconText = ref("");
    const iconColor = ref("");
    const downloadLinkMessage = ref("");

    const initialize = () => {
      if (!props.opened) {
        return;
      }

      if (props.downloadMessage) {
        downloadLinkMessage.value = props.downloadMessage;
      } else {
        downloadLinkMessage.value = rootStore.message("common.download-link");
      }

      if (props.iconOpts) {
        iconText.value = props.iconOpts.text;
        iconColor.value = props.iconOpts.color ?? "";
      } else {
        iconText.value = "";
        iconColor.value = "";
      }
    };

    const close = (): void => {
      context.emit("close");
    };

    const { opened } = toRefs(props);
    watch(opened, initialize);

    return { iconText, iconColor, downloadLinkMessage, close };
  }
});
</script>

<style lang="sass">
.alert-message
  color: red
  font-size: small
</style>
