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
  <v-container fluid fill-height pa-0>
    <iframe
      style="width: 100%; height: 100%"
      :src="historyPageUrl"
      frameborder="0"
    ></iframe>
  </v-container>
</template>

<script lang="ts">
import { TestManagementState } from "@/store/testManagement";
import { Story } from "@/lib/testManagement/types";
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";
import { useRoute } from "vue-router/composables";

export default defineComponent({
  setup() {
    const store = useStore();
    const route = useRoute();

    const querySessionId = computed(() => {
      const sessionId = route.query.sessionIds[0] as string;
      return sessionId;
    });

    const tempStory = computed(() => {
      return ((store.state as any).testManagement as TestManagementState)
        .tempStory as Story;
    });

    const historyPageUrl = computed(() => {
      const storyId = tempStory.value.id;
      const sessionId = querySessionId.value;

      return `data/${storyId}/${sessionId}/index.html`;
    });

    return {
      historyPageUrl,
    };
  },
});
</script>
