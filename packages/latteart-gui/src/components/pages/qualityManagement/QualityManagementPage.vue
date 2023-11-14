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
        {{ store.getters.message("quality-management.attention") }}
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        {{ store.getters.message("quality-management.filter-section") }}
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col>
        <v-select
          v-model="selectedTestMatrixId"
          :items="testMatrixSelectItems"
          item-text="text"
          item-value="id"
          class="mx-3 ellipsis"
          :label="store.getters.message('quality-management.test-matrix')"
        ></v-select>
      </v-col>

      <v-col>
        <v-select
          v-model="selectedGroupId"
          :items="groups"
          item-text="text"
          item-value="id"
          class="mx-3 ellipsis"
          :label="store.getters.message('quality-management.group')"
        ></v-select>
      </v-col>

      <v-col>
        <v-select
          v-model="selectedTestTargetId"
          :items="testTargets"
          item-text="text"
          item-value="id"
          class="mx-3 ellipsis"
          :label="store.getters.message('quality-management.test-target')"
        ></v-select>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        {{ store.getters.message("quality-management.pb-curve") }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <quality-chart
          v-if="rerender"
          :qualityDatas="qualityDatas"
          :totalBugNum="totalBugNum"
        ></quality-chart>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        {{ store.getters.message("quality-management.bug-report") }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="pt-0">
        <v-radio-group v-model="displayMode" row>
          <v-radio
            :label="store.getters.message('quality-management.total-number')"
            :value="DISPLAYMODE_TOTAL"
          ></v-radio>
          <v-radio
            :label="
              store.getters.message('quality-management.times-per-session')
            "
            :value="DISPLAYMODE_TIMES_PER_SESSION"
          ></v-radio>
        </v-radio-group>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        {{
          displayMode === DISPLAYMODE_TOTAL
            ? store.getters.message("quality-management.unit-description-total")
            : store.getters.message("quality-management.unit-description")
        }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="items"
          item-key="name"
          hide-default-footer
        >
          <template v-slot:item="props">
            <tr>
              <td
                v-for="(val, index) in headers"
                :key="index"
                class="py-0 my-0 center-column ellipsis_short"
                :title="!!props.item[val.value] ? props.item[val.value] : '0'"
              >
                {{ !!props.item[val.value] ? props.item[val.value] : "0" }}
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import QualityChart from "@/components/organisms/qualityManagement/QualityChart.vue";
import { TestMatrix, Story } from "@/lib/testManagement/types";
import { TestManagementState } from "@/store/testManagement";
import { computed, defineComponent, ref, watch, nextTick } from "vue";
import { useStore } from "@/store";
import { useRoute } from "vue-router/composables";

export default defineComponent({
  components: {
    "quality-chart": QualityChart,
  },
  setup() {
    const store = useStore();
    const route = useRoute();

    const TOTAL = ref("TOTAL");
    const DISPLAYMODE_TOTAL = ref("displayModeTotal");
    const DISPLAYMODE_TIMES_PER_SESSION = ref("displayModeTimesPerSession");

    const selectedTestMatrixId = ref("");
    const selectedGroupId = ref("");
    const selectedTestTargetId = ref("");
    const displayMode = ref(DISPLAYMODE_TOTAL.value);
    const rerender = ref(true);
    const totalBugNum = ref(0);

    const testMatrices = ref<TestMatrix[]>([]);

    const testMatrixSelectItems = computed(() => {
      const testMatrices = [
        {
          text: store.getters.message("quality-management.all"),
          id: "all",
        },
      ];
      const testManagementState = (store.state as any)
        .testManagement as TestManagementState;
      for (const testMatrix of testManagementState.testMatrices) {
        testMatrices.push({
          text: testMatrix.name,
          id: testMatrix.id,
        });
      }
      if (selectedTestMatrixId.value === "") {
        selectedTestMatrixId.value = "all";
      }
      return testMatrices;
    });

    const groups = computed(() => {
      const groups = [
        {
          text: store.getters.message("quality-management.all"),
          id: "all",
        },
      ];

      for (const testMatrix of testMatrices.value) {
        for (const group of testMatrix.groups) {
          groups.push({
            text: group.name,
            id: group.id,
          });
        }
      }

      if (selectedGroupId.value === "") {
        selectedGroupId.value = "all";
      }

      return groups;
    });

    const testTargets = computed(() => {
      const testTargets = [
        {
          text: store.getters.message("quality-management.all"),
          id: "all",
        },
      ];

      for (const testMatrix of testMatrices.value) {
        for (const group of testMatrix.groups) {
          if (
            selectedGroupId.value !== "all" &&
            selectedGroupId.value !== group.id
          ) {
            continue;
          }
          for (const testTarget of group.testTargets) {
            testTargets.push({
              text: testTarget.name,
              id: `${group.id}_${testTarget.id}`,
            });
          }
        }
      }

      const enable = testTargets.find((testTarget) => {
        return selectedTestTargetId.value === testTarget.id;
      });
      if (!enable) {
        selectedTestTargetId.value = "all";
      }
      return testTargets;
    });

    const headers = computed(() => {
      const headers: any = [
        {
          text: store.getters.message("quality-management.group"),
          align: "center",
          sortable: false,
          value: "group",
          class: "ellipsis_short",
        },
        {
          text: store.getters.message("quality-management.test-target"),
          align: "center",
          sortable: false,
          value: "testTarget",
          class: "ellipsis_short",
        },
      ];

      for (const testMatrix of testMatrices.value) {
        for (const viewPoint of testMatrix.viewPoints) {
          headers.push({
            text: viewPoint.name,
            align: "center",
            sortable: false,
            value: viewPoint.id,
            class: "ellipsis_short",
          });
        }
      }

      headers.push({
        text: store.getters.message("quality-management.total"),
        align: "center",
        sortable: false,
        value: TOTAL.value,
      });
      return headers;
    });

    const items = computed(() => {
      const items: any = [];
      const totalValuePerViewPointIdMap = new Map();

      for (const testMatrix of testMatrices.value) {
        for (const group of testMatrix.groups) {
          if (
            selectedGroupId.value !== "all" &&
            selectedGroupId.value !== group.id
          ) {
            continue;
          }
          for (const testTarget of group.testTargets) {
            if (
              selectedTestTargetId.value !== "all" &&
              selectedTestTargetId.value !== `${group.id}_${testTarget.id}`
            ) {
              continue;
            }
            const row: any = {
              group: group.name,
              testTarget: testTarget.name,
            };

            let rowTotalBugNum = 0;
            let rowTotalSessionNum = 0;
            for (const plan of testTarget.plans) {
              const story: Story = store.getters[
                "testManagement/findStoryByTestTargetAndViewPointId"
              ](testTarget.id, plan.viewPointId, testMatrix.id);
              if (!story || !story.sessions) {
                continue;
              }
              let bugNum = 0;
              let sessionNum = 0;
              for (const session of story.sessions) {
                if (!session.isDone) {
                  continue;
                }
                sessionNum++;
                rowTotalSessionNum++;
                bugNum += session.notes.filter((note) =>
                  (note.tags ?? []).includes("bug")
                ).length;
              }

              const targetCell = totalValuePerViewPointIdMap.get(
                plan.viewPointId
              );
              if (targetCell) {
                totalValuePerViewPointIdMap.set(plan.viewPointId, {
                  bugNum: targetCell.bugNum + bugNum,
                  sessionNum: targetCell.sessionNum + sessionNum,
                });
              } else {
                totalValuePerViewPointIdMap.set(plan.viewPointId, {
                  bugNum,
                  sessionNum,
                });
              }
              rowTotalBugNum += bugNum;
              row[plan.viewPointId] = displayValue(bugNum, sessionNum);
            }

            row[TOTAL.value] = displayValue(rowTotalBugNum, rowTotalSessionNum);
            items.push(row);
          }
        }
      }

      const totalRow: any = {
        group: store.getters.message("quality-management.total"),
        testTarget: " ",
      };

      let tmpTotalBugNum = 0;
      let totalSessionNum = 0;
      for (const [key, value] of totalValuePerViewPointIdMap.entries()) {
        totalRow[key] = displayValue(value.bugNum, value.sessionNum);
        tmpTotalBugNum += value.bugNum;
        totalSessionNum += value.sessionNum;
      }
      totalRow[TOTAL.value] = displayValue(tmpTotalBugNum, totalSessionNum);
      totalBugNum.value = tmpTotalBugNum;
      items.push(totalRow);

      return items;
    });

    const updateCurrentTestMatrix = () => {
      if (selectedTestMatrixId.value === "all") {
        testMatrices.value = (
          (store.state as any).testManagement as TestManagementState
        ).testMatrices;
        return;
      }

      const targetTestMatrix = (
        (store.state as any).testManagement as TestManagementState
      ).testMatrices.find((testMatrix: TestMatrix) => {
        return selectedTestMatrixId.value === testMatrix.id;
      });

      if (targetTestMatrix) {
        testMatrices.value = [targetTestMatrix];
      }
    };

    const displayValue = (bugNum: number, sessionNum: number): string => {
      if (sessionNum === 0) {
        return "0";
      } else if (displayMode.value === DISPLAYMODE_TOTAL.value) {
        return `${bugNum}`;
      } else if (displayMode.value === DISPLAYMODE_TIMES_PER_SESSION.value) {
        return `${bugNum}/${sessionNum}`;
      }
      return "";
    };

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
          if (
            selectedGroupId.value !== "all" &&
            selectedGroupId.value !== group.id
          ) {
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
              const story: Story = store.getters[
                "testManagement/findStoryByTestTargetAndViewPointId"
              ](testTarget.id, plan.viewPointId, testMatrix.id);
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
                  foundBugCount,
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
      const totalLine: any = [
        {
          x: 0,
          y: 0,
        },
      ];
      for (const [index, value] of sessionsData.entries()) {
        let totalValue = 0;
        for (const group of groupList) {
          if (
            selectedGroupId.value !== "all" &&
            selectedGroupId.value !== group.id
          ) {
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
          groupData.push({
            x: index + 1,
            y: setValue,
          });
          totalValue += setValue;
          groupDataMap.set(group.id, groupData);
        }
        totalLine.push({
          x: index + 1,
          y: totalValue,
        });
      }
      const datasets = [];
      for (const [key, groupData] of groupDataMap.entries()) {
        datasets.push({
          label: groupList.find((group) => group.id === key)!.name,
          data: groupData,
          fill: false,
          lineTension: 0,
        });
      }
      if (
        selectedGroupId.value === "all" &&
        selectedTestTargetId.value === "all"
      ) {
        datasets.push({
          label: store.getters.message("quality-management.total"),
          data: totalLine,
          fill: false,
          lineTension: 0,
        });
      }
      const qualityDatas = {
        datasets,
      };
      rerender.value = false;
      nextTick(() => {
        rerender.value = true;
      });

      return qualityDatas;
    });

    watch(selectedTestMatrixId, updateCurrentTestMatrix);

    (async () => {
      await store.dispatch("changeWindowTitle", {
        title: store.getters.message(route.meta?.title ?? ""),
      });

      await store.dispatch("testManagement/readProject");
    })();

    return {
      store,
      DISPLAYMODE_TOTAL,
      DISPLAYMODE_TIMES_PER_SESSION,
      selectedTestMatrixId,
      selectedGroupId,
      selectedTestTargetId,
      displayMode,
      rerender,
      totalBugNum,
      testMatrixSelectItems,
      groups,
      testTargets,
      headers,
      items,
      qualityDatas,
    };
  },
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

@media print
  .no-print
    display: none
  .new-page
    page-break-before: always
</style>
