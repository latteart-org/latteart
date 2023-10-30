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
import StoryView from "./components/pages/story/StoryView.vue";
import HistoryFrame from "./components/pages/review/HistoryFrame.vue";
import ManageShowView from "./components/pages/testMatrix/ManageShowView.vue";
import ManageProgressView from "./components/pages/progressManagement/ManageProgressView.vue";
import ManageQualityView from "./components/pages/qualityManagement/ManageQualityView.vue";
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
                  component: ManageShowView,
                  meta: { title: "manage-header.top" },
                },
                {
                  path: "progress",
                  name: "manageProgressView",
                  component: ManageProgressView,
                  meta: { title: "manage-progress.title" },
                },
                {
                  path: "quality",
                  name: "manageQualityView",
                  component: ManageQualityView,
                  meta: { title: "manage-quality.title" },
                },
                {
                  path: "story/:id",
                  name: "storyView",
                  component: StoryView,
                  meta: { title: "story-view.title" },
                },
                {
                  path: "history",
                  name: "historyFrame",
                  component: HistoryFrame,
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
