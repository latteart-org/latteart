<!--
 Copyright 2021 NTT Corporation.

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
  <v-layout column pa-3 justify-center align-left>
    <v-flex>
      <v-layout row align-center>
        <p class="title">
          {{ $store.getters.message("manage-progress.title") }}
        </p>
        <v-spacer></v-spacer>
      </v-layout>
    </v-flex>
    <v-flex>
      {{ $store.getters.message("manage-progress.display-settings-section") }}
      <v-layout row align-center>
        {{ $store.getters.message("manage-progress.period") }}
        <v-menu
          v-model="startDateMenu"
          :close-on-content-click="false"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="startDate"
              single-line
              prepend-icon="event"
              readonly
              v-on="on"
              class="mx-3"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="startDate"
            @input="startDateMenu = false"
          ></v-date-picker>
        </v-menu>
        {{ $store.getters.message("manage-progress.period-symbol") }}
        <v-menu
          v-model="endDateMenu"
          :close-on-content-click="false"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="endDate"
              single-line
              prepend-icon="event"
              readonly
              v-on="on"
              class="mx-3"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="endDate"
            @input="endDateMenu = false"
          ></v-date-picker>
        </v-menu>
      </v-layout>
    </v-flex>
    <v-flex>
      {{ $store.getters.message("manage-progress.filter-section") }}
      <v-layout row align-center>
        <v-flex xs6>
          <v-layout row align-center>
            {{ $store.getters.message("manage-progress.group") }}
            <v-select
              v-model="selectedGroupId"
              single-line
              :items="groups"
              item-text="name"
              item-value="id"
              class="mx-3 ellipsis"
            ></v-select>
          </v-layout>
        </v-flex>
        <v-flex xs6>
          <v-layout row align-center>
            {{ $store.getters.message("manage-progress.test-target") }}
            <v-select
              v-model="selectedTestTargetId"
              single-line
              :items="testTargets"
              item-text="name"
              item-value="id"
              class="mx-3 ellipsis"
            ></v-select>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-flex>
    <v-flex pb-3>
      <progress-chart
        v-if="rerender"
        :datas="progressDatasForRender"
      ></progress-chart>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import ProgressChart from "./organisms/ProgressChart.vue";
import { TestMatrixProgressData, TestMatrix } from "@/lib/testManagement/types";
import Chart from "chart.js";
import { TimestampImpl } from "@/lib/common/Timestamp";

@Component({
  components: {
    "progress-chart": ProgressChart,
  },
})
export default class ManageProgress extends Vue {
  private isViewerMode = (this as any).$isViewerMode
    ? (this as any).$isViewerMode
    : false;
  private rerender = true;

  private startDate = new TimestampImpl().format("YYYY-MM-DD");
  private startDateMenu = false;
  private endDate = new TimestampImpl().format("YYYY-MM-DD");
  private endDateMenu = false;

  private selectedGroupId = "all";
  private selectedTestTargetId = "all";

  private testMatrix: TestMatrix = {
    id: "",
    name: "",
    viewPoints: [],
    groups: [],
  };

  private get locale() {
    return this.$store.getters.getLocale();
  }

  @Watch("locale")
  private updateWindowTitle() {
    this.$store.dispatch("changeWindowTitle", {
      title: this.$store.getters.message("manage-progress.window-title"),
    });
  }

  private created() {
    this.updateWindowTitle();

    const targetTestMatrix = this.$store.state.testManagement.testMatrices.find(
      (testMatrix: TestMatrix) => {
        return this.$route.params.testMatrixId === testMatrix.id;
      }
    );

    if (targetTestMatrix) {
      this.testMatrix = targetTestMatrix;
    }

    const dates = this.originalProgressDatas.map((data) => {
      return new TimestampImpl(data.date).unix();
    });
    const minDate = dates.reduce((first, second) => Math.min(first, second));
    const maxDate = dates.reduce((first, second) => Math.max(first, second));

    this.startDate = new TimestampImpl(minDate).format("YYYY-MM-DD");
    this.endDate = new TimestampImpl(maxDate).format("YYYY-MM-DD");
  }

  private get originalProgressDatas(): TestMatrixProgressData[] {
    const allProgressDatas: any[] = this.$store.getters[
      "testManagement/collectProgressDatas"
    ]();
    const targetProgressData = allProgressDatas.find((progressData) => {
      return progressData.testMatrixId === this.testMatrix.id;
    });
    return targetProgressData?.testMatrixProgressDatas ?? [];
  }

