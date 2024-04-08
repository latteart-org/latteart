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
  <v-dialog max-width="500" persistent :model-value="opened">
    <v-card color="primary" dark>
      <v-card-text>
        {{ message }}
        <v-progress-linear
          indeterminate
          color="white"
          class="mb-0"
          :class="{ 'mt-0': !message }"
        ></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { useRootStore } from "@/stores/root";
import { computed, defineComponent } from "vue";

export default defineComponent({
  setup() {
    const rootStore = useRootStore();

    const opened = computed((): boolean => {
      return rootStore.progressDialog.opened;
    });

    const message = computed((): string => {
      return rootStore.progressDialog.message ?? "";
    });

    return {
      opened,
      message
    };
  }
});
</script>
