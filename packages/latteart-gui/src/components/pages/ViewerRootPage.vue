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
  <v-app>
    <v-navigation-drawer :rail="mini" permanent @click="mini = false">
      <v-list-item prepend-avatar="@/assets/logo.png" class="px-2">
        <v-list-item-title class="text-h6"> LatteArt </v-list-item-title>

        <template #append>
          <v-btn variant="flat" icon="chevron_left" @click.stop="mini = !mini"></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-subheader v-if="!mini">{{ $t("common.management") }}</v-list-subheader>

        <v-list-item
          :disabled="!hasTestMatrix"
          to="/page/test-matrix"
          :title.attr="$t('common.test-matrix-window-title')"
          exact
          prepend-icon="calendar_today"
        >
          <v-list-item-title>{{ $t("common.test-matrix-window-title") }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          :disabled="!hasSession"
          to="/page/progress-management"
          :title.attr="$t('common.progress-management-window-title')"
          exact
          prepend-icon="waterfall_chart"
        >
          <v-list-item-title>{{ $t("common.progress-management-window-title") }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          :disabled="!hasSession"
          to="/page/quality-management"
          :title.attr="$t('common.quality-management-window-title')"
          exact
          prepend-icon="show_chart"
        >
          <v-list-item-title>{{ $t("common.quality-management-window-title") }}</v-list-item-title>
        </v-list-item>

        <v-divider v-if="recentStories.length > 0"></v-divider>

        <div v-if="recentStories.length > 0">
          <v-list-subheader v-if="!mini">{{ $t("common.recent-stories") }}</v-list-subheader>

          <v-list-item
            v-for="story in recentStories"
            :key="story.id"
            :to="story.path"
            :title.attr="`${truncateName(story.testMatrixName)} ${truncateName(story.groupName)} ${truncateName(story.testTargetName)} ${truncateName(story.viewPointName)}`"
            exact
            prepend-icon="assignment"
          >
            <v-list-item-title>{{ story.testTargetName }}</v-list-item-title>
            <v-list-item-subtitle v-if="!mini">{{ story.viewPointName }}</v-list-item-subtitle>
          </v-list-item>
        </div>

        <v-divider v-if="recentReviewQuery"></v-divider>

        <div v-if="recentReviewQuery">
          <v-list-subheader v-if="!mini">{{ $t("common.current-review") }}</v-list-subheader>

          <v-list-item
            v-if="recentReviewQuery"
            :to="{ path: '/review', query: recentReviewQuery }"
            :title.attr="$t('common.review-window-title')"
            exact
            prepend-icon="pageview"
          >
            <v-list-item-title>{{ $t("common.review-window-title") }}</v-list-item-title>
          </v-list-item>
        </div>

        <v-divider></v-divider>

        <v-list-subheader v-if="!mini">{{ $t("common.other") }}</v-list-subheader>

        <v-list-item
          to="/page/config"
          :title.attr="$t('common.config-window-title')"
          exact
          prepend-icon="settings"
        >
          <v-list-item-title>{{ $t("common.config-window-title") }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import TextUtil from "@/lib/operationHistory/graphConverter/TextUtil";
import { type TestMatrix } from "@/lib/testManagement/types";
import { useRootStore } from "@/stores/root";
import { useTestManagementStore } from "@/stores/testManagement";
import { computed, defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const testManagementStore = useTestManagementStore();
    const rootStore = useRootStore();
    const router = useRouter();

    const mini = ref(false);
    const displayedPage = ref(0);

    onMounted(async () => {
      await rootStore.readSettings();
      router.push({ name: "testMatrixPage" });
    });

    const hasTestMatrix = computed((): boolean => {
      const testMatrices: TestMatrix[] = testManagementStore.getTestMatrices();

      return testMatrices.length > 0;
    });

    const hasSession = computed((): boolean => {
      const stories = testManagementStore.stories;

      return stories.flatMap((story) => story.sessions).length > 0;
    });

    const recentStories = computed(() => {
      return testManagementStore.recentStories.flatMap((story) => {
        const testMatrix: TestMatrix | undefined = testManagementStore.findTestMatrix(
          story.testMatrixId
        );

        if (!testMatrix) {
          return [];
        }

        const group = testMatrix.groups.find((group) =>
          group.testTargets.some((testTarget) => story.testTargetId === testTarget.id)
        );

        if (!group) {
          return [];
        }

        const testTarget = group.testTargets.find(
          (testTarget) => story.testTargetId === testTarget.id
        );

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
          id: story.id,
          path: `/page/story/${story.id}`,
          testTargetName: testTarget.name,
          viewPointName: viewPoint.name,
          testMatrixName: testMatrix.name,
          groupName: group.name
        };
      });
    });

    const recentReviewQuery = computed(() => {
      return testManagementStore.recentReviewQuery;
    });

    const truncateName = (text: string) => {
      return TextUtil.truncate(text, 100);
    };

    return {
      mini,
      displayedPage,
      hasTestMatrix,
      hasSession,
      recentStories,
      recentReviewQuery,
      truncateName
    };
  }
});
</script>
