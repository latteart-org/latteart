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
    <test-result-load-trigger :testResultIds="testResultIds">
      <template v-slot:activator="{ on }">
        <v-btn
          v-if="story.sessions.length > 0"
          :disabled="disabled"
          color="info"
          @click="toReviewPage(on)"
          >{{ store.getters.message("story-page.do-review") }}</v-btn
        >
      </template>
    </test-result-load-trigger>
  </div>
</template>

<script lang="ts">
import { Story } from "@/lib/testManagement/types";
import * as StoryService from "@/lib/testManagement/Story";
import TestResultLoadTrigger from "@/components/organisms/common/TestResultLoadTrigger.vue";
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";
import { useRouter } from "vue-router/composables";

export default defineComponent({
  props: {
    story: {
      type: Object as PropType<Story>,
      default: () => ({ sessions: [] }),
      required: true
    },
    sessionIds: {
      type: Array as PropType<string[]>,
      default: () => [],
      required: true
    },
    disabled: { type: Boolean, default: false, required: true }
  },
  components: {
    "test-result-load-trigger": TestResultLoadTrigger
  },
  setup(props) {
    const store = useStore();
    const router = useRouter();

    const toReviewPage = async (loadTestResults: () => Promise<void>): Promise<void> => {
      await loadTestResults();

      store.commit("testManagement/setTempStory", { story: props.story });

      router.push({
        path: `../review`,
        query: { sessionIds: props.sessionIds }
      });
    };

    const testResultIds = computed(() => {
      const sessions = StoryService.getTargetSessions(props.story, props.sessionIds);
      return (
        sessions?.map((session) => session.testResultFiles.map((result) => result.id)).flat() ?? []
      );
    });

    return {
      store,
      toReviewPage,
      testResultIds
    };
  }
});
</script>
