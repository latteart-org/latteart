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
        {{ $store.getters.message("quality-management.attention") }}
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        {{ $store.getters.message("quality-management.filter-section") }}
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
          :label="$store.getters.message('quality-management.test-matrix')"
        ></v-select>
      </v-col>

      <v-col>
        <v-select
          v-model="selectedGroupId"
          :items="groups"
          item-text="text"
          item-value="id"
          class="mx-3 ellipsis"
          :label="$store.getters.message('quality-management.group')"
        ></v-select>
      </v-col>

      <v-col>
        <v-select
          v-model="selectedTestTargetId"
          :items="testTargets"
          item-text="text"
          item-value="id"
          class="mx-3 ellipsis"
          :label="$store.getters.message('quality-management.test-target')"
        ></v-select>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        {{ $store.getters.message("quality-management.pb-curve") }}
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
        {{ $store.getters.message("quality-management.bug-report") }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="pt-0">
        <v-radio-group v-model="displayMode" row>
          <v-radio
            :label="$store.getters.message('quality-management.total-number')"
            :value="DISPLAYMODE_TOTAL"
          ></v-radio>
          <v-radio
            :label="
              $store.getters.message('quality-management.times-per-session')
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
            ? $store.getters.message(
                "quality-management.unit-description-total"
              )
            : $store.getters.message("quality-management.unit-description")
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
import { Component, Vue, Watch } from "vue-property-decorator";
import QualityChart from "@/components/organisms/qualityManagement/QualityChart.vue";
import { TestMatrix, Story } from "@/lib/testManagement/types";
import { TestManagementState } from "@/store/testManagement";

@Component({
  components: {
    "quality-chart": QualityChart,
  },
})
export default class QualityManagementPage extends Vue {
  private isViewerMode = (this as any).$isViewerMode
    ? (this as any).$isViewerMode
    : false;
  private TOTAL = "TOTAL";
  private DISPLAYMODE_TOTAL = "displayModeTotal";
  private DISPLAYMODE_TIMES_PER_SESSION = "displayModeTimesPerSession";

  private selectedTestMatrixId = "";
  private selectedGroupId = "";
  private selectedTestTargetId = "";
  private displayMode = this.DISPLAYMODE_TOTAL;
  private rerender = true;
  private totalBugNum = 0;

  private testMatrices: TestMatrix[] = [];

  private get testMatrixSelectItems() {
    const testMatrices = [
      {
        text: this.$store.getters.message("quality-management.all"),
        id: "all",
      },
    ];
    const testManagementState = this.$store.state
      .testManagement as TestManagementState;
    for (const testMatrix of testManagementState.testMatrices) {
      testMatrices.push({
        text: testMatrix.name,
        id: testMatrix.id,
      });
    }
    if (this.selectedTestMatrixId === "") {
      this.selectedTestMatrixId = "all";
    }
    return testMatrices;
  }

  private get groups() {
    const groups = [
      {
        text: this.$store.getters.message("quality-management.all"),
        id: "all",
      },
    ];

    for (const testMatrix of this.testMatrices) {
      for (const group of testMatrix.groups) {
        groups.push({
          text: group.name,
          id: group.id,
        });
      }
    }

    if (this.selectedGroupId === "") {
      this.selectedGroupId = "all";
    }

    return groups;
  }

  private get testTargets() {
    const testTargets = [
      {
        text: this.$store.getters.message("quality-management.all"),
        id: "all",
      },
    ];

    for (const testMatrix of this.testMatrices) {
      for (const group of testMatrix.groups) {
        if (
          this.selectedGroupId !== "all" &&
          this.selectedGroupId !== group.id
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
      return this.selectedTestTargetId === testTarget.id;
    });
    if (!enable) {
      this.selectedTestTargetId = "all";
    }
    return testTargets;
  }

  private get headers() {
    const headers: any = [
      {
        text: this.$store.getters.message("quality-management.test-matrix"),
        align: "center",
        sortable: false,
        value: "testMatrix",
        class: "ellipsis_short",
      },
      {
        text: this.$store.getters.message("quality-management.group"),
        align: "center",
        sortable: false,
        value: "group",
        class: "ellipsis_short",
      },
      {
        text: this.$store.getters.message("quality-management.test-target"),
        align: "center",
        sortable: false,
        value: "testTarget",
        class: "ellipsis_short",
      },
    ];

    for (const testMatrix of this.testMatrices) {
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
      text: this.$store.getters.message("quality-management.total"),
      align: "center",
      sortable: false,
      value: this.TOTAL,
    });
    return headers;
  }
  private get items() {
    const items: any = [];
    const totalValuePerViewPointIdMap = new Map();

    for (const testMatrix of this.testMatrices) {
      for (const group of testMatrix.groups) {
        if (
          this.selectedGroupId !== "all" &&
          this.selectedGroupId !== group.id
        ) {
          continue;
        }
        for (const testTarget of group.testTargets) {
          if (
            this.selectedTestTargetId !== "all" &&
            this.selectedTestTargetId !== `${group.id}_${testTarget.id}`
          ) {
            continue;
          }
          const row: any = {
            testMatrix: testMatrix.name,
            group: group.name,
            testTarget: testTarget.name,
          };

          let rowTotalBugNum = 0;
          let rowTotalSessionNum = 0;
          for (const plan of testTarget.plans) {
            const story: Story = this.$store.getters[
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
            row[plan.viewPointId] = this.displayValue(bugNum, sessionNum);
          }

          row[this.TOTAL] = this.displayValue(
            rowTotalBugNum,
            rowTotalSessionNum
          );
          items.push(row);
        }
      }
    }

    const totalRow: any = {
      testMatrix: this.$store.getters.message("quality-management.total"),
      group: " ",
      testTarget: " ",
    };

    let totalBugNum = 0;
    let totalSessionNum = 0;
    for (const [key, value] of totalValuePerViewPointIdMap.entries()) {
      totalRow[key] = this.displayValue(value.bugNum, value.sessionNum);
      totalBugNum += value.bugNum;
      totalSessionNum += value.sessionNum;
    }
    totalRow[this.TOTAL] = this.displayValue(totalBugNum, totalSessionNum);
    this.totalBugNum = totalBugNum;
    items.push(totalRow);

    return items;
  }

  private get locale() {
    return this.$store.getters.getLocale();
  }

  @Watch("selectedTestMatrixId")
  private updateCurrentTestMatrix() {
    if (this.selectedTestMatrixId === "all") {
      this.testMatrices = this.$store.state.testManagement.testMatrices;
      return;
    }

    const targetTestMatrix = this.$store.state.testManagement.testMatrices.find(
      (testMatrix: TestMatrix) => {
        return this.selectedTestMatrixId === testMatrix.id;
      }
    );

    if (targetTestMatrix) {
      this.testMatrices = [targetTestMatrix];
    }
  }

  private async created() {
    this.$store.dispatch("changeWindowTitle", {
      title: this.$store.getters.message(this.$route.meta?.title ?? ""),
    });

    await this.$store.dispatch("testManagement/readProject");
  }

  private displayValue(bugNum: number, sessionNum: number): string {
    if (sessionNum === 0) {
      return "0";
    } else if (this.displayMode === this.DISPLAYMODE_TOTAL) {
      return `${bugNum}`;
    } else if (this.displayMode === this.DISPLAYMODE_TIMES_PER_SESSION) {
      return `${bugNum}/${sessionNum}`;
    }
    return "";
  }

  private get qualityDatas() {
    const groupList: Array<{ name: string; id: string }> = [];
    const sessionsData: Array<{
      groupName: string;
      groupId: string;
      testTargetName: string;
      testTargetId: string;
      doneDate: string;
      foundBugCount: number;
    }> = [];
    for (const testMatrix of this.testMatrices) {
      for (const group of testMatrix.groups) {
        if (
          this.selectedGroupId !== "all" &&
          this.selectedGroupId !== group.id
        ) {
          continue;
        }
        groupList.push({ name: group.name, id: group.id });
        for (const testTarget of group.testTargets) {
          if (
            this.selectedTestTargetId !== "all" &&
            this.selectedTestTargetId !== `${group.id}_${testTarget.id}`
          ) {
            continue;
          }
          for (const plan of testTarget.plans) {
            const story: Story = this.$store.getters[
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
          this.selectedGroupId !== "all" &&
          this.selectedGroupId !== group.id
        ) {
          continue;
        }
        if (
          this.selectedTestTargetId !== "all" &&
          this.selectedTestTargetId.split("_")[0] !== group.id
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
          (this.selectedTestTargetId === "all" ||
            this.selectedTestTargetId === value.testTargetId)
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
    if (this.selectedGroupId === "all" && this.selectedTestTargetId === "all") {
      datasets.push({
        label: this.$store.getters.message("quality-management.total"),
        data: totalLine,
        fill: false,
        lineTension: 0,
      });
    }
    const qualityDatas = {
      datasets,
    };
    this.rerender = false;
    Vue.nextTick(() => {
      this.rerender = true;
    });

    return qualityDatas;
  }
}
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
