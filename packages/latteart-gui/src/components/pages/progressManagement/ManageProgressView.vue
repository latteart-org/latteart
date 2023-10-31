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
        {{ $store.getters.message("manage-progress.display-settings-section") }}
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col align-self="center" cols="1" class="pt-0 ml-4">
        {{ $store.getters.message("manage-progress.period") }}
      </v-col>
      <v-col align-self="center" class="pt-0">
        <v-menu
          v-model="startDateMenu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          full-width
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              :value="startDate"
              @change="(value) => updatePeriod({ start: value })"
              single-line
              prepend-icon="event"
              readonly
              v-on="on"
              class="mx-3"
            ></v-text-field>
          </template>
          <v-date-picker
            :value="startDate"
            @change="(value) => updatePeriod({ start: value })"
            @input="startDateMenu = false"
          ></v-date-picker>
        </v-menu>
      </v-col>
      <v-col align-self="center" cols="1" class="pt-0">
        {{ $store.getters.message("manage-progress.period-symbol") }}
      </v-col>
      <v-col align-self="center" class="pt-0">
        <v-menu
          v-model="endDateMenu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          full-width
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              :value="endDate"
              @change="(value) => updatePeriod({ end: value })"
              single-line
              prepend-icon="event"
              readonly
              v-on="on"
              class="mx-3"
            ></v-text-field>
          </template>
          <v-date-picker
            :value="endDate"
            @change="(value) => updatePeriod({ end: value })"
            @input="endDateMenu = false"
          ></v-date-picker>
        </v-menu>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        {{ $store.getters.message("manage-progress.filter-section") }}
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col>
        <v-select
          v-model="selectedTestMatrixId"
          :items="testMatrices"
          item-text="name"
          item-value="id"
          class="mx-3 ellipsis"
          :label="$store.getters.message('manage-progress.test-matrix')"
        ></v-select>
      </v-col>

      <v-col>
        <v-select
          v-model="selectedGroupId"
          :items="groups"
          item-text="name"
          item-value="id"
          class="mx-3 ellipsis"
          :label="$store.getters.message('manage-progress.group')"
        ></v-select>
      </v-col>

      <v-col>
        <v-select
          v-model="selectedTestTargetId"
          :items="testTargets"
          item-text="name"
          item-value="id"
          class="mx-3 ellipsis"
          :label="$store.getters.message('manage-progress.test-target')"
        ></v-select>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <progress-chart v-if="rerender" :datas="chartData"></progress-chart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ProgressChart from "@/components/organisms/progressManagement/ProgressChart.vue";
import Chart from "chart.js";
import { TimestampImpl } from "@/lib/common/Timestamp";
import { DailyTestProgress } from "@/lib/testManagement/types";
import { TestManagementState } from "@/store/testManagement";

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
  private startDateMenu = false;
  private endDateMenu = false;

  private startDate = "";
  private endDate = "";

  private selectedTestMatrixId = "all";
  private selectedGroupId = "all";
  private selectedTestTargetId = "all";

  private progressDatas: DailyTestProgress[] = [];

  private get testMatrices() {
    const testManagementState = this.$store.state
      .testManagement as TestManagementState;

    const all = {
      ...this.unselectedItem,
      groups: testManagementState.testMatrices.flatMap(
        (testMatrix) => testMatrix.groups
      ),
    };
    return [all, ...testManagementState.testMatrices];
  }

  private get groups() {
    const groups =
      this.testMatrices.find(
        (testMatrix) => testMatrix.id === this.selectedTestMatrixId
      )?.groups ?? [];

    if (!groups.find(({ id }) => id === this.selectedGroupId)) {
      this.selectedGroupId = this.unselectedItem.id;
    }

    const all = {
      ...this.unselectedItem,
      testTargets: groups.flatMap((group) => group.testTargets),
    };
    return [all, ...groups];
  }

  private get testTargets() {
    const testTargets =
      this.groups.find((group) => group.id === this.selectedGroupId)
        ?.testTargets ?? [];

    if (!testTargets.find(({ id }) => id === this.selectedTestTargetId)) {
      this.selectedTestTargetId = this.unselectedItem.id;
    }

    return [this.unselectedItem, ...testTargets];
  }

  private get unselectedItem(): { id: string; name: string } {
    return {
      id: "all",
      name: this.$store.getters.message("manage-progress.all"),
    };
  }

  private get filteredProgressDatas() {
    const filteredDatas = this.progressDatas.map((dailyProgress) => {
      const storyProgresses = dailyProgress.storyProgresses
        .filter(({ testMatrixId }) => {
          if (this.selectedTestMatrixId === "all") {
            return true;
          }
          return testMatrixId === this.selectedTestMatrixId;
        })
        .filter(({ testTargetGroupId }) => {
          if (this.selectedGroupId === "all") {
            return true;
          }
          return testTargetGroupId === this.selectedGroupId;
        })
        .filter(({ testTargetId }) => {
          if (this.selectedTestTargetId === "all") {
            return true;
          }
          return testTargetId === this.selectedTestTargetId;
        });

      return {
        date: dailyProgress.date,
        storyProgresses,
      };
    });

    return filteredDatas.map((dailyProgress) => {
      return dailyProgress.storyProgresses.reduce(
        (
          acc,
          {
            plannedSessionNumber,
            completedSessionNumber,
            incompletedSessionNumber,
          }
        ) => {
          acc.planNumber += plannedSessionNumber;
          acc.completedNumber += completedSessionNumber;
          acc.incompletedNumber += incompletedSessionNumber;
          return acc;
        },
        {
          date: new TimestampImpl(dailyProgress.date).format("YYYY-MM-DD"),
          planNumber: 0,
          completedNumber: 0,
          incompletedNumber: 0,
        }
      );
    });
  }

  private get chartData(): Chart.ChartData {
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

  private get locale() {
    return this.$store.getters.getLocale();
  }

  private async created() {
    this.$store.dispatch("changeWindowTitle", {
      title: this.$store.getters.message(this.$route.meta?.title ?? ""),
    });

    await this.$store.dispatch("testManagement/readProject");

    this.progressDatas = await this.collectProgressDatas();

    const dates = this.progressDatas.map((data) => {
      return new TimestampImpl(data.date).unix();
    });
    this.startDate = new TimestampImpl(Math.min(...dates)).format("YYYY-MM-DD");
    this.endDate = new TimestampImpl(Math.max(...dates)).format("YYYY-MM-DD");
  }

  private updatePeriod(value: { start?: string; end?: string }) {
    (async () => {
      if (value.start) {
        this.startDate = new TimestampImpl(value.start).format("YYYY-MM-DD");
      }

      if (value.end) {
        this.endDate = new TimestampImpl(value.end).format("YYYY-MM-DD");
      }

      this.progressDatas = await this.collectProgressDatas();
    })();
  }

  private async collectProgressDatas(): Promise<DailyTestProgress[]> {
    const filter = {
      period:
        this.startDate && this.endDate
          ? {
              since: new TimestampImpl(this.startDate),
              until: new TimestampImpl(this.endDate),
            }
          : undefined,
    };

    return this.$store.dispatch("testManagement/collectProgressDatas", filter);
  }
}
</script>

<style lang="sass" scoped>
@media print
  .no-print
    display: none
</style>
