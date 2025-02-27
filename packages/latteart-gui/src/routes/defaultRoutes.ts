/**
 * Copyright 2025 NTT Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import PageFrame from "@/components/pages/PageFrame.vue";
import RootPage from "@/components/pages/RootPage.vue";
import OptionalFeaturesPage from "@/components/pages/optionalFeatures/OptionalFeaturesPage.vue";
import ProgressManagementPage from "@/components/pages/progressManagement/ProgressManagementPage.vue";
import QualityManagementPage from "@/components/pages/qualityManagement/QualityManagementPage.vue";
import StartCapturePage from "@/components/pages/startCapture/StartCapturePage.vue";
import StoryPage from "@/components/pages/story/StoryPage.vue";
import StoriesReviewPage from "@/components/pages/storiesReview/StoriesReviewPage.vue";
import TestMatrixPage from "@/components/pages/testMatrix/TestMatrixPage.vue";
import TestResultPage from "@/components/pages/testResult/TestResultPage.vue";
import TestResultListPage from "@/components/pages/testResultList/TestResultListPage.vue";
import { useTestManagementStore } from "@/stores/testManagement";
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import ReviewPage from "@/components/pages/review/ReviewPage.vue";
import TestMatrixEditPage from "@/components/pages/testMatrixEdit/TestMatrixEditPage.vue";
import ConfigPage from "@/components/pages/config/ConfigPage.vue";
import TestHintListPage from "@/components/pages/testHintList/TestHintListPage.vue";

const defaultRoutes = [
  {
    path: "/",
    name: "root",
    component: RootPage,
    children: [
      {
        path: "test-result",
        name: "testResultPage",
        component: TestResultPage,
        meta: { title: "default-routes.test-result-window-title" },
        beforeEnter: (
          to: RouteLocationNormalized,
          from: RouteLocationNormalized,
          next: NavigationGuardNext
        ) => {
          const testManagementStore = useTestManagementStore();

          testManagementStore.setRecentReviewQuery({
            query: null
          });
          next();
        }
      },
      {
        path: "review",
        name: "reviewPage",
        component: ReviewPage,
        meta: { title: "common.review-window-title" },
        beforeEnter: (
          to: RouteLocationNormalized,
          from: RouteLocationNormalized,
          next: NavigationGuardNext
        ) => {
          const testManagementStore = useTestManagementStore();

          testManagementStore.setRecentReviewQuery({
            query: {
              sessionIds: to.query.sessionIds as string[],
              testResultIds: to.query.testResultIds as string[]
            }
          });
          next();
        }
      },
      {
        path: "page",
        name: "pageFrame",
        component: PageFrame,
        children: [
          {
            path: "start",
            component: StartCapturePage,
            meta: { title: "common.start-capture-window-title" }
          },
          {
            path: "test-result-list",
            component: TestResultListPage,
            meta: { title: "common.test-result-list-window-title" }
          },
          {
            path: "test-hint-list",
            component: TestHintListPage,
            meta: { title: "common.test-hint-list-window-title" }
          },
          {
            path: "test-matrix",
            name: "testMatrixPage",
            component: TestMatrixPage,
            meta: { title: "common.test-matrix-window-title" }
          },
          {
            path: "test-matrix-edit",
            name: "testMatrixEditPage",
            component: TestMatrixEditPage,
            meta: { title: "common.test-matrix-edit-window-title" }
          },
          {
            path: "stories-review",
            name: "storiesReviewPage",
            component: StoriesReviewPage,
            meta: { title: "common.stories-review-window-title" }
          },
          {
            path: "progress-management",
            name: "progressManagementPage",
            component: ProgressManagementPage,
            meta: { title: "common.progress-management-window-title" }
          },
          {
            path: "quality-management",
            name: "qualityManagementPage",
            component: QualityManagementPage,
            meta: { title: "common.quality-management-window-title" }
          },
          {
            path: "optional-features",
            component: OptionalFeaturesPage,
            meta: { title: "common.optional-features-window-title" }
          },
          {
            path: "story/:id",
            name: "storyPage",
            component: StoryPage,
            meta: { title: "common.story-window-title" }
          },
          {
            path: "config",
            component: ConfigPage,
            meta: { title: "common.config-window-title" }
          }
        ]
      }
    ]
  }
];

export default defaultRoutes;
