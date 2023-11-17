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
          <test-result-import-trigger @update="loadTestResultSummaries">
            <template v-slot:activator="{ on, isDisabled }">
              <v-btn @click="on" :disabled="isDisabled">{{
                store.getters.message(
                  "import-export-dialog.test-result-import-title"
                )
              }}</v-btn>
            </template>
          </test-result-import-trigger>

          <v-text-field
            v-model="search"
            label="Search"
            clearable
          ></v-text-field>

          <v-data-table
            v-model="selectedTestResults"
            :headers="headers"
            :items="testResults"
            item-key="id"
            show-select
            :items-per-page="10"
            :search="search"
            :custom-filter="filterItems"
          >
            <template v-slot:[`item.actions`]="{ item }">
              <td :class="{ ellipsis: true }" :style="{ 'max-width': 0 }">
                <test-result-load-trigger :testResultIds="[item.id]">
                  <template v-slot:activator="{ on, disabled }">
                    <v-btn
                      icon
                      large
                      color="primary"
                      @click="goToHistoryView(on)"
                      :disabled="disabled"
                      :title="store.getters.message('test-result-list.load')"
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
                      large
                      color="primary"
                      @click="on"
                      :disabled="disabled"
                      :title="store.getters.message('test-result-list.edit')"
                    >
                      <v-icon>edit</v-icon>
                    </v-btn>
                  </template>
                </test-result-name-edit-trigger>
              </td>
            </template>

            <template v-slot:[`item.name`]="{ item }">
              <td :class="{ ellipsis: true }" :style="{ 'max-width': 0 }">
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
              <td :class="{ ellipsis: true }" :style="{ 'max-width': 0 }">
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
              <td :class="{ ellipsis: true }" :style="{ 'max-width': 0 }">
                <div
                  :class="{ ellipsis: true }"
                  :style="{ 'max-width': '100%' }"
                >
                  {{ millisecondsToHHmmss(item.testingTime) }}
                </div>
              </td>
            </template>

            <template v-slot:[`item.creationTimestamp`]="{ item }">
              <td :class="{ ellipsis: true }" :style="{ 'max-width': 0 }">
                <div
                  :class="{ ellipsis: true }"
                  :style="{ 'max-width': '100%' }"
                >
                  {{ millisecondsToDateFormat(item.creationTimestamp) }}
                </div>
              </td>
            </template>

            <template v-slot:[`item.testPurposes`]="{ item }">
              <td :class="{ ellipsis: true }" :style="{ 'max-width': 0 }">
                <li
                  v-for="testPurpose in item.testPurposes.slice(0, 3)"
                  :key="testPurpose.creationTimestamp"
                  :class="{ ellipsis: true }"
                  :style="{ 'max-width': '100%' }"
                  :title="testPurpose.value"
                >
                  {{ testPurpose.value }}
                </li>
                <span v-if="item.testPurposes.length > 3">… and more</span>
              </td>
            </template>
          </v-data-table></v-card-text
        >

        <v-card-actions>
          <v-btn
            :disabled="isDisabled"
            @click="confirmDialogOpened = true"
            color="error"
            >{{
              store.getters.message(
                "test-result-navigation-drawer.delete-test-results"
              )
            }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-container>

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="
        store.getters.message(
          'test-result-navigation-drawer.delete-test-results'
        )
      "
      :message="
        store.getters.message(
          'test-result-navigation-drawer.delete-test-result-message'
        )
      "
      :onAccept="deleteTestResults"
      @close="confirmDialogOpened = false"
    />

    <information-message-dialog
      :opened="informationDialogOpened"
      :title="store.getters.message('common.confirm')"
      :message="
        store.getters.message(
          'test-result-navigation-drawer.delete-test-result-succeeded'
        )
      "
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
import { TestResultSummary } from "@/lib/operationHistory/types";
import { OperationHistoryState } from "@/store/operationHistory";
import ConfirmDialog from "@/components/molecules/ConfirmDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import InformationMessageDialog from "@/components/molecules/InformationMessageDialog.vue";
import TestResultImportTrigger from "@/components/organisms/common/TestResultImportTrigger.vue";
import TestResultLoadTrigger from "@/components/organisms/common/TestResultLoadTrigger.vue";
import TestResultNameEditTrigger from "@/components/organisms/common/TestResultNameEditTrigger.vue";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";
import { useRoute, useRouter } from "vue-router/composables";

export default defineComponent({
  components: {
    "confirm-dialog": ConfirmDialog,
    "information-message-dialog": InformationMessageDialog,
    "error-message-dialog": ErrorMessageDialog,
    "test-result-import-trigger": TestResultImportTrigger,
    "test-result-load-trigger": TestResultLoadTrigger,
    "test-result-name-edit-trigger": TestResultNameEditTrigger,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    const confirmDialogOpened = ref(false);
    const informationDialogOpened = ref(false);

    const errorDialogOpened = ref(false);
    const errorMessage = ref("");

    const selectedTestResults = ref<TestResultSummary[]>([]);
    const testResults = ref<TestResultSummary[]>([]);
    const search = ref("");

    const headers = computed(() => {
      return [
        {
          text: "",
          value: "actions",
          width: "120",
          sortable: false,
        },
        {
          text: store.getters.message("test-result-list.name"),
          value: "name",
          width: "280",
        },
        {
          text: store.getters.message("test-result-list.url"),
          value: "initialUrl",
          width: "450",
        },
        {
          text: store.getters.message("test-result-list.testing-time"),
          value: "testingTime",
          width: "120",
        },
        {
          text: store.getters.message("test-result-list.creation-timestamp"),
          value: "creationTimestamp",
          width: "170",
        },
        {
          text: store.getters.message("test-result-list.test-purpose"),
          value: "testPurposes",
          width: "450",
        },
      ];
    });

    const isDisabled = computed(() => {
      return selectedTestResults.value.length === 0;
    });

    const operationHistoryState = computed(() => {
      return (store.state as any).operationHistory as OperationHistoryState;
    });

    const loadTestResultSummaries = async () => {
      testResults.value = await store
        .dispatch("operationHistory/getTestResults")
        .catch(() => []);
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
      await store.dispatch("openProgressDialog", {
        message: store.getters.message(
          "test-result-navigation-drawer.deleting-test-results"
        ),
      });
      try {
        const targetTestResultIds = selectedTestResults.value.map(
          ({ id }) => id
        );

        // Delete selected test results.
        await store.dispatch("operationHistory/deleteTestResults", {
          testResultIds: targetTestResultIds,
        });

        await loadTestResultSummaries();

        selectedTestResults.value = [];

        // Clear display information if it contains test results you are viewing.
        if (
          targetTestResultIds.includes(
            operationHistoryState.value.testResultInfo.id
          )
        ) {
          store.commit("operationHistory/removeStoringTestResultInfos", {
            testResultInfos: [
              {
                id: operationHistoryState.value.testResultInfo.id,
                name: operationHistoryState.value.testResultInfo.name,
              },
            ],
          });
          await store.dispatch("operationHistory/clearTestResult");
          store.commit("operationHistory/clearScreenTransitionDiagramGraph");
          store.commit("operationHistory/clearElementCoverages");
          store.commit("operationHistory/clearInputValueTable");
          await store.dispatch("captureControl/resetTimer");
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
        await store.dispatch("closeProgressDialog");
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

    (async () => {
      await store.dispatch("changeWindowTitle", {
        title: store.getters.message(route.meta?.title ?? ""),
      });

      await loadTestResultSummaries();
    })();

    return {
      store,
      confirmDialogOpened,
      informationDialogOpened,
      errorDialogOpened,
      errorMessage,
      selectedTestResults,
      testResults,
      search,
      headers,
      isDisabled,
      loadTestResultSummaries,
      filterItems,
      millisecondsToHHmmss,
      millisecondsToDateFormat,
      deleteTestResults,
      goToHistoryView,
    };
  },
});
</script>
