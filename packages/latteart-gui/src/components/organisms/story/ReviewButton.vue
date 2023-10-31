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
          >{{ $store.getters.message("story-view.do-review") }}</v-btn
        >
      </template>
    </test-result-load-trigger>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Story } from "@/lib/testManagement/types";
import * as StoryService from "@/lib/testManagement/Story";
import TestResultLoadTrigger from "@/components/organisms/common/TestResultLoadTrigger.vue";

@Component({
  components: {
    "test-result-load-trigger": TestResultLoadTrigger,
  },
})
export default class ReviewButton extends Vue {
  @Prop({ type: Object, default: () => ({ sessions: [] }) })
  public readonly story!: Story;
  @Prop({ type: Array, default: () => [] })
  public readonly sessionIds!: string[];
  @Prop({ type: Boolean, default: false }) public readonly disabled!: boolean;

  private alertDialogOpened = false;
  private alertDialogTitle = "";
  private alertDialogMessage = "";

  public async toReviewPage(
    loadTestResults: () => Promise<void>
  ): Promise<void> {
    await loadTestResults();

    this.$store.commit("testManagement/setTempStory", { story: this.story });

    this.$router.push({
      path: `../history`,
      query: { sessionIds: this.sessionIds },
    });
  }

  private get testResultIds() {
    const sessions = StoryService.getTargetSessions(
      this.story,
      this.sessionIds
    );
    return (
      sessions
        ?.map((session) => session.testResultFiles.map((result) => result.id))
        .flat() ?? []
    );
  }
}
</script>
