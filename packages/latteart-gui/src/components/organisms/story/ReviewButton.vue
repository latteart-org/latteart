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
  <div>
    <test-result-load-trigger :test-result-ids="testResultIds">
      <template #activator="{ on }">
        <v-btn
          v-if="story.sessions.length > 0"
          :disabled="disabled"
          color="info"
          @click="toReviewPage(on)"
          >{{ $t("common.do-review") }}</v-btn
        >
      </template>
    </test-result-load-trigger>
  </div>
</template>

<script lang="ts">
import { type Story } from "@/lib/testManagement/types";
import * as StoryService from "@/lib/testManagement/Story";
import TestResultLoadTrigger from "@/components/organisms/common/TestResultLoadTrigger.vue";
import { computed, defineComponent, type PropType } from "vue";
import { useTestManagementStore } from "@/stores/testManagement";
import { useRouter } from "vue-router";

export default defineComponent({
  components: {
    "test-result-load-trigger": TestResultLoadTrigger
  },
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
  setup(props) {
    const testManagementStore = useTestManagementStore();
    const router = useRouter();

    const toReviewPage = async (loadTestResults: () => Promise<void>): Promise<void> => {
      await loadTestResults();

      testManagementStore.setTempStory({ story: props.story });

      router.push({
        name: "reviewPage",
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
      toReviewPage,
      testResultIds
    };
  }
});
</script>
