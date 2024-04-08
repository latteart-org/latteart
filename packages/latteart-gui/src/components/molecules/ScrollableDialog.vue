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
  <v-dialog
    scrollable
    persistent
    max-height="800"
    :max-width="maxWidth"
    v-model="openedDialog"
    :transition="noTransition ? false : 'dialog-transition'"
    :fullscreen="fullscreen"
    @keydown="cancelKeydown"
  >
    <v-card>
      <v-card-title class="text-h5" primary-title>
        <slot name="title"></slot>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pt-2" :style="{ height: 'calc(100% - 48px - 48px)' }">
        <div>
          <slot name="content"></slot>
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <slot name="footer"></slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs, watch } from "vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false },
    fullscreen: { type: Boolean, default: false },
    noTransition: { type: Boolean, default: false },
    title: { type: String, default: "" },
    content: { type: String, default: "" },
    footer: { type: String, default: "" },
    maxWidth: { type: Number, default: 500 }
  },
  setup(props) {
    const openedDialog = ref(false);

    const changeOpenedDialog = (newValue: boolean) => {
      setTimeout(() => {
        openedDialog.value = newValue;
      }, 100);
    };

    const cancelKeydown = (event: Event) => {
      event.stopPropagation();
    };

    const { opened } = toRefs(props);
    watch(opened, changeOpenedDialog);
    (() => {
      if (props.opened) {
        changeOpenedDialog(props.opened);
      }
    })();

    return { openedDialog, cancelKeydown };
  }
});
</script>
