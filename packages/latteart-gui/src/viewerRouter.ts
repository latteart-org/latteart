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
import ExpManager from "./components/pages/testManagement/ExpManager.vue";
import ManageView from "./components/pages/testManagement/ManageView.vue";
import StoryView from "./components/pages/testManagement/storyView/StoryView.vue";
import HistoryFrame from "./components/pages/operationHistory/HistoryFrame.vue";
import ManageShowView from "./components/pages/testManagement/manageShowView/ManageShowView.vue";
import ManageProgressView from "./components/pages/testManagement/manageProgressView/ManageProgressView.vue";
import ManageQualityView from "./components/pages/testManagement/manageQualityView/ManageQualityView.vue";
import Root from "./ViewerRoot.vue";

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
              path: "story/:id",
              name: "storyView",
              component: StoryView,
            },
            {
              path: "history",
              name: "historyFrame",
              component: HistoryFrame,
            },
          ],
        },
      ],
    },
  ],
});
