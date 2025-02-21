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
  <div
    v-for="menu in menus"
    :key="menu.name"
    :title="$t(menu.title)"
    :class="{ 'disabled-menu': isDisabled }"
  >
    <component :is="menu.name" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { extensions } from "@/extensions";
import { useCaptureControlStore } from "@/stores/captureControl";
export default defineComponent({
  setup() {
    const captureControlStore = useCaptureControlStore();

    const isDisabled = computed((): boolean => {
      return captureControlStore.isReplaying || captureControlStore.isRunning;
    });
    return {
      isDisabled,
      menus: [...extensions.flatMap(({ components }) => components.menus ?? [])]
    };
  }
});
</script>

<style lang="sass" scoped>
.disabled-menu
  pointer-events: none
  opacity: 0.6
</style>
