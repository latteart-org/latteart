/**
 * Copyright 2024 NTT Corporation.
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
        meta: { title: "test-result-page.window-title" },
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
        meta: { title: "manager-history-view.review" },
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
            meta: { title: "start-capture-page.title" }
          },
          {
            path: "test-result-list",
            component: TestResultListPage,
            meta: { title: "test-result-navigation-drawer.title" }
          },
          {
            path: "test-matrix",
            name: "testMatrixPage",
            component: TestMatrixPage,
            meta: { title: "manage-header.top" }
          },
          {
            path: "test-matrix-edit",
            name: "testMatrixEditPage",
            component: TestMatrixEditPage,
            meta: { title: "test-matrix-edit-page.title" }
          },
          {
            path: "stories-review",
            name: "storiesReviewPage",
            component: StoriesReviewPage,
            meta: { title: "stories-review-page.title" }
          },
          {
            path: "progress-management",
            name: "progressManagementPage",
            component: ProgressManagementPage,
            meta: { title: "progress-management.title" }
          },
          {
            path: "quality-management",
            name: "qualityManagementPage",
            component: QualityManagementPage,
            meta: { title: "quality-management.title" }
          },
          {
            path: "optional-features",
            component: OptionalFeaturesPage,
            meta: { title: "optional-features.title" }
          },
          {
            path: "story/:id",
            name: "storyPage",
            component: StoryPage,
            meta: { title: "story-page.title" }
          },
          {
            path: "config",
            component: ConfigPage,
            meta: { title: "manage-header.capture-config" }
          }
        ]
      }
    ]
  }
];

export default defaultRoutes;
