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
  <v-container fluid fill-height class="pa-4" style="overflow-y: scroll">
    <v-container fluid class="align-self-start pa-0">
      <v-card flat height="100%">
        <v-card-text>
          <test-result-import-trigger @update="loadTestResultSummaries">
            <template v-slot:activator="{ on, isDisabled }">
              <v-btn @click="on" :disabled="isDisabled" variant="elevated">{{
                $t("import-export-dialog.test-result-import-title")
              }}</v-btn>
            </template>
          </test-result-import-trigger>

          <v-text-field v-model="search" label="Search" clearable></v-text-field>

          <v-data-table
            show-select
            v-model="selectedTestResults"
            :headers="headers"
            :items="testResults"
            item-value="id"
            v-model:page="page"
            v-model:items-per-page="itemsPerPage"
            v-model:sort-by="syncSortBy"
            :search="search"
            :custom-filter="filterItems"
          >
            <template v-slot:[`item.actions`]="{ item }">
              <td :class="{ ellipsis: true }">
                <test-result-load-trigger :testResultIds="[item.id]">
                  <template v-slot:activator="{ on, disabled }">
                    <v-btn
                      icon
                      size="large"
                      color="primary"
                      variant="text"
                      @click="goToHistoryView(on)"
                      :disabled="disabled"
                      :title="$t('test-result-list.load')"
                    >
                      <v-icon>open_in_browser</v-icon>
                    </v-btn>
                  </template>
                </test-result-load-trigger>
                <test-result-name-edit-trigger
                  :testResultId="item.id"
                  :testResultName="item.name"
                  @update="loadTestResultSummaries"
                >
                  <template v-slot:activator="{ on, disabled }">
                    <v-btn
                      icon
                      size="large"
                      color="primary"
                      variant="text"
                      @click="on"
                      :disabled="disabled"
                      :title="$t('test-result-list.edit')"
                    >
                      <v-icon>edit</v-icon>
                    </v-btn>
                  </template>
                </test-result-name-edit-trigger>
              </td>
            </template>

            <template v-slot:[`item.name`]="{ item }">
              <td :class="{ ellipsis: true }">
                <div
                  :class="{ ellipsis: true }"
                  :style="{ 'max-width': '100%' }"
                  :title="item.name"
                >
                  {{ item.name }}
                </div>
              </td>
            </template>

            <template v-slot:[`item.initialUrl`]="{ item }">
              <td :class="{ ellipsis: true }">
                <div
                  :class="{ ellipsis: true }"
                  :style="{ 'max-width': '100%' }"
                  :title="item.initialUrl"
                >
                  {{ item.initialUrl }}
                </div>
              </td>
            </template>

            <template v-slot:[`item.testingTime`]="{ item }">
              <td :class="{ ellipsis: true }">
                <div :class="{ ellipsis: true }" :style="{ 'max-width': '100%' }">
                  {{ millisecondsToHHmmss(item.testingTime) }}
                </div>
              </td>
            </template>

            <template v-slot:[`item.creationTimestamp`]="{ item }">
              <td :class="{ ellipsis: true }">
                <div :class="{ ellipsis: true }" :style="{ 'max-width': '100%' }">
                  {{ millisecondsToDateFormat(item.creationTimestamp) }}
                </div>
              </td>
            </template>

            <template v-slot:[`item.testPurposes`]="{ item }">
              <td :class="{ ellipsis: true }">
                <li
                  v-for="(testPurpose, index) in item.testPurposes.slice(0, 3)"
                  :key="index"
                  :class="{ ellipsis: true }"
                  :style="{ 'max-width': '100%' }"
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
            @click="confirmDialogOpened = true"
            color="error"
            >{{ $t("test-result-navigation-drawer.delete-test-results") }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-container>

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="$t('test-result-navigation-drawer.delete-test-results')"
      :message="$t('test-result-navigation-drawer.delete-test-result-message')"
      :onAccept="deleteTestResults"
      @close="confirmDialogOpened = false"
    />

    <information-message-dialog
      :opened="informationDialogOpened"
      :title="$t('common.confirm')"
      :message="$t('test-result-navigation-drawer.delete-test-result-succeeded')"
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

    const selectedTestResults = ref<TestResultSummary[]>([]);
    const testResults = ref<TestResultSummary[]>([]);

    const headers = computed(() => {
      return [
        {
          title: "",
          value: "actions",
          width: "120",
          sortable: false
        },
        {
          title: rootStore.message("test-result-list.name"),
          value: "name",
          width: "280",
          sortable: true
        },
        {
          title: rootStore.message("test-result-list.url"),
          value: "initialUrl",
          width: "450",
          sortable: true
        },
        {
          title: rootStore.message("test-result-list.testing-time"),
          value: "testingTime",
          width: "120",
          sortable: true
        },
        {
          title: rootStore.message("test-result-list.creation-timestamp"),
          value: "creationTimestamp",
          width: "170",
          sortable: true
        },
        {
          title: rootStore.message("test-result-list.test-purpose"),
          value: "testPurposes",
          width: "450",
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
        message: rootStore.message("test-result-navigation-drawer.deleting-test-results")
      });
      try {
        const targetTestResultIds = selectedTestResults.value.map(({ id }) => id);

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
      t: rootStore.message,
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
