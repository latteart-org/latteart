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
import ViewerRootPage from "@/components/pages/ViewerRootPage.vue";
import SnapshotConfigPage from "@/components/pages/config/SnapshotConfigPage.vue";
import ProgressManagementPage from "@/components/pages/progressManagement/ProgressManagementPage.vue";
import QualityManagementPage from "@/components/pages/qualityManagement/QualityManagementPage.vue";
import SnapshotReviewPage from "@/components/pages/review/SnapshotReviewPage.vue";
import StoryPage from "@/components/pages/story/StoryPage.vue";
import TestMatrixPage from "@/components/pages/testMatrix/TestMatrixPage.vue";
import { useTestManagementStore } from "@/stores/testManagement";
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

const snapshotRoutes = [
  {
    path: "/",
    name: "root",
    component: ViewerRootPage,
    children: [
      {
        path: "review",
        name: "reviewPage",
        component: SnapshotReviewPage,
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
            path: "test-matrix",
            name: "testMatrixPage",
            component: TestMatrixPage,
            meta: { title: "common.test-matrix-window-title" }
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
            path: "story/:id",
            name: "storyPage",
            component: StoryPage,
            meta: { title: "common.story-window-title" }
          },
          {
            path: "config",
            component: SnapshotConfigPage,
            meta: { title: "common.config-window-title" }
          }
        ]
      }
    ]
  }
];

export default snapshotRoutes;
