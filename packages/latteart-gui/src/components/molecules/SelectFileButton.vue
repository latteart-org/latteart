<!--
 Copyright 2025 NTT Corporation.

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
  <div class="d-flex align-center">
    <v-btn class="mr-2" @click="($refs.fileInput as HTMLInputElement).click()">
      <slot />
    </v-btn>
    <input
      ref="fileInput"
      type="file"
      style="display: none"
      :accept="accept"
      @change="selectFile"
    />

    <div :style="{ 'overflow-wrap': 'anywhere' }">{{ detailsMessage }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    accept: { type: String },
    detailsMessage: { type: String, default: "" }
  },
  emits: ["select"],
  setup(_, context) {
    const selectFile = (event: Event): void => {
      if (!event.target) {
        return;
      }

      const target = event.target as HTMLInputElement;

      const targetFile = (target.files ?? [])[0];

      target.value = "";

      context.emit("select", targetFile);
    };

    return { selectFile };
  }
});
</script>
