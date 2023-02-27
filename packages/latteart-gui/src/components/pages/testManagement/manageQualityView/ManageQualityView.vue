<!--
 Copyright 2022 NTT Corporation.

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
    <v-layout column pa-3 pb-5 justify-center align-left>
      <v-flex>
        <v-layout row align-center>
          <p class="title">
            {{ $store.getters.message("manage-quality.title") }}
          </p>
          <v-spacer></v-spacer>
        </v-layout>
      </v-flex>
      <v-flex>
        {{ $store.getters.message("manage-quality.filter-section") }}
        <v-layout row align-center>
          <v-flex xs6>
            <v-layout row align-center>
              {{ $store.getters.message("manage-quality.group") }} :
              <v-select
                single-line
                v-model="selectedGroup"
                :items="groups"
                item-text="text"
                item-value="id"
                class="mx-3 ellipsis"
              ></v-select>
            </v-layout>
          </v-flex>
          <v-flex xs6>
            <v-layout row align-center>
              {{ $store.getters.message("manage-quality.test-target") }} :
              <v-select
                single-line
                v-model="selectedTestTarget"
                :items="testTargets"
                item-text="text"
                item-value="id"
                class="mx-3 ellipsis"
              ></v-select>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex pb-3>
        {{ $store.getters.message("manage-quality.pb-curve") }}
        <quality-chart
          v-if="rerender"
          :qualityDatas="qualityDatas"
          :totalBugNum="totalBugNum"
        ></quality-chart>
      </v-flex>
    </v-layout>
    <v-layout column pa-3 pb-5 justify-center align-left class="new-page">
      <v-flex>
        {{ $store.getters.message("manage-quality.bug-report") }}
        <v-layout row align-center>
          <v-flex xs12>
            <v-layout row align-center>
              <v-radio-group v-model="displayMode" row>
                <v-radio
                  :label="$store.getters.message('manage-quality.total-number')"
                  :value="DISPLAYMODE_TOTAL"
                ></v-radio>
                <v-radio
                  :label="
                    $store.getters.message('manage-quality.times-per-session')
                  "
                  :value="DISPLAYMODE_TIMES_PER_SESSION"
                ></v-radio>
              </v-radio-group>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex xs12>
        {{
          displayMode === DISPLAYMODE_TOTAL
            ? $store.getters.message("manage-quality.unit-description-total")
            : $store.getters.message("manage-quality.unit-description")
        }}
        <v-data-table
          :headers="headers"
          :items="items"
          item-key="name"
          hide-actions
        >
          <template v-slot:items="props">
            <td
              v-for="(val, index) in headers"
              :key="index"
              class="py-0 my-0 center-column ellipsis_short"
              :title="!!props.item[val.value] ? props.item[val.value] : '0'"
            >
              {{ !!props.item[val.value] ? props.item[val.value] : "0" }}
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import QualityChart from "./organisms/QualityChart.vue";
import { TestMatrix, Story } from "@/lib/testManagement/types";

@Component({
  components: {
    "quality-chart": QualityChart,
  },
})
export default class ManageQualityView extends Vue {
  private isViewerMode = (this as any).$isViewerMode
    ? (this as any).$isViewerMode
    : false;
  private TOTAL = "TOTAL";
  private DISPLAYMODE_TOTAL = "displayModeTotal";
  private DISPLAYMODE_TIMES_PER_SESSION = "displayModeTimesPerSession";

  private selectedGroup = "";
  private selectedTestTarget = "";
  private displayMode = this.DISPLAYMODE_TOTAL;
  private rerender = true;
  private totalBugNum = 0;

  private testMatrix: TestMatrix = {
    id: "",
    name: "",
    index: 0,
    viewPoints: [],
    groups: [],
  };

  private get groups() {
    const groups = [
      {
        text: this.$store.getters.message("manage-quality.all"),
        id: "all",
      },
    ];
    for (const group of this.testMatrix.groups) {
      groups.push({
        text: group.name,
        id: group.id,
      });
    }
    if (this.selectedGroup === "") {
      this.selectedGroup = "all";
    }
    return groups;
  }

  private get testTargets() {
    const testTargets = [
      {
        text: this.$store.getters.message("manage-quality.all"),
        id: "all",
      },
    ];
    for (const group of this.testMatrix.groups) {
      if (this.selectedGroup !== "all" && this.selectedGroup !== group.id) {
        continue;
      }
      for (const testTarget of group.testTargets) {
        testTargets.push({
          text: testTarget.name,
          id: `${group.id}_${testTarget.id}`,
        });
      }
    }
    const enable = testTargets.find((testTarget) => {
      return this.selectedTestTarget === testTarget.id;
    });
    if (!enable) {
      this.selectedTestTarget = "all";
    }
    return testTargets;
  }

