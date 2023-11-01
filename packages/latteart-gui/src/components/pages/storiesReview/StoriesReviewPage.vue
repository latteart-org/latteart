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
  <v-container fluid fill-height pa-4 style="overflow-y: scroll">
    <v-container fluid pa-0 class="align-self-start">
      <v-card flat height="100%">
        <v-card-text>
          <v-data-table
            :show-select="!isViewerMode"
            :headers="headers"
            :items="storyItems"
            :items-per-page="10"
            v-model="checkedItems"
            item-key="sequence"
          >
            <template v-slot:top>
              <v-card class="mb-4 pa-4" outlined>
                <v-container fluid>
                  <span style="color: rgba(0, 0, 0, 0.6)"
                    ><v-icon>filter_list_alt</v-icon
                    >{{
                      $store.getters.message("stories-review-page.filter")
                    }}</span
                  >
                  <v-btn @click="filterClear" class="ml-4">{{
                    $store.getters.message("stories-review-page.clear")
                  }}</v-btn>
                  <v-row>
                    <v-col cols="3">
                      <v-row class="pa-6">
                        <v-text-field
                          v-model="testMatrixFilterValue"
                          type="text"
                          :label="
                            $store.getters.message(
                              'stories-review-page.test-matrix'
                            )
                          "
                          hide-details
                        >
                        </v-text-field>
                      </v-row>
                    </v-col>

                    <v-col cols="3">
                      <v-row class="pa-6">
                        <v-text-field
                          v-model="groupFilterValue"
                          type="text"
                          :label="
                            $store.getters.message('stories-review-page.group')
                          "
                          hide-details
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
                            $store.getters.message(
                              'stories-review-page.test-target'
                            )
                          "
                          hide-details
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
                            $store.getters.message(
                              'stories-review-page.view-point'
                            )
                          "
                          hide-details
                        >
                        </v-text-field>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </template>

            <template v-slot:[`item.testMatrix.name`]="{ item }">
              <td :title="item.testMatrix.name">
                {{ item.testMatrix.name.substring(0, 60) }}
              </td>
            </template>
            <template v-slot:[`item.group.name`]="{ item }">
              <td :title="item.group.name">
                {{ item.group.name.substring(0, 60) }}
              </td>
            </template>
            <template v-slot:[`item.testTarget.name`]="{ item }">
              <td :title="item.testTarget.name">
                {{ item.testTarget.name.substring(0, 60) }}
              </td>
            </template>
            <template v-slot:[`item.viewPoint.name`]="{ item }">
              <td :title="item.viewPoint.name">
                {{ item.viewPoint.name.substring(0, 60) }}
              </td>
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions>
          <test-result-load-trigger
            v-if="!isViewerMode"
            :testResultIds="targetTestResultIds"
          >
            <template v-slot:activator="{ on }">
              <v-btn
                @click="review(on)"
                :disabled="checkedItems.length === 0"
                color="primary"
                class="ma-1"
                >{{
                  $store.getters.message("stories-review-page.do-review")
                }}</v-btn
              >
            </template>
          </test-result-load-trigger>
        </v-card-actions>
      </v-card>
    </v-container>
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { Story, TestMatrix } from "@/lib/testManagement/types";
import * as StoryService from "@/lib/testManagement/Story";
import TestResultLoadTrigger from "@/components/organisms/common/TestResultLoadTrigger.vue";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "test-result-load-trigger": TestResultLoadTrigger,
  },
})
export default class StoriesReviewPage extends Vue {
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
        text: this.$store.getters.message("stories-review-page.test-matrix"),
        value: "testMatrix.name",
        filter: this.testMatrixFilter,
      },
      {
        text: this.$store.getters.message("stories-review-page.group"),
        value: "group.name",
        filter: this.groupFilter,
      },
      {
        text: this.$store.getters.message("stories-review-page.test-target"),
        value: "testTarget.name",
        filter: this.testTargetFilter,
      },
      {
        text: this.$store.getters.message("stories-review-page.view-point"),
        value: "viewPoint.name",
        filter: this.viewPointFilter,
      },
    ];
  }

  private get storyItems() {
    let sequence = 0;
    return this.testMatrices
      .flatMap((matrix) => {
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
      })
      .filter((story) =>
        this.hasTestResult(story.viewPoint.id, story.testTarget.id)
      );
  }

  private get testMatrices(): TestMatrix[] {
    return this.$store.getters["testManagement/getTestMatrices"]();
  }

  private get stories(): Story[] {
    return this.$store.getters["testManagement/getStories"]();
  }

  private get viewPoints() {
    return this.testMatrices.flatMap(({ viewPoints }) =>
      viewPoints.map(({ id, name }) => {
        return { id, name };
      })
    );
  }

  created() {
    this.$store.dispatch("changeWindowTitle", {
      title: this.$store.getters.message(this.$route.meta?.title ?? ""),
    });
  }

  private getViewPointName(viewPointId: string) {
    return this.viewPoints.find(({ id }) => id === viewPointId)?.name ?? "";
  }

  private testMatrixFilter(testMatrix: string) {
    if (!this.testMatrixFilterValue) {
      return true;
    }
    return testMatrix.includes(this.testMatrixFilterValue);
  }

  private groupFilter(group: string) {
    if (!this.groupFilterValue) {
      return true;
    }
    return group.includes(this.groupFilterValue);
  }

  private testTargetFilter(testTarget: string) {
    if (!this.testTargetFilterValue) {
      return true;
    }
    return testTarget.includes(this.testTargetFilterValue);
  }

  private viewPointFilter(viewPoint: string) {
    if (!this.viewPointFilterValue) {
      return true;
    }
    return viewPoint.includes(this.viewPointFilterValue);
  }

  private hasTestResult(viewPointId: string, testTargetId: string): boolean {
    const target = this.stories.find((story) => {
      return (
        story.viewPointId === viewPointId && story.testTargetId === testTargetId
      );
    });
    if (!target) {
      return false;
    }
    return target.sessions.some((session) =>
      session.testResultFiles.some((testResult) => testResult.id)
    );
  }

  private filterClear() {
    this.testMatrixFilterValue = "";
    this.groupFilterValue = "";
    this.testTargetFilterValue = "";
    this.viewPointFilterValue = "";
  }

  private get targetTestResultIds() {
    const targetStories: Story[] = this.checkedItems.map(
      ({ testTarget, viewPoint, testMatrix }) => {
        return this.$store.getters[
          "testManagement/findStoryByTestTargetAndViewPointId"
        ](testTarget.id, viewPoint.id, testMatrix.id);
      }
    );

    return (
      StoryService.collectTestResultIdsFromSession(targetStories)
        ?.testResultIds ?? []
    );
  }

  private async review(loadTestResults: () => Promise<void>) {
    await loadTestResults();

    this.$router.push({ name: "reviewView" }).catch((err: Error) => {
      if (err.name !== "NavigationDuplicated") {
        throw err;
      }
    });
  }
}
</script>
<style lang="sass" scoped>
.v-data-table td
  overflow: hidden
  text-overflow: ellipsis
  white-space : nowrap
  max-width: 150px
</style>
