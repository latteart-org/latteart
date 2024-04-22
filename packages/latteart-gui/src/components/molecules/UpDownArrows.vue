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
  <div @click="stopPropagation">
    <v-btn size="small" variant="text" icon class="ma-0 pa-0" :disabled="upDisabled" @click="up"
      ><v-icon>arrow_drop_up</v-icon></v-btn
    >
    <v-btn size="small" variant="text" icon class="ma-0 pa-0" :disabled="downDisabled" @click="down"
      ><v-icon>arrow_drop_down</v-icon></v-btn
    >
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    index: { type: Number, default: null },
    upDisabled: { type: Boolean, default: false },
    downDisabled: { type: Boolean, default: false }
  },
  setup(props, context) {
    const up = (): void => {
      context.emit("up", props.index);
    };

    const down = (): void => {
      context.emit("down", props.index);
    };

    const stopPropagation = (e: Event): void => {
      e.stopPropagation();
      e.preventDefault();
    };

    return { up, down, stopPropagation };
  }
});
</script>