  private get unselectedItem() {
    return {
      id: "all",
      name: this.$store.getters.message("manage-progress.all") as string,
    };
  }

  private get groups() {
    const filterItems = this.testMatrix.groups.map((group) => {
      return {
        id: group.id,
        name: group.name,
      };
    });

    return [this.unselectedItem, ...filterItems];
  }

  private get testTargets() {
    const filterItems = this.testMatrix.groups
      .filter((group) => {
        return this.selectedGroupId === "all"
          ? true
          : group.id === this.selectedGroupId;
      })
      .reduce(
        (acc, current) => {
          const testTargetIdAndNames = current.testTargets.map((testTarget) => {
            return {
              id: `${current.id}-${testTarget.id}`,
              name: testTarget.name,
            };
          });

          acc.push(...testTargetIdAndNames);

          return acc;
        },
        [] as Array<{
          id: string;
          name: string;
        }>
      )
      .filter((testTargetIdAndName, index, array) => {
        return (
          array.findIndex((item) => {
            return item.id === testTargetIdAndName.id;
          }) === index
        );
      });

    if (
      filterItems.findIndex((item) => item.id === this.selectedTestTargetId) ===
      -1
    ) {
      this.selectedTestTargetId = "all";
    }

    return [this.unselectedItem, ...filterItems];
  }

  private get filteredProgressDatas() {
    const allProgressDatas = this.originalProgressDatas;

    const filteredProgressDatas = allProgressDatas
      .filter((data) => {
        const start = new TimestampImpl(this.startDate, "date").format(
          "YYYY-MM-DD"
        );
        const end = new TimestampImpl(this.endDate, "date").format(
          "YYYY-MM-DD"
        );
        const unixDate = new TimestampImpl(Number(data.date)).unix();
        return new TimestampImpl(unixDate).isBetween(start, end);
      })
      .map((data) => {
        const groups = data.groups
          .filter((group) => {
            return this.selectedGroupId === "all"
              ? true
              : group.id === this.selectedGroupId;
          })
          .map((group) => {
            return {
              id: group.id,
              name: group.name,
              testTargets: group.testTargets.filter((testTarget) => {
                return this.selectedTestTargetId === "all"
                  ? true
                  : `${group.id}-${testTarget.id}` ===
                      this.selectedTestTargetId;
              }),
            };
          });
        return groups.reduce(
          (progressData, currentGroup) => {
            for (const currentTestTarget of currentGroup.testTargets) {
              progressData.planNumber += currentTestTarget.progress.planNumber;
              progressData.completedNumber +=
                currentTestTarget.progress.completedNumber;
              progressData.incompletedNumber +=
                currentTestTarget.progress.incompletedNumber;
            }

            return progressData;
          },
          {
            date: new TimestampImpl(new TimestampImpl(data.date).unix()).format(
              "YYYY-MM-DD"
            ),
            planNumber: 0,
            completedNumber: 0,
            incompletedNumber: 0,
          }
        );
      });

    return filteredProgressDatas;
  }

  private get progressDatasForRender(): Chart.ChartData {
    this.rerender = false;

    Vue.nextTick(() => {
      this.rerender = true;
    });
    return {
      labels: this.filteredProgressDatas.map(
        (progressData) => progressData.date
      ),
      datasets: this.filteredProgressDatas.reduce(
        (acc, current) => {
          acc[0].data.push(current.planNumber);
          acc[1].data.push(current.completedNumber);
          acc[2].data.push(current.incompletedNumber);
          return acc;
        },
        [
          {
            label: this.$store.getters.message(
              "manage-progress.planned-sessions"
            ),
            borderColor: "#0077ff",
            data: [] as number[],
            fill: false,
            lineTension: 0,
          },
          {
            label: this.$store.getters.message(
              "manage-progress.completed-sessions"
            ),
            borderColor: "#00ff77",
            data: [] as number[],
            fill: false,
            lineTension: 0,
          },
          {
            label: this.$store.getters.message(
              "manage-progress.incompleted-sessions"
            ),
            borderColor: "#ff5555",
            data: [] as number[],
            fill: false,
            lineTension: 0,
          },
        ]
      ),
    };
  }
}
</script>

<style lang="sass" scoped>
@media print
  .no-print
    display: none
</style>
