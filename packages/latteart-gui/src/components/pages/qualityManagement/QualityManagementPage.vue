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
  <v-container class="align-self-start">
    <v-row class="mt-2">
      <v-col cols="12">
        {{ $t("quality-management.attention") }}
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        {{ $t("quality-management.filter-section") }}
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col>
        <v-select
          v-model="selectedTestMatrixId"
          :items="testMatrixSelectItems"
          item-title="text"
          item-value="id"
          class="mx-3 text-truncate"
          :label="$t('quality-management.test-matrix')"
        ></v-select>
      </v-col>

      <v-col>
        <v-select
          v-model="selectedGroupId"
          :items="groups"
          item-title="text"
          item-value="id"
          class="mx-3 text-truncate"
          :label="$t('quality-management.group')"
        ></v-select>
      </v-col>

      <v-col>
        <v-select
          v-model="selectedTestTargetId"
          :items="testTargets"
          item-title="text"
          item-value="id"
          class="mx-3 text-truncate"
          :label="$t('quality-management.test-target')"
        ></v-select>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        {{ $t("quality-management.pb-curve") }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <quality-chart :qualityData="qualityDatas" :totalBugNum="totalBugNum"></quality-chart>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        {{ $t("quality-management.bug-report") }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="pt-0">
        <v-radio-group v-model="displayMode" inline>
          <v-radio
            :label="$t('quality-management.total-number')"
            :value="DISPLAYMODE_TOTAL"
          ></v-radio>
          <v-radio
            :label="$t('quality-management.times-per-session')"
            :value="DISPLAYMODE_TIMES_PER_SESSION"
          ></v-radio>
        </v-radio-group>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        {{
          displayMode === DISPLAYMODE_TOTAL
            ? $t("quality-management.unit-description-total")
            : $t("quality-management.unit-description")
        }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-data-table :headers="headers" :items="items" item-key="name">
          <template v-slot:item="props">
            <tr>
              <td
                v-for="(val, index) in headers"
                :key="index"
                class="py-0 my-0 center-column ellipsis_short"
                :title="!!props.item[val.value] ? displayValue(props.item[val.value]) : '0'"
              >
                {{ !!props.item[val.value] ? displayValue(props.item[val.value]) : "0" }}
              </td>
            </tr>
          </template>
          <template #bottom></template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import QualityChart from "@/components/organisms/qualityManagement/QualityChart.vue";
import { type TestMatrix, type Story } from "@/lib/testManagement/types";
import { useRootStore } from "@/stores/root";
import { useTestManagementStore } from "@/stores/testManagement";
import { computed, defineComponent, ref, watch } from "vue";
import { createQualityTableBuilder } from "@/lib/testManagement/qualityTable";
import { useRoute } from "vue-router";

export default defineComponent({
  components: {
    "quality-chart": QualityChart
  },
  setup() {
    const rootStore = useRootStore();
    const testManagementStore = useTestManagementStore();
    const route = useRoute();

    const TOTAL = ref("TOTAL");
    const DISPLAYMODE_TOTAL = ref("displayModeTotal");
    const DISPLAYMODE_TIMES_PER_SESSION = ref("displayModeTimesPerSession");

    const selectedTestMatrixId = ref("all");
    const selectedGroupId = ref("all");
    const selectedTestTargetId = ref("all");
    const displayMode = ref(DISPLAYMODE_TOTAL.value);

    const totalBugNum = ref(0);

    const testMatrices = ref<TestMatrix[]>([]);

    const testMatrixSelectItems = computed(() => {
      const _testMatrices = [
        {
          text: rootStore.message("quality-management.all"),
          id: "all"
        }
      ];
      for (const testMatrix of testManagementStore.testMatrices) {
        _testMatrices.push({
          text: testMatrix.name,
          id: testMatrix.id
        });
      }

      return _testMatrices;
    });

    const groups = computed(() => {
      const _groups = [
        {
          text: rootStore.message("quality-management.all"),
          id: "all"
        }
      ];

      for (const testMatrix of testMatrices.value) {
        for (const group of testMatrix.groups) {
          _groups.push({
            text: group.name,
            id: group.id
          });
        }
      }

      return _groups;
    });

    const testTargets = computed(() => {
      const _testTargets = [
        {
          text: rootStore.message("quality-management.all"),
          id: "all"
        }
      ];

      for (const testMatrix of testMatrices.value) {
        for (const group of testMatrix.groups) {
          if (selectedGroupId.value !== "all" && selectedGroupId.value !== group.id) {
            continue;
          }
          for (const testTarget of group.testTargets) {
            _testTargets.push({
              text: testTarget.name,
              id: `${group.id}_${testTarget.id}`
            });
          }
        }
      }

      return _testTargets;
    });

    watch(testMatrices, () => {
      if (selectedTestMatrixId.value === "") {
        selectedTestMatrixId.value = "all";
      }
    });

    watch(groups, () => {
      if (selectedGroupId.value === "") {
        selectedGroupId.value = "all";
      }
    });

    watch(testTargets, (newTestTargets) => {
      const enable = newTestTargets.find((testTarget) => {
        return selectedTestTargetId.value === testTarget.id;
      });
      if (!enable) {
        selectedTestTargetId.value = "all";
      }
    });

    const qualityTable = computed(() => {
      const stories = testManagementStore.selectStories({
        groupId: selectedGroupId.value === "all" ? undefined : selectedGroupId.value,
        testTargetId: selectedTestTargetId.value === "all" ? undefined : selectedTestTargetId.value
      });

      return createQualityTableBuilder({
        totalRowId: TOTAL.value,
        totalRowName: rootStore.message("quality-management.total"),
        informationColumnIds: {
          testMatrix: "testMatrix",
          group: "group",
          testTarget: "testTarget",
          total: TOTAL.value
        }
      }).buildQualityTable(stories);
    });

    const headers = computed(() => {
      const headerColumns = qualityTable.value.getHeaderColumns();

      const _headers = headerColumns.map(({ colName, text }) => {
        if (colName === "testMatrix") {
          return {
            title: rootStore.message("quality-management.test-matrix"),
            align: "center" as const,
            sortable: false,
            value: "testMatrix",
            headerProps: { class: "ellipsis_short" }
          };
        }

        if (colName === "group") {
          return {
            title: rootStore.message("quality-management.group"),
            align: "center" as const,
            sortable: false,
            value: "group",
            headerProps: { class: "ellipsis_short" }
          };
        }

        if (colName === "testTarget") {
          return {
            title: rootStore.message("quality-management.test-target"),
            align: "center" as const,
            sortable: false,
            value: "testTarget",
            headerProps: { class: "ellipsis_short" }
          };
        }

        if (colName === TOTAL.value) {
          return {
            title: rootStore.message("quality-management.total"),
            align: "center" as const,
            sortable: false,
            value: TOTAL.value
          };
        }

        return {
          title: text ?? "",
          align: "center" as const,
          sortable: false,
          value: colName,
          headerProps: { class: "ellipsis_short" }
        };
      });

      return _headers;
    });

    const items = computed(() => {
      const _items: {
        [testTargetId: string]: {
          [colName: string]: string | { doneSessionNum: number; bugNum: number };
        };
      } = {
        ...qualityTable.value.collectTestTargetQualityRows(),
        ...qualityTable.value.getTotalQualityRow()
      };

      return Object.values(_items);
    });

    watch(items, (newItems) => {
      const total = newItems[newItems.length - 1][TOTAL.value];
      if (typeof total === "string") {
        return;
      }

      totalBugNum.value = total.bugNum;
    });

    const qualityDatas = computed(() => {
      const groupList: Array<{ name: string; id: string }> = [];
      const sessionsData: Array<{
        groupName: string;
        groupId: string;
        testTargetName: string;
        testTargetId: string;
        doneDate: string;
        foundBugCount: number;
      }> = [];
      for (const testMatrix of testMatrices.value) {
        for (const group of testMatrix.groups) {
          if (selectedGroupId.value !== "all" && selectedGroupId.value !== group.id) {
            continue;
          }
          groupList.push({ name: group.name, id: group.id });
          for (const testTarget of group.testTargets) {
            if (
              selectedTestTargetId.value !== "all" &&
              selectedTestTargetId.value !== `${group.id}_${testTarget.id}`
            ) {
              continue;
            }
            for (const plan of testTarget.plans) {
              const story: Story = testManagementStore.findStoryByTestTargetAndViewPointId(
                testTarget.id,
                plan.viewPointId,
                testMatrix.id
              );
              if (!story || !story.sessions) {
                continue;
              }
              for (const session of story.sessions) {
                if (!session.isDone) {
                  continue;
                }
                const foundBugCount = session.notes.filter((note) =>
                  (note.tags ?? []).includes("bug")
                ).length;
                sessionsData.push({
                  groupName: group.name,
                  groupId: group.id,
                  testTargetName: testTarget.name,
                  testTargetId: `${group.id}_${testTarget.id}`,
                  doneDate: session.doneDate,
                  foundBugCount
                });
              }
            }
          }
        }
      }

      sessionsData.sort((a, b) => {
        if (a.doneDate > b.doneDate) {
          return 1;
        } else {
          return -1;
        }
      });

      const groupDataMap = new Map();
      const totalLine: any = [{ x: 0, y: 0 }];
      for (const [index, value] of sessionsData.entries()) {
        let totalValue = 0;
        for (const group of groupList) {
          if (selectedGroupId.value !== "all" && selectedGroupId.value !== group.id) {
            continue;
          }
          if (
            selectedTestTargetId.value !== "all" &&
            selectedTestTargetId.value.split("_")[0] !== group.id
          ) {
            continue;
          }
          let groupData = groupDataMap.get(group.id);
          if (!groupData) {
            groupData = [{ x: 0, y: 0 }];
          }

          let setValue = groupData[groupData.length - 1].y;
          if (
            value.groupId === group.id &&
            (selectedTestTargetId.value === "all" ||
              selectedTestTargetId.value === value.testTargetId)
          ) {
            setValue += value.foundBugCount;
          }
          groupData.push({ x: index + 1, y: setValue });
          totalValue += setValue;
          groupDataMap.set(group.id, groupData);
        }
        totalLine.push({ x: index + 1, y: totalValue });
      }
      const datasets = [];
      for (const [key, groupData] of groupDataMap.entries()) {
        datasets.push({
          label: groupList.find((group) => group.id === key)!.name,
          data: groupData
        });
      }
      if (selectedGroupId.value === "all" && selectedTestTargetId.value === "all") {
        datasets.push({
          label: rootStore.message("quality-management.total"),
          data: totalLine
        });
      }
      const qualityDatas = { datasets };

      return qualityDatas;
    });

    const updateCurrentTestMatrix = () => {
      if (selectedTestMatrixId.value === "all") {
        testMatrices.value = testManagementStore.testMatrices;
        return;
      }

      const targetTestMatrix = testManagementStore.testMatrices.find((testMatrix: TestMatrix) => {
        return selectedTestMatrixId.value === testMatrix.id;
      });

      if (targetTestMatrix) {
        testMatrices.value = [targetTestMatrix];
      }
    };

    const displayValue = (source: string | { doneSessionNum: number; bugNum: number }): string => {
      if (typeof source === "string") {
        return source;
      }

      if (source.doneSessionNum === 0) {
        return "0";
      } else if (displayMode.value === DISPLAYMODE_TOTAL.value) {
        return `${source.bugNum}`;
      } else if (displayMode.value === DISPLAYMODE_TIMES_PER_SESSION.value) {
        return `${source.bugNum}/${source.doneSessionNum}`;
      }
      return "";
    };

    watch(selectedTestMatrixId, updateCurrentTestMatrix);

    (async () => {
      rootStore.changeWindowTitle({
        title: rootStore.message(route.meta?.title ?? "")
      });

      await testManagementStore.readProject();
    })();

    updateCurrentTestMatrix();

    return {
      t: rootStore.message,
      DISPLAYMODE_TOTAL,
      DISPLAYMODE_TIMES_PER_SESSION,
      selectedTestMatrixId,
      selectedGroupId,
      selectedTestTargetId,
      displayMode,
      totalBugNum,
      testMatrixSelectItems,
      groups,
      testTargets,
      headers,
      items,
      qualityDatas,
      displayValue
    };
  }
});
</script>

<style lang="sass" scoped>
.center-column
  text-align: center
tr
  background-color: #FAFAFA
.table-message
  color: #666666

@mixin ellipsis
  overflow: hidden !important
  text-overflow: ellipsis !important
  white-space: nowrap !important

:deep(.ellipsis_short) span
  @include ellipsis

@media print
  .no-print
    display: none
  .new-page
    page-break-before: always
</style>