  private get headers() {
    const headers: any = [
      {
        text: this.$store.getters.message("manage-quality.group"),
        align: "center",
        sortable: false,
        value: "group",
        class: "ellipsis_short",
      },
      {
        text: this.$store.getters.message("manage-quality.test-target"),
        align: "center",
        sortable: false,
        value: "testTarget",
        class: "ellipsis_short",
      },
    ];
    for (const viewPoint of this.testMatrix.viewPoints) {
      headers.push({
        text: viewPoint.name,
        align: "center",
        sortable: false,
        value: viewPoint.id,
        class: "ellipsis_short",
      });
    }
    headers.push({
      text: this.$store.getters.message("manage-quality.total"),
      align: "center",
      sortable: false,
      value: this.TOTAL,
    });
    return headers;
  }
  private get items() {
    const items: any = [];
    const totalValuePerViewPointIdMap = new Map();
    for (const group of this.testMatrix.groups) {
      if (this.selectedGroup !== "all" && this.selectedGroup !== group.id) {
        continue;
      }
      for (const testTarget of group.testTargets) {
        if (
          this.selectedTestTarget !== "all" &&
          this.selectedTestTarget !== `${group.id}_${testTarget.id}`
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
          const story: Story = this.$store.getters[
            "testManagement/findStoryByTestTargetAndViewPointId"
          ](testTarget.id, plan.viewPointId, this.testMatrix.id);
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
              (note.tags ?? []).includes("reported")
            ).length;
          }

          const targetCell = totalValuePerViewPointIdMap.get(plan.viewPointId);
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

        row[this.TOTAL] = this.displayValue(rowTotalBugNum, rowTotalSessionNum);
        items.push(row);
      }
    }

    const totalRow: any = {
      group: this.$store.getters.message("manage-quality.total"),
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

  @Watch("locale")
  private updateWindowTitle() {
    this.$store.dispatch("changeWindowTitle", {
      title: this.$store.getters.message("manage-quality.window-title"),
    });
  }

  private async created() {
    await this.$store.dispatch("testManagement/readProject");

    this.updateWindowTitle();

    const targetTestMatrix = this.$store.state.testManagement.testMatrices.find(
      (testMatrix: TestMatrix) => {
        return this.$route.params.testMatrixId === testMatrix.id;
      }
    );

    if (targetTestMatrix) {
      this.testMatrix = targetTestMatrix;
    }
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
      reportedBugCount: number;
    }> = [];
    for (const group of this.testMatrix.groups) {
      if (this.selectedGroup !== "all" && this.selectedGroup !== group.id) {
        continue;
      }
      groupList.push({ name: group.name, id: group.id });
      for (const testTarget of group.testTargets) {
        if (
          this.selectedTestTarget !== "all" &&
          this.selectedTestTarget !== `${group.id}_${testTarget.id}`
        ) {
          continue;
        }
        for (const plan of testTarget.plans) {
          const story: Story = this.$store.getters[
            "testManagement/findStoryByTestTargetAndViewPointId"
          ](testTarget.id, plan.viewPointId, this.testMatrix.id);
          if (!story || !story.sessions) {
            continue;
          }
          for (const session of story.sessions) {
            if (!session.isDone) {
              continue;
            }
            const reportedBugCount = session.notes.filter((note) =>
              (note.tags ?? []).includes("reported")
            ).length;
            sessionsData.push({
              groupName: group.name,
              groupId: group.id,
              testTargetName: testTarget.name,
              testTargetId: `${group.id}_${testTarget.id}`,
              doneDate: session.doneDate,
              reportedBugCount,
            });
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
        if (this.selectedGroup !== "all" && this.selectedGroup !== group.id) {
          continue;
        }
        if (
          this.selectedTestTarget !== "all" &&
          this.selectedTestTarget.split("_")[0] !== group.id
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
          (this.selectedTestTarget === "all" ||
            this.selectedTestTarget === value.testTargetId)
        ) {
          setValue += value.reportedBugCount;
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
    if (this.selectedGroup === "all" && this.selectedTestTarget === "all") {
      datasets.push({
        label: this.$store.getters.message("manage-quality.total"),
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
