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
import ExpCapture from "@/ExpCapture.vue";
import ConfigView from "@/components/pages/config/ConfigView.vue";
import StartCaptureView from "@/components/pages/startCapture/StartCaptureView.vue";
import TestResultListView from "@/components/pages/testResultList/TestResultListView.vue";
import HistoryView from "@/components/pages/testResult/HistoryView.vue";
import ExpManager from "@/ExpManager.vue";
import ManageView from "@/ManageView.vue";
import ManageEditView from "@/components/pages/testMatrixEdit/ManageEditView.vue";
import StoryListView from "@/components/pages/storiesReview/StoryListView.vue";
import StoryView from "@/components/pages/story/StoryView.vue";
import ReviewView from "@/components/pages/review/ReviewView.vue";
import ManageShowView from "@/components/pages/testMatrix/ManageShowView.vue";
import ManageProgressView from "@/components/pages/progressManagement/ManageProgressView.vue";
import ManageQualityView from "@/components/pages/qualityManagement/ManageQualityView.vue";
import OptionalFeaturesView from "@/components/pages/optionalFeatures/OptionalFeaturesView.vue";
import Root from "./Root.vue";
import store from "@/store/index";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "root",
      component: Root,
      children: [
        {
          path: "capture",
          name: "expcapture",
          component: ExpCapture,
          children: [
            {
              path: "history",
              name: "historyView",
              component: HistoryView,
              meta: { title: "history-view.window-title" },
              beforeEnter: (to, from, next) => {
                store.commit("testManagement/setRecentReviewQuery", {
                  query: null,
                });
                next();
              },
            },
          ],
        },
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
                  path: "start",
                  component: StartCaptureView,
                  meta: { title: "start-capture-view.title" },
                },
                {
                  path: "results",
                  component: TestResultListView,
                  meta: { title: "test-result-navigation-drawer.title" },
                },
                {
                  path: "show",
                  name: "manageShowView",
                  component: ManageShowView,
                  meta: { title: "manage-header.top" },
                },
                {
                  path: "edit",
                  name: "manageEditView",
                  component: ManageEditView,
                  meta: { title: "manage-edit-view.title" },
                },
                {
                  path: "stories",
                  name: "storyListView",
                  component: StoryListView,
                  meta: { title: "story-list-view.title" },
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
                  path: "features",
                  component: OptionalFeaturesView,
                  meta: { title: "optional-features.title" },
                },
                {
                  path: "story/:id",
                  name: "storyView",
                  component: StoryView,
                  meta: { title: "story-view.title" },
                },
                {
                  path: "history",
                  name: "reviewView",
                  component: ReviewView,
                  meta: { title: "manager-history-view.review" },
                  beforeEnter: (to, from, next) => {
                    store.commit("testManagement/setRecentReviewQuery", {
                      query: to.query,
                    });
                    next();
                  },
                },
                {
                  path: "config",
                  name: "configView",
                  component: ConfigView,
                  meta: { title: "manage-header.capture-config" },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});
