/**
 * Copyright 2023 NTT Corporation.
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

import Vue from "vue";
import Router from "vue-router";
import ExpManager from "./ExpManager.vue";
import ManageView from "./ManageView.vue";
import StoryPage from "./components/pages/story/StoryPage.vue";
import SnapshotReviewPage from "./components/pages/review/SnapshotReviewPage.vue";
import TestMatrixPage from "./components/pages/testMatrix/TestMatrixPage.vue";
import ProgressManagementPage from "./components/pages/progressManagement/ProgressManagementPage.vue";
import QualityManagementPage from "./components/pages/qualityManagement/QualityManagementPage.vue";
import Root from "./ViewerRoot.vue";
import store from "@/store/index";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "root",
      component: Root,
      children: [
        {
          path: "manage",
          name: "expmanager",
          component: ExpManager,
          children: [
            {
              path: "view",
              name: "manageView",
              component: ManageView,
              children: [
                {
                  path: "show",
                  name: "manageShowView",
                  component: TestMatrixPage,
                  meta: { title: "manage-header.top" },
                },
                {
                  path: "progress",
                  name: "manageProgressView",
                  component: ProgressManagementPage,
                  meta: { title: "progress-management.title" },
                },
                {
                  path: "quality",
                  name: "manageQualityView",
                  component: QualityManagementPage,
                  meta: { title: "quality-management.title" },
                },
                {
                  path: "story/:id",
                  name: "storyView",
                  component: StoryPage,
                  meta: { title: "story-page.title" },
                },
                {
                  path: "history",
                  name: "historyFrame",
                  component: SnapshotReviewPage,
                  meta: { title: "manager-history-view.review" },
                  beforeEnter: (to, from, next) => {
                    store.commit("testManagement/setRecentReviewQuery", {
                      query: to.query,
                    });
                    next();
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});
