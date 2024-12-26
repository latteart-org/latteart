<!--
 Copyright 2024 NTT Corporation.

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
  <v-container fluid class="pa-4">
    <v-container fluid class="align-self-start pa-0">
      <v-card flat height="100%">
        <v-card-text>
          <test-result-import-trigger @update="loadTestResultSummaries">
            <template #activator="{ on, isDisabled }">
              <v-btn :disabled="isDisabled" @click="on">{{
                $t("common.import-test-result")
              }}</v-btn>
            </template>
          </test-result-import-trigger>

          <v-text-field
            v-model="search"
            variant="underlined"
            label="Search"
            clearable
          ></v-text-field>

          <v-data-table
            v-model="selectedTestResults"
            v-model:page="page"
            v-model:items-per-page="itemsPerPage"
            v-model:sort-by="syncSortBy"
            show-select
            :headers="headers"
            :items="testResults"
            item-value="id"
            :search="search"
            :custom-filter="filterItems"
          >
            <template #[`item.actions`]="{ item }">
              <td :class="{ ellipsis: true }">
                <test-result-load-trigger :test-result-ids="[item.id]">
                  <template #activator="{ on, disabled }">
                    <v-btn
                      icon
                      size="large"
                      color="primary"
                      variant="text"
                      :disabled="disabled"
                      :title="$t('common.load')"
                      @click="goToHistoryView(on)"
                    >
                      <v-icon>open_in_browser</v-icon>
                    </v-btn>
                  </template>
                </test-result-load-trigger>
                <test-result-name-edit-trigger
                  :test-result-id="item.id"
                  :test-result-name="item.name"
                  @update="loadTestResultSummaries"
                >
                  <template #activator="{ on, disabled }">
                    <v-btn
                      icon
                      size="large"
                      color="primary"
                      variant="text"
                      :disabled="disabled"
                      :title="$t('common.test-result-name-edit')"
                      @click="on"
                    >
                      <v-icon>edit</v-icon>
                    </v-btn>
                  </template>
                </test-result-name-edit-trigger>
              </td>
            </template>

            <template #[`item.name`]="{ item }">
              <td :class="{ ellipsis: true }" :style="{ maxWidth: '250px' }">
                <div
                  :class="{ ellipsis: true }"
                  :style="{ 'max-width': '100%', width: 'inherit' }"
                  :title="item.name"
                >
                  {{ item.name }}
                </div>
              </td>
            </template>

            <template #[`item.initialUrl`]="{ item }">
              <td :class="{ ellipsis: true }" :style="{ maxWidth: '250px' }">
                <div
                  :class="{ ellipsis: true }"
                  :style="{ 'max-width': '100%', width: 'inherit' }"
                  :title="item.initialUrl"
                >
                  {{ item.initialUrl }}
                </div>
              </td>
            </template>

            <template #[`item.testingTime`]="{ item }">
              <td :class="{ ellipsis: true }">
                <div :class="{ ellipsis: true }" :style="{ 'max-width': '100%', width: 'inherit' }">
                  {{ millisecondsToHHmmss(item.testingTime) }}
                </div>
              </td>
            </template>

            <template #[`item.creationTimestamp`]="{ item }">
              <td :class="{ ellipsis: true }">
                <div :class="{ ellipsis: true }" :style="{ 'max-width': '100%', width: 'inherit' }">
                  {{ millisecondsToDateFormat(item.creationTimestamp) }}
                </div>
              </td>
            </template>

            <template #[`item.testPurposes`]="{ item }">
              <td :class="{ ellipsis: true }" :style="{ maxWidth: '350px' }">
                <li
                  v-for="(testPurpose, index) in item.testPurposes.slice(0, 3)"
                  :key="index"
                  :class="{ ellipsis: true }"
                  :style="{ 'max-width': '100%', width: 'inherit' }"
                  :title="testPurpose.value"
                >
                  {{ testPurpose.value }}
                </li>
                <span v-if="item.testPurposes.length > 3">… and more</span>
              </td>
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions>
          <v-btn
            :disabled="isDisabled"
            variant="elevated"
            color="red"
            @click="confirmDialogOpened = true"
            >{{ $t("test-result-list-page.delete-test-results") }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-container>

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="$t('test-result-list-page.delete-test-results')"
      :message="$t('test-result-list-page.delete-test-result-message')"
      :on-accept="deleteTestResults"
      @close="confirmDialogOpened = false"
    />

    <information-message-dialog
      :opened="informationDialogOpened"
      :title="$t('common.confirm')"
      :message="$t('common.delete-test-result-succeeded')"
      @close="informationDialogOpened = false"
    />

    <error-message-dialog
      :opened="errorDialogOpened"
      :message="errorMessage"
      @close="errorDialogOpened = false"
    />
  </v-container>
</template>

<script lang="ts">
import { formatDateTime, formatTime } from "@/lib/common/Timestamp";
import { type TestResultSummary } from "@/lib/operationHistory/types";
import ConfirmDialog from "@/components/molecules/ConfirmDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import InformationMessageDialog from "@/components/molecules/InformationMessageDialog.vue";
import TestResultImportTrigger from "@/components/organisms/common/TestResultImportTrigger.vue";
import TestResultLoadTrigger from "@/components/organisms/common/TestResultLoadTrigger.vue";
import TestResultNameEditTrigger from "@/components/organisms/common/TestResultNameEditTrigger.vue";
import { computed, defineComponent, ref, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRootStore } from "@/stores/root";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useTestManagementStore } from "@/stores/testManagement";

