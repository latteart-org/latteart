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
  <v-container fluid class="pa-0">
    <v-container fluid pa-0 class="align-self-start">
      <v-card flat height="100%">
        <v-card-text>
          <v-data-table
            v-model="checkedItemIds"
            :show-select="!isViewerMode"
            :headers="headers"
            :items="storyItems"
            :items-per-page="10"
            item-value="id"
          >
            <template #top>
              <v-card class="mb-4 pa-4" variant="outlined">
                <v-container fluid>
                  <span style="color: rgba(0, 0, 0, 0.6)"
                    ><v-icon>filter_list_alt</v-icon>{{ $t("stories-review-page.filter") }}</span
                  >
                  <v-btn class="ml-4" @click="filterClear">{{
                    $t("stories-review-page.clear")
                  }}</v-btn>
                  <v-row>
                    <v-col cols="3">
                      <v-row class="pa-6">
                        <v-text-field
                          v-model="testMatrixFilterValue"
                          type="text"
                          :label="$t('stories-review-page.test-matrix')"
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
                          :label="$t('stories-review-page.group')"
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
                          :label="$t('stories-review-page.test-target')"
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
                          :label="$t('stories-review-page.view-point')"
                          hide-details
                        >
                        </v-text-field>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </template>

            <template #[`item.testMatrix.name`]="{ item }">
              <td :title="item.testMatrix.name">
                {{ item.testMatrix.name.substring(0, 60) }}
              </td>
            </template>
            <template #[`item.group.name`]="{ item }">
              <td :title="item.group.name">
                {{ item.group.name.substring(0, 60) }}
              </td>
            </template>
            <template #[`item.testTarget.name`]="{ item }">
              <td :title="item.testTarget.name">
                {{ item.testTarget.name.substring(0, 60) }}
              </td>
            </template>
            <template #[`item.viewPoint.name`]="{ item }">
              <td :title="item.viewPoint.name">
                {{ item.viewPoint.name.substring(0, 60) }}
              </td>
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions>
          <test-result-load-trigger v-if="!isViewerMode" :test-result-ids="targetTestResultIds">
            <template #activator="{ on }">
              <v-btn
                variant="elevated"
                :disabled="checkedItemIds.length === 0"
                color="primary"
                class="ma-1"
                @click="review(on)"
                >{{ $t("stories-review-page.do-review") }}</v-btn
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
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { type Story, type TestMatrix } from "@/lib/testManagement/types";
import * as StoryService from "@/lib/testManagement/Story";
import TestResultLoadTrigger from "@/components/organisms/common/TestResultLoadTrigger.vue";
import { computed, defineComponent, ref, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRootStore } from "@/stores/root";
import { useTestManagementStore } from "@/stores/testManagement";

export default defineComponent({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "test-result-load-trigger": TestResultLoadTrigger
  },
  setup() {
    const rootStore = useRootStore();
    const testManagementStore = useTestManagementStore();
    const route = useRoute();
    const router = useRouter();

    const testMatrixFilterValue = ref("");
    const groupFilterValue = ref("");
    const testTargetFilterValue = ref("");
    const viewPointFilterValue = ref("");

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const isViewerMode = inject("isViewerMode") ?? false;

    const checkedItemIds = ref<string[]>([]);

    const headers = computed(() => {
      return [
        {
          title: rootStore.message("stories-review-page.test-matrix"),
          value: "testMatrix.name"
        },
        {
          title: rootStore.message("stories-review-page.group"),
          value: "group.name"
        },
        {
          title: rootStore.message("stories-review-page.test-target"),
          value: "testTarget.name"
        },
        {
          title: rootStore.message("stories-review-page.view-point"),
          value: "viewPoint.name"
        }
      ];
    });

    const storyItems = computed(() => {
      return testMatrices.value
        .flatMap((matrix) => {
          return matrix.groups.flatMap((group) => {
            return group.testTargets.flatMap((target) => {
              return target.plans.map((plan) => {
                return {
                  id: `${matrix.id}_${group.id}_${target.id}_${plan.viewPointId}`,
                  testMatrix: { id: matrix.id, name: matrix.name },
                  group: { id: group.id, name: group.name },
                  testTarget: { id: target.id, name: target.name },
                  viewPoint: {
                    id: plan.viewPointId,
                    name: getViewPointName(plan.viewPointId)
                  }
                };
              });
            });
          });
        })
        .filter((story) => hasTestResult(story.viewPoint.id, story.testTarget.id))
        .filter((story) => {
          if (!testMatrixFilterValue.value) {
            return true;
          }
          return story.testMatrix.name.includes(testMatrixFilterValue.value);
        })
        .filter((story) => {
          if (!groupFilterValue.value) {
            return true;
          }
          return story.group.name.includes(groupFilterValue.value);
        })
        .filter((story) => {
          if (!testTargetFilterValue.value) {
            return true;
          }
          return story.testTarget.name.includes(testTargetFilterValue.value);
        })
        .filter((story) => {
          if (!viewPointFilterValue.value) {
            return true;
          }
          return story.viewPoint.name.includes(viewPointFilterValue.value);
        });
    });

    const testMatrices = computed((): TestMatrix[] => {
      return testManagementStore.getTestMatrices();
    });

    const stories = computed((): Story[] => {
      return testManagementStore.getStories();
    });

    const viewPoints = computed(() => {
      return testMatrices.value.flatMap(({ viewPoints }) =>
        viewPoints.map(({ id, name }) => {
          return { id, name };
        })
      );
    });

    const getViewPointName = (viewPointId: string) => {
      return viewPoints.value.find(({ id }) => id === viewPointId)?.name ?? "";
    };

    const hasTestResult = (viewPointId: string, testTargetId: string): boolean => {
      const target = stories.value.find((story) => {
        return story.viewPointId === viewPointId && story.testTargetId === testTargetId;
      });
      if (!target) {
        return false;
      }
      return target.sessions.some((session) =>
        session.testResultFiles.some((testResult) => testResult.id)
      );
    };

    const filterClear = () => {
      testMatrixFilterValue.value = "";
      groupFilterValue.value = "";
      testTargetFilterValue.value = "";
      viewPointFilterValue.value = "";
    };

    const targetTestResultIds = computed(() => {
      const targetStories: Story[] = checkedItemIds.value.flatMap((id) => {
        const storyItem = storyItems.value.find((item) => item.id === id);

        if (!storyItem) {
          return [];
        }

        return [
          testManagementStore.findStoryByTestTargetAndViewPointId(
            storyItem.testTarget.id,
            storyItem.viewPoint.id,
            storyItem.testMatrix.id
          )
        ];
      });

      return StoryService.collectTestResultIdsFromSession(targetStories)?.testResultIds ?? [];
    });

    const review = async (loadTestResults: () => Promise<void>) => {
      await loadTestResults();

      router.push({ name: "reviewPage" }).catch((err: Error) => {
        if (err.name !== "NavigationDuplicated") {
          throw err;
        }
      });
    };

    (async () => {
      rootStore.changeWindowTitle({
        title: rootStore.message(route.meta?.title ?? "")
      });
    })();

    return {
      t: rootStore.message,
      testMatrixFilterValue,
      groupFilterValue,
      testTargetFilterValue,
      viewPointFilterValue,
      errorMessageDialogOpened,
      errorMessage,
      isViewerMode,
      checkedItemIds,
      headers,
      storyItems,
      filterClear,
      targetTestResultIds,
      review
    };
  }
});
</script>
<style lang="sass" scoped>
.v-data-table td
  overflow: hidden
  text-overflow: ellipsis
  white-space : nowrap
  max-width: 150px
</style>
