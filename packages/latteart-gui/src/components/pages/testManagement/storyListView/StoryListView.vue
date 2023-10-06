<!--
 Copyright 2023 NTT Corporation.

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
  <div>
    <v-app-bar color="latteart-main" dark fixed app clipped-right>
      <v-toolbar-title>{{
        $store.getters.message("story-list-view.title")
      }}</v-toolbar-title>
    </v-app-bar>

    <v-container fluid class="pa-4 pt-4">
      <v-data-table
        :show-select="!isViewerMode"
        :headers="headers"
        :items="storyItems"
        :items-per-page="10"
        v-model="checkedItems"
        item-key="sequence"
      >
        <template v-slot:top>
          <v-card class="mb-4">
            <v-container fluid>
              <span style="color: rgba(0, 0, 0, 0.6)"
                ><v-icon>filter_list_alt</v-icon
                >{{ $store.getters.message("story-list-view.filter") }}</span
              >
              <v-btn @click="filterClear" class="ml-4">{{
                $store.getters.message("story-list-view.clear")
              }}</v-btn>
              <v-row>
                <v-col cols="3">
                  <v-row class="pa-6">
                    <v-text-field
                      v-model="testMatrixFilterValue"
                      type="text"
                      :label="
                        $store.getters.message('story-list-view.test-matrix')
                      "
                    >
                    </v-text-field>
                  </v-row>
                </v-col>

                <v-col cols="3">
                  <v-row class="pa-6">
                    <v-text-field
                      v-model="groupFilterValue"
                      type="text"
                      :label="$store.getters.message('story-list-view.group')"
                    >
                    </v-text-field>
                  </v-row>
                </v-col>

                <v-col cols="3">
                  <v-row class="pa-6">
                    <v-text-field
                      v-model="testTargetFilterValue"
                      type="text"
                      :label="
                        $store.getters.message('story-list-view.test-target')
                      "
                    >
                    </v-text-field>
                  </v-row>
                </v-col>

                <v-col cols="3">
                  <v-row class="pa-6">
                    <v-text-field
                      v-model="viewPointFilterValue"
                      type="text"
                      :label="
                        $store.getters.message('story-list-view.view-point')
                      "
                    >
                    </v-text-field>
                  </v-row>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </template>

        <template v-slot:items="props">
          <tr>
            <td>{{ props.item.testMatrix.name }}</td>
            <td>{{ props.item.group.name }}</td>
            <td>{{ props.item.testTarget.name }}</td>
            <td>{{ props.item.viewPoint.name }}</td>
          </tr>
        </template>
      </v-data-table>
      <v-footer app height="auto" style="background-color: #ffffff">
        <v-btn
          v-if="!isViewerMode"
          @click="review"
          :disabled="checkedItems.length === 0"
          color="primary"
          class="ma-1"
          >{{ $store.getters.message("story-list-view.do-review") }}</v-btn
        >
      </v-footer>
    </v-container>
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ErrorMessageDialog from "../../common/ErrorMessageDialog.vue";
import { Story, TestMatrix } from "@/lib/testManagement/types";
import * as StoryService from "@/lib/testManagement/Story";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class StoryListView extends Vue {
  private testMatrixFilterValue = "";
  private groupFilterValue = "";
  private testTargetFilterValue = "";
  private viewPointFilterValue = "";

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private isViewerMode = (this as any).$isViewerMode
    ? (this as any).$isViewerMode
    : false;

  private checkedItems: {
    sequence: number;
    testMatrix: { id: string; name: string };
    group: { id: string; name: string };
    testTarget: { id: string; name: string };
    viewPoint: { id: string; name: string };
  }[] = [];

  private get headers() {
    return [
      {
        text: this.$store.getters.message("story-list-view.test-matrix"),
        value: "testMatrix.name",
        filter: this.testMatrixFilter,
      },
      {
        text: this.$store.getters.message("story-list-view.group"),
        value: "group.name",
        filter: this.groupFilter,
      },
      {
        text: this.$store.getters.message("story-list-view.test-target"),
        value: "testTarget.name",
        filter: this.testTargetFilter,
      },
      {
        text: this.$store.getters.message("story-list-view.view-point"),
        value: "viewPoint.name",
        filter: this.viewPointFilter,
      },
    ];
  }

  private get storyItems() {
    let sequence = 0;
    return this.testMatrices.flatMap((matrix) => {
      return matrix.groups.flatMap((group) => {
        return group.testTargets.flatMap((target) => {
          return target.plans.map((plan) => {
            sequence = sequence + 1;
            return {
              sequence,
              testMatrix: { id: matrix.id, name: matrix.name },
              group: { id: group.id, name: group.name },
              testTarget: { id: target.id, name: target.name },
              viewPoint: {
                id: plan.viewPointId,
                name: this.getViewPointName(plan.viewPointId),
              },
            };
          });
        });
      });
    });
  }

  private get testMatrices(): TestMatrix[] {
    return this.$store.getters["testManagement/getTestMatrices"]();
  }

  private get viewPoints() {
    return this.testMatrices.flatMap(({ viewPoints }) =>
      viewPoints.map(({ id, name }) => {
        return { id, name };
      })
    );
  }

  private getViewPointName(viewPointId: string) {
    return this.viewPoints.find(({ id }) => id === viewPointId)?.name ?? "";
  }

  private testMatrixFilter(testMatrix: string) {
    if (!this.testMatrixFilterValue) {
      return true;
    }
    return testMatrix === this.testMatrixFilterValue;
  }

  private groupFilter(group: string) {
    if (!this.groupFilterValue) {
      return true;
    }
    return group === this.groupFilterValue;
  }

  private testTargetFilter(testTarget: string) {
    if (!this.testTargetFilterValue) {
      return true;
    }
    return testTarget === this.testTargetFilterValue;
  }

  private viewPointFilter(viewPoint: string) {
    if (!this.viewPointFilterValue) {
      return true;
    }
    return viewPoint === this.viewPointFilterValue;
  }

  private filterClear() {
    this.testMatrixFilterValue = "";
    this.groupFilterValue = "";
    this.testTargetFilterValue = "";
    this.viewPointFilterValue = "";
  }

  private review() {
    const targetStories: Story[] = this.checkedItems.map(
      ({ testTarget, viewPoint, testMatrix }) => {
        return this.$store.getters[
          "testManagement/findStoryByTestTargetAndViewPointId"
        ](testTarget.id, viewPoint.id, testMatrix.id);
      }
    );
    const reviewTarget = StoryService.collectIdsFromSession(targetStories);
    if (reviewTarget === null) {
      this.errorMessage = this.$store.getters.message(
        "error.test_management.review_data_not_exist"
      );
      this.errorMessageDialogOpened = true;
    } else {
      this.$router.push({
        name: "reviewView",
        query: {
          sessionIds: reviewTarget.sessionIds,
          testResultIds: reviewTarget.testResultIds,
        },
      });
    }
  }
}
</script>
