<!--
 Copyright 2025 NTT Corporation.

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
  <v-card flat height="100%">
    <v-card-title class="pt-0">
      <v-text-field
        v-model="search"
        variant="underlined"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>

    <v-data-table
      v-model="selectedTestResults"
      :headers="headers"
      :items="testResults"
      item-value="id"
      :show-select="deletable"
      items-per-page="-1"
      :search="search"
      height="calc(100% - 64px)"
      :style="{ height: '100%', width: '100%' }"
      fixed-header
    >
      <template #[`item.name`]="{ item }">
        <td v-ripple :class="{ ellipsis: true }" @click="clickRowItem(item.id, item.name)">
          <v-menu location="start" open-on-hover>
            <template #activator="{ props }">
              <div
                v-bind="props"
                :style="{
                  height: '100%',
                  display: 'flex',
                  'align-items': 'center',
                  cursor: 'pointer'
                }"
                :title="$t('common.load')"
              >
                <div :class="{ ellipsis: true }" :style="{ 'max-width': '100%' }">
                  {{ item.name }}
                </div>
              </div>
            </template>

            <v-card :style="{ 'max-width': '420px' }">
              <v-list>
                <v-list-item>
                  <v-list-item-title v-if="!isEditing" :title="item.name">{{
                    item.name
                  }}</v-list-item-title>
                  <v-list-item-title v-else
                    ><v-text-field
                      variant="underlined"
                      :model-value="item.name"
                      @update:model-value="changeTestResultName"
                      @click.stop
                  /></v-list-item-title>

                  <v-list-item-action v-if="editable">
                    <v-btn
                      v-if="!isEditing"
                      icon
                      :title="$t('common.test-result-name-edit')"
                      @click.stop="editTestResultName(item.id, item.name)"
                      ><v-icon>edit</v-icon></v-btn
                    >
                    <v-btn
                      v-else
                      icon
                      :title="$t('common.test-result-name-edit')"
                      @click.stop="editTestResultName(item.id, newTestResultName)"
                      ><v-icon color="red">edit</v-icon></v-btn
                    >
                  </v-list-item-action>
                </v-list-item>
              </v-list>

              <v-divider></v-divider>

              <v-list>
                <v-list-item>
                  <v-list-item-title>{{ $t("common.target-url") }}</v-list-item-title>
                  <v-list-item-subtitle :title="item.initialUrl">
                    {{ item.initialUrl }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <v-list-item-title>{{ $t("common.testing-time") }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ millisecondsToHHmmss(item.testingTime) }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="item.testPurposes.length > 0">
                  <v-list-item-title>{{ $t("common.test-purpose") }}</v-list-item-title>
                  <v-list-item-subtitle
                    v-for="(testPurpose, i) in item.testPurposes.slice(0, 5)"
                    :key="i"
                  >
                    <li :title="testPurpose.value" class="text-truncate">
                      {{ testPurpose.value }}
                    </li>
                  </v-list-item-subtitle>
                  <v-list-item-subtitle v-if="item.testPurposes.length > 5" class="pl-5"
                    >… and more</v-list-item-subtitle
                  >
                </v-list-item>

                <v-list-item v-if="item.creationTimestamp > 0">
                  <v-list-item-title>{{ $t("common.creation-timestamp") }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ millisecondsToDateFormat(item.creationTimestamp) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </td>
      </template>
      <template #bottom />
    </v-data-table>
  </v-card>
</template>

<script lang="ts">
import { formatDateTime, formatTime } from "@/lib/common/Timestamp";
import { type TestResultSummary } from "@/lib/operationHistory/types";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useRootStore } from "@/stores/root";
import { computed, defineComponent, ref, toRefs, watch, type PropType } from "vue";

export default defineComponent({
  props: {
    deletable: { type: Boolean, default: false },
    editable: { type: Boolean, default: false },
    items: {
      type: Array as PropType<TestResultSummary[]>,
      default: () => [],
      required: true
    }
  },
  setup(props, context) {
    const rootStore = useRootStore();
    const operationHistoryStore = useOperationHistoryStore();

    const selectedTestResults = ref<TestResultSummary[]>([]);
    const search = ref("");
    const isEditing = ref(false);
    const oldTestResultName = ref("");
    const newTestResultName = ref("");

    const testResults = ref<TestResultSummary[]>(props.items);

    const headers = computed(() => {
      return [
        {
          title: rootStore.message("common.test-result-name"),
          value: "name"
        }
      ];
    });

    const getTestResultList = () => {
      testResults.value = props.items;
    };

    const updateCheckedTestResults = (): void => {
      const checkedTestResults = selectedTestResults.value.map(({ id }) => id);
      operationHistoryStore.checkedTestResults = checkedTestResults;
    };

    const editTestResultName = async (testResultId: string, testResultName: string) => {
      if (isEditing.value) {
        if (newTestResultName.value !== "" && oldTestResultName.value !== testResultName) {
          await operationHistoryStore.changeTestResultName({
            testResultId,
            testResultName
          });
          const targetIndex = testResults.value.findIndex(({ id }) => id === testResultId);
          testResults.value.splice(targetIndex, 1, {
            ...testResults.value[targetIndex],
            name: testResultName
          });
          newTestResultName.value = "";
        }

        isEditing.value = false;
      } else {
        oldTestResultName.value = testResultName;
        isEditing.value = true;
      }
    };

    const changeTestResultName = (name: string) => {
      newTestResultName.value = name;
    };

    const millisecondsToHHmmss = (millisecondsTime: number) => {
      return formatTime(millisecondsTime);
    };

    const millisecondsToDateFormat = (millisecondsTime: number) => {
      return formatDateTime(millisecondsTime);
    };

    const clickRowItem = (id: string, name: string): void => {
      context.emit("click-item", { id, name });
    };

    const { items } = toRefs(props);
    watch(items, getTestResultList);
    watch(selectedTestResults, updateCheckedTestResults);

    return {
      selectedTestResults,
      search,
      isEditing,
      newTestResultName,
      testResults,
      headers,
      editTestResultName,
      changeTestResultName,
      millisecondsToHHmmss,
      millisecondsToDateFormat,
      clickRowItem
    };
  }
});
</script>

<style lang="sass" scoped>

.ellipsis
  overflow: hidden
  white-space: nowrap
  text-overflow: ellipsis
</style>
