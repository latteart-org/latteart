<!--
 Copyright 2022 NTT Corporation.

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
    <v-btn
      v-if="story.sessions.length > 0"
      :disabled="disabled"
      color="info"
      @click="toReviewPage"
      >{{ $store.getters.message("story-view.do-review") }}</v-btn
    >
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Story } from "@/lib/testManagement/types";
import * as StoryService from "@/lib/testManagement/Story";

@Component({
  components: {},
})
export default class ReviewButton extends Vue {
  @Prop({ type: Object, default: () => ({ sessions: [] }) })
  public readonly story!: Story;
  @Prop({ type: String, default: "" }) public readonly sessionId!: string;
  @Prop({ type: Boolean, default: false }) public readonly disabled!: boolean;

  private alertDialogOpened = false;
  private alertDialogTitle = "";
  private alertDialogMessage = "";

  public toReviewPage(): void {
    (async () => {
      this.$store.commit("testManagement/setTempStory", { story: this.story });
      const testResultFile = StoryService.getTargetSession(
        this.story,
        this.sessionId
      )!.testResultFiles![0];
      const testResultId = testResultFile.id;

      this.$router.push({
        path: `../history`,
        query: { sessionId: this.sessionId, testResultId },
      });
    })();
  }
}
</script>