export default defineComponent({
  components: {
    "confirm-dialog": ConfirmDialog,
    "information-message-dialog": InformationMessageDialog,
    "error-message-dialog": ErrorMessageDialog,
    "test-result-import-trigger": TestResultImportTrigger,
    "test-result-load-trigger": TestResultLoadTrigger,
    "test-result-name-edit-trigger": TestResultNameEditTrigger
  },
  setup() {
    const rootStore = useRootStore();
    const operationHistoryStore = useOperationHistoryStore();
    const captureControlStore = useCaptureControlStore();
    const route = useRoute();
    const router = useRouter();

    const confirmDialogOpened = ref(false);
    const informationDialogOpened = ref(false);

    const errorDialogOpened = ref(false);
    const errorMessage = ref("");

    const selectedTestResults = ref<string[]>([]);
    const testResults = ref<TestResultSummary[]>([]);

    const headers = computed(() => {
      return [
        {
          title: "",
          value: "actions",
          minWidth: "120px",
          sortable: false
        },
        {
          title: rootStore.message("common.test-result-name"),
          value: "name",
          minWidth: "120px",
          sortable: true
        },
        {
          title: rootStore.message("common.target-url"),
          value: "initialUrl",
          minWidth: "120px",
          sortable: true
        },
        {
          title: rootStore.message("common.testing-time"),
          value: "testingTime",
          minWidth: "120px",
          sortable: true
        },
        {
          title: rootStore.message("common.creation-timestamp"),
          value: "creationTimestamp",
          minWidth: "170px",
          sortable: true
        },
        {
          title: rootStore.message("common.test-purpose"),
          value: "testPurposes",
          minWidth: "120px",
          sortable: true
        }
      ];
    });

    const isDisabled = computed(() => {
      return selectedTestResults.value.length === 0;
    });

    const search = ref(operationHistoryStore.testResultListOption.search);
    const page = ref<number>(1);
    const itemsPerPage = ref<number>(operationHistoryStore.testResultListOption.itemsPerPage);
    const syncSortBy = ref(
      operationHistoryStore.testResultListOption.sortBy === ""
        ? []
        : [
            {
              key: operationHistoryStore.testResultListOption.sortBy,
              order: operationHistoryStore.testResultListOption.sortDesc ? "desc" : "asc"
            } as const
          ]
    );

    const loadTestResultSummaries = async () => {
      testResults.value = await operationHistoryStore.getTestResults().catch(() => []);
    };

    const filterItems = (
      value: string | number | TestResultSummary["testPurposes"] | null,
      search: string | null
    ) => {
      if (value == null || search == null) {
        return false;
      }

      if (typeof value === "object") {
        return JSON.stringify(value).indexOf(search) !== -1;
      }

      if (typeof value === "number") {
        if (value.toString().length === 13) {
          return millisecondsToDateFormat(value).indexOf(search) !== -1;
        } else {
          return millisecondsToHHmmss(value).indexOf(search) != -1;
        }
      }

      return value.toString().indexOf(search) !== -1;
    };

    const millisecondsToHHmmss = (millisecondsTime: number) => {
      return formatTime(millisecondsTime);
    };

    const millisecondsToDateFormat = (millisecondsTime: number) => {
      return formatDateTime(millisecondsTime);
    };

    const deleteTestResults = async () => {
      rootStore.openProgressDialog({
        message: rootStore.message("common.deleting-test-results")
      });
      try {
        const targetTestResultIds = selectedTestResults.value;

        // Delete selected test results.
        await operationHistoryStore.deleteTestResults({
          testResultIds: targetTestResultIds
        });

        await loadTestResultSummaries();

        selectedTestResults.value = [];

        // Clear display information if it contains test results you are viewing.
        if (targetTestResultIds.includes(operationHistoryStore.testResultInfo.id)) {
          operationHistoryStore.removeStoringTestResultInfos({
            testResultInfos: [
              {
                id: operationHistoryStore.testResultInfo.id,
                name: operationHistoryStore.testResultInfo.name
              }
            ]
          });
          operationHistoryStore.clearTestResult();
          operationHistoryStore.clearScreenTransitionDiagramGraph();
          operationHistoryStore.clearElementCoverages();
          operationHistoryStore.clearInputValueTable();
          captureControlStore.resetTimer();
        }

        if (
          operationHistoryStore.storingTestResultInfos.some(({ id }) =>
            targetTestResultIds.includes(id)
          )
        ) {
          operationHistoryStore.storingTestResultInfos = [];
          useTestManagementStore().recentReviewQuery = null;
        }

        informationDialogOpened.value = true;
      } catch (error) {
        if (error instanceof Error) {
          errorDialogOpened.value = true;
          errorMessage.value = error.message;
        } else {
          throw error;
        }
      } finally {
        rootStore.closeProgressDialog();
      }
    };

    const goToHistoryView = async (loadTestResults: () => Promise<void>) => {
      await loadTestResults();

      router.push({ path: "/test-result" }).catch((err: Error) => {
        if (err.name !== "NavigationDuplicated") {
          throw err;
        }
      });
    };

    onBeforeUnmount(() => {
      operationHistoryStore.testResultListOption = {
        search: search.value,
        page: page.value,
        itemsPerPage: itemsPerPage.value,
        sortBy: syncSortBy.value.length > 0 ? syncSortBy.value[0].key : "",
        sortDesc:
          syncSortBy.value.length > 0
            ? syncSortBy.value[0].order === "desc"
              ? true
              : false
            : false
      };
    });

    (async () => {
      rootStore.changeWindowTitle({
        title: rootStore.message(route.meta?.title ?? "")
      });

      await loadTestResultSummaries();

      // Page must be initialized after all test results are present.
      page.value = operationHistoryStore.testResultListOption.page;
    })();

    return {
      confirmDialogOpened,
      informationDialogOpened,
      errorDialogOpened,
      errorMessage,
      selectedTestResults,
      testResults,
      search,
      page,
      itemsPerPage,
      syncSortBy,
      headers,
      isDisabled,
      loadTestResultSummaries,
      filterItems,
      millisecondsToHHmmss,
      millisecondsToDateFormat,
      deleteTestResults,
      goToHistoryView
    };
  }
});
</script>
