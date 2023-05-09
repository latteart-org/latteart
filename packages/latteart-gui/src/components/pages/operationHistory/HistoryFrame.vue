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
  <v-container fluid class="fill-height">
    <v-app-bar color="latteart-main" dark fixed app clipped-right>
      <v-toolbar-title>{{
        $store.getters.message("manager-history-view.review")
      }}</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-btn @click="toBack()" class="ma-2">{{
      $store.getters.message("manager-history-view.back")
    }}</v-btn>

    <iframe
      style="width: 100%; height: calc(100% - 36px)"
      :src="historyPageUrl"
      frameborder="0"
    ></iframe>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Story } from "@/lib/testManagement/types";

@Component
export default class HistoryFrame extends Vue {
  private toBack(): void {
    this.$router.back();
  }

  private get sessionId() {
    const sessionId = this.$route.query.sessionId as string;
    return sessionId;
  }

  private get tempStory() {
    return this.$store.state.testManagement.tempStory as Story;
  }

  private get historyPageUrl() {
    const storyId = this.tempStory.id;
    const sessionId = this.sessionId;

    return `data/${storyId}/${sessionId}/index.html`;
  }
}
</script>
