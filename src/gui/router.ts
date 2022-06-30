/**
 * Copyright 2022 NTT Corporation.
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
import ExpCapture from "@/vue/pages/captureControl/expCapture/ExpCapture.vue";
import ConfigView from "@/vue/pages/captureControl/configView/ConfigView.vue";
import HistoryView from "@/vue/pages/captureControl/historyView/HistoryView.vue";
import ExpManager from "@/vue/pages/testManagement/ExpManager.vue";
import ManageView from "@/vue/pages/testManagement/ManageView.vue";
import ManageEditView from "@/vue/pages/testManagement/manageEditView/ManageEditView.vue";
import StoryView from "@/vue/pages/testManagement/storyView/StoryView.vue";
import ReviewView from "@/vue/pages/testManagement/ReviewView.vue";
import ManageShowView from "@/vue/pages/testManagement/manageShowView/ManageShowView.vue";
import ManageProgressView from "@/vue/pages/testManagement/manageProgressView/ManageProgressView.vue";
import ManageQualityView from "@/vue/pages/testManagement/manageQualityView/ManageQualityView.vue";
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
              path: "config",
              name: "configView",
              component: ConfigView,
            },
            {
              path: "history",
              name: "historyView",
              component: HistoryView,
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
                  path: "show",
                  name: "manageShowView",
                  component: ManageShowView,
                },
                {
                  path: "progress",
                  name: "manageProgressView",
                  component: ManageProgressView,
                },
                {
                  path: "quality",
                  name: "manageQualityView",
                  component: ManageQualityView,
                },
              ],
            },
            {
              path: "edit",
              name: "manageEditView",
              component: ManageEditView,
            },
            {
              path: "story/:id",
              name: "storyView",
              component: StoryView,
            },
            {
              path: "history",
              name: "reviewView",
              component: ReviewView,
            },
          ],
        },
      ],
    },
  ],
});
