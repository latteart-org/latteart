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
      <progress-chart v-if="rerender" :datas="chartData"></progress-chart>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import ProgressChart from "./organisms/ProgressChart.vue";
import { TestMatrix } from "@/lib/testManagement/types";
import Chart from "chart.js";
import { TimestampImpl } from "@/lib/common/Timestamp";
import { DailyTestProgress } from "@/lib/testManagement/types";

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

  private selectedGroupId = "all";
  private selectedTestTargetId = "all";

  private progressDatas: DailyTestProgress[] = [];

  private testMatrix: TestMatrix = {
    id: "",
    name: "",
    index: 0,
    viewPoints: [],
    groups: [],
  };

  private get groups() {
    const all = {
      ...this.unselectedItem,
      testTargets: this.testMatrix.groups.flatMap((group) => group.testTargets),
    };
    return [all, ...this.testMatrix.groups];
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
          return testMatrixId === this.testMatrix.id;
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

  @Watch("locale")
  private updateWindowTitle() {
    this.$store.dispatch("changeWindowTitle", {
      title: this.$store.getters.message("manage-progress.window-title"),
    });
  }

  private async created() {
    await this.$store.dispatch("testManagement/readProject");

    this.updateWindowTitle();

    const found = this.$store.state.testManagement.testMatrices.find(
      (testMatrix: TestMatrix) => {
        return this.$route.params.testMatrixId === testMatrix.id;
      }
    );
    if (found) {
      this.testMatrix = found;
    }

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
