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
import ExpCapture from "@/components/pages/captureControl/expCapture/ExpCapture.vue";
import ConfigView from "@/components/pages/captureControl/configView/ConfigView.vue";
import StartCaptureView from "@/components/pages/captureControl/startCaptureView/StartCaptureView.vue";
import TestResultListView from "@/components/pages/captureControl/testResultListView/TestResultListView.vue";
import HistoryView from "@/components/pages/captureControl/historyView/HistoryView.vue";
import ExpManager from "@/components/pages/testManagement/ExpManager.vue";
import ManageView from "@/components/pages/testManagement/ManageView.vue";
import ManageEditView from "@/components/pages/testManagement/manageEditView/ManageEditView.vue";
import StoryListView from "@/components/pages/testManagement/storyListView/StoryListView.vue";
import StoryView from "@/components/pages/testManagement/storyView/StoryView.vue";
import ReviewView from "@/components/pages/testManagement/ReviewView.vue";
import ManageShowView from "@/components/pages/testManagement/manageShowView/ManageShowView.vue";
import ManageProgressView from "@/components/pages/testManagement/manageProgressView/ManageProgressView.vue";
import ManageQualityView from "@/components/pages/testManagement/manageQualityView/ManageQualityView.vue";
import OptionalFeaturesView from "@/components/pages/testManagement/optionalFeaturesView/OptionalFeaturesView.vue";
import Root from "./Root.vue";

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
