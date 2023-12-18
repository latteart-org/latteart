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
  <v-app>
    <v-navigation-drawer app :mini-variant.sync="mini" permanent>
      <v-list-item class="px-2">
        <v-list-item-avatar>
          <v-img src="./assets/logo.png"></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="text-h6"> LatteArt </v-list-item-title>
        </v-list-item-content>

        <v-btn icon @click.stop="mini = !mini">
          <v-icon>chevron_left</v-icon>
        </v-btn>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-subheader v-if="!mini">{{
          $store.getters.message("navigation.group-label.management")
        }}</v-subheader>

        <v-list-item-group v-model="displayedPage" color="primary">
          <v-list-item
            :disabled="!hasTestMatrix"
            to="/page/test-matrix"
            :title="$store.getters.message('manage-header.top')"
            exact
          >
            <v-list-item-icon>
              <v-icon :disabled="!hasTestMatrix">calendar_today</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{
                $store.getters.message("manage-header.top")
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            :disabled="!hasSession"
            to="/page/progress-management"
            :title="$store.getters.message('progress-management.title')"
            exact
          >
            <v-list-item-icon>
              <v-icon :disabled="!hasSession">waterfall_chart</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{
                $store.getters.message("progress-management.title")
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            :disabled="!hasSession"
            to="/page/quality-management"
            :title="$store.getters.message('quality-management.title')"
            exact
          >
            <v-list-item-icon>
              <v-icon :disabled="!hasSession">show_chart</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{
                $store.getters.message("quality-management.title")
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <v-divider v-if="recentStories.length > 0"></v-divider>

      <v-list dense nav v-if="recentStories.length > 0">
        <v-subheader v-if="!mini">{{
          $store.getters.message("navigation.group-label.recent-stories")
        }}</v-subheader>

        <v-list-item-group color="primary">
          <v-list-item
            v-for="story in recentStories"
            :key="story.id"
            :to="story.path"
            :title="`${story.testTargetName} ${story.viewPointName}`"
            exact
          >
            <v-list-item-icon>
              <v-icon>assignment</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ story.testTargetName }}</v-list-item-title>
              <v-list-item-subtitle v-if="!mini">{{
                story.viewPointName
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <v-divider v-if="recentReviewQuery"></v-divider>

      <v-list dense nav v-if="recentReviewQuery">
        <v-subheader v-if="!mini">{{
          $store.getters.message("navigation.group-label.current-review")
        }}</v-subheader>

        <v-list-item-group color="primary">
          <v-list-item
            v-if="recentReviewQuery"
            :to="{ path: '/page/review', query: recentReviewQuery }"
            :title="$store.getters.message('manager-history-view.review')"
            exact
          >
            <v-list-item-icon>
              <v-icon>pageview</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{
                $store.getters.message("manager-history-view.review")
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { TestMatrix } from "./lib/testManagement/types";
import { TestManagementState } from "./store/testManagement";

@Component
export default class Root extends Vue {
  private mini = false;
  private displayedPage = 0;

  private mounted(): void {
    this.$router.push({ name: "testMatrixPage" });
  }

  private get hasTestMatrix(): boolean {
    const testMatrices: TestMatrix[] =
      this.$store.getters["testManagement/getTestMatrices"]();

    return testMatrices.length > 0;
  }

  private get hasSession(): boolean {
    const stories = (this.$store.state.testManagement as TestManagementState)
      .stories;

    return stories.flatMap((story) => story.sessions).length > 0;
  }

  get recentStories() {
    return (
      this.$store.state.testManagement as TestManagementState
    ).recentStories.flatMap((story) => {
      const testMatrix: TestMatrix | undefined = this.$store.getters[
        "testManagement/findTestMatrix"
      ](story.testMatrixId);

      if (!testMatrix) {
        return [];
      }

      const testTarget = testMatrix.groups
        .flatMap((group) => group.testTargets)
        .find((testTarget) => story.testTargetId === testTarget.id);

      if (!testTarget) {
        return [];
      }

      const viewPoint = testMatrix.viewPoints.find((viewPoint) => {
        return viewPoint.id === story.viewPointId;
      });

      if (!viewPoint) {
        return [];
      }

      return {
        path: `/page/story/${story.id}`,
        testTargetName: testTarget.name,
        viewPointName: viewPoint.name,
      };
    });
  }

  get recentReviewQuery() {
    return (this.$store.state.testManagement as TestManagementState)
      .recentReviewQuery;
  }
}
</script>
