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
          $store.getters.message("navigation.group-label.capture")
        }}</v-subheader>

        <v-list-item-group color="primary">
          <v-list-item
            :disabled="isCapturing || isReplaying"
            to="/manage/view/start"
            :title="$store.getters.message('start-capture-view.title')"
            exact
          >
            <v-list-item-icon>
              <v-icon :disabled="isCapturing || isReplaying">video_call</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{
                $store.getters.message("start-capture-view.title")
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            v-if="currentTestResultName && !recentReviewQuery"
            to="/capture/history"
            :title="currentTestResultName"
            exact
          >
            <v-list-item-icon>
              <v-badge v-if="isCapturing" color="red" dot
                ><v-icon>devices</v-icon></v-badge
              >
              <v-icon v-else>devices</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ currentTestResultName }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            :disabled="isCapturing || isReplaying"
            to="/manage/view/results"
            :title="
              $store.getters.message('test-result-navigation-drawer.title')
            "
            exact
          >
            <v-list-item-icon>
              <v-icon :disabled="isCapturing || isReplaying"
                >folder_open</v-icon
              >
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{
                $store.getters.message("test-result-navigation-drawer.title")
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-subheader v-if="!mini">{{
          $store.getters.message("navigation.group-label.management")
        }}</v-subheader>

        <v-list-item-group v-model="displayedPage" color="primary">
          <v-list-item
            :disabled="!hasTestMatrix"
            to="/manage/view/show"
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
            :disabled="isCapturing || isReplaying"
            to="/manage/view/edit"
            :title="$store.getters.message('manage-edit-view.title')"
            exact
          >
            <v-list-item-icon>
              <v-icon>edit</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{
                $store.getters.message("manage-edit-view.title")
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            :disabled="!hasTestMatrix || isCapturing || isReplaying"
            to="/manage/view/stories"
            :title="$store.getters.message('story-list-view.title')"
            exact
          >
            <v-list-item-icon>
              <v-icon :disabled="!hasTestMatrix">library_books</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{
                $store.getters.message("story-list-view.title")
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            :disabled="!hasSession || isCapturing || isReplaying"
            to="/manage/view/progress"
            :title="$store.getters.message('manage-progress.title')"
            exact
          >
            <v-list-item-icon>
              <v-icon :disabled="!hasSession">waterfall_chart</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{
                $store.getters.message("manage-progress.title")
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            :disabled="!hasSession || isCapturing || isReplaying"
            to="/manage/view/quality"
            :title="$store.getters.message('manage-quality.title')"
            exact
          >
            <v-list-item-icon>
              <v-icon :disabled="!hasSession">show_chart</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{
                $store.getters.message("manage-quality.title")
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            :disabled="isCapturing || isReplaying"
            to="/manage/view/features"
            :title="$store.getters.message('optional-features.title')"
            exact
          >
            <v-list-item-icon>
              <v-icon>apps</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{
                $store.getters.message("optional-features.title")
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
            v-if="currentTestResultName && recentReviewQuery"
            :to="{ path: '/manage/view/history', query: recentReviewQuery }"
            :title="currentTestResultName"
            exact
          >
            <v-list-item-icon>
              <v-icon>pageview</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ currentTestResultName }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-subheader v-if="!mini">{{
          $store.getters.message("navigation.group-label.other")
        }}</v-subheader>

        <v-list-item-group color="primary">
          <v-list-item
            to="/manage/view/config"
            :title="$store.getters.message('manage-header.capture-config')"
            exact
          >
            <v-list-item-icon>
              <v-icon>settings</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{
                $store.getters.message("manage-header.capture-config")
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>

    <progress-dialog></progress-dialog>
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import ErrorMessageDialog from "./components/pages/common/ErrorMessageDialog.vue";
import ProgressDialog from "./components/pages/common/ProgressDialog.vue";
import ExpCapture from "@/components/pages/captureControl/expCapture/ExpCapture.vue";
import ExpManager from "@/components/pages/testManagement/ExpManager.vue";
import { TestManagementState } from "./store/testManagement";
import { TestMatrix } from "./lib/testManagement/types";
import { OperationHistoryState } from "./store/operationHistory";
import { CaptureControlState } from "./store/captureControl";

@Component({
  components: {
    "exp-capture": ExpCapture,
    "exp-manager": ExpManager,
    "progress-dialog": ProgressDialog,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class Root extends Vue {
  private mini = false;
  private displayedPage = 0;
  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private mounted(): void {
    (async () => {
      try {
        await this.$store.dispatch("loadLocaleFromSettings");
        await this.$store.dispatch("readSettings");
        await this.$store.dispatch("readViewSettings");
        await this.$store.dispatch("readDeviceSettings");
      } catch (error) {
        if (error instanceof Error) {
          this.errorMessage = error.message;
          this.errorMessageDialogOpened = true;
        } else {
          throw error;
        }
      }

      this.$router.push({ path: "/manage/view/start" });
    })();
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
        path: `/manage/view/story/${story.id}`,
        testTargetName: testTarget.name,
        viewPointName: viewPoint.name,
      };
    });
  }

  get currentTestResultName() {
    return (this.$store.state.operationHistory as OperationHistoryState)
      .testResultInfo.name;
  }

  get recentReviewQuery() {
    return (this.$store.state.testManagement as TestManagementState)
      .recentReviewQuery;
  }

  get captureControlState(): CaptureControlState {
    return this.$store.state.captureControl as CaptureControlState;
  }

  get isCapturing() {
    return this.captureControlState.isCapturing;
  }

  get isReplaying() {
    return this.captureControlState.isReplaying;
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

  private get toHistoryViewForSelectWindowDialog(): boolean {
    const result =
      this.captureControlState.captureSession?.currentWindowHostNameChanged ??
      false;
    return result;
  }

  private get toHistoryViewForAutofillRegisterDialog(): boolean {
    const result = !!this.captureControlState.autofillRegisterDialogData;
    return result;
  }

  private get toHistoryViewForFillSelectDialog(): boolean {
    const data = this.captureControlState?.autofillSelectDialogData;
    const result = !!data?.autofillConditionGroups;
    return result;
  }

  @Watch("toHistoryViewForSelectWindowDialog")
  @Watch("toHistoryViewForAutofillRegisterDialog")
  @Watch("toHistoryViewForFillSelectDialog")
  private async toHistoryView() {
    const targetPath = "/capture/history";
    if (this.$router.currentRoute.path !== targetPath) {
      await this.$router.push({ path: targetPath });
    }
  }
}
</script>
