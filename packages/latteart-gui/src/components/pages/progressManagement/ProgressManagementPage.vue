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
        {{
          store.getters.message("progress-management.display-settings-section")
        }}
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col align-self="center" cols="1" class="pt-0 ml-4">
        {{ store.getters.message("progress-management.period") }}
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
        {{ store.getters.message("progress-management.period-symbol") }}
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
        {{ store.getters.message("progress-management.filter-section") }}
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
          :label="store.getters.message('progress-management.test-matrix')"
        ></v-select>
      </v-col>

      <v-col>
        <v-select
          v-model="selectedGroupId"
          :items="groups"
          item-text="name"
          item-value="id"
          class="mx-3 ellipsis"
          :label="store.getters.message('progress-management.group')"
        ></v-select>
      </v-col>

      <v-col>
        <v-select
          v-model="selectedTestTargetId"
          :items="testTargets"
          item-text="name"
          item-value="id"
          class="mx-3 ellipsis"
          :label="store.getters.message('progress-management.test-target')"
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
import ProgressChart from "@/components/organisms/progressManagement/ProgressChart.vue";
import Chart from "chart.js";
import { TimestampImpl } from "@/lib/common/Timestamp";
import { DailyTestProgress } from "@/lib/testManagement/types";
import { TestManagementState } from "@/store/testManagement";
import { computed, defineComponent, ref, nextTick } from "vue";
import { useStore } from "@/store";
import { useRoute } from "vue-router/composables";

export default defineComponent({
  components: {
    "progress-chart": ProgressChart,
  },
  setup() {
    const store = useStore();
    const route = useRoute();

    const rerender = ref(true);
    const startDateMenu = ref(false);
    const endDateMenu = ref(false);

    const startDate = ref("");
    const endDate = ref("");

    const selectedTestMatrixId = ref("all");
    const selectedGroupId = ref("all");
    const selectedTestTargetId = ref("all");

    const progressDatas = ref<DailyTestProgress[]>([]);

    const testMatrices = computed(() => {
      const testManagementState = (store.state as any)
        .testManagement as TestManagementState;

      const all = {
        ...unselectedItem.value,
        groups: testManagementState.testMatrices.flatMap(
          (testMatrix) => testMatrix.groups
        ),
      };
      return [all, ...testManagementState.testMatrices];
    });

    const groups = computed(() => {
      const groups =
        testMatrices.value.find(
          (testMatrix) => testMatrix.id === selectedTestMatrixId.value
        )?.groups ?? [];

      if (!groups.find(({ id }) => id === selectedGroupId.value)) {
        selectedGroupId.value = unselectedItem.value.id;
      }

      const all = {
        ...unselectedItem.value,
        testTargets: groups.flatMap((group) => group.testTargets),
      };
      return [all, ...groups];
    });

    const testTargets = computed(() => {
      const testTargets =
        groups.value.find((group) => group.id === selectedGroupId.value)
          ?.testTargets ?? [];

      if (!testTargets.find(({ id }) => id === selectedTestTargetId.value)) {
        selectedTestTargetId.value = unselectedItem.value.id;
      }

      return [unselectedItem.value, ...testTargets];
    });

    const unselectedItem = computed((): { id: string; name: string } => {
      return {
        id: "all",
        name: store.getters.message("progress-management.all"),
      };
    });

    const filteredProgressDatas = computed(() => {
      const filteredDatas = progressDatas.value.map((dailyProgress) => {
        const storyProgresses = dailyProgress.storyProgresses
          .filter(({ testMatrixId }) => {
            if (selectedTestMatrixId.value === "all") {
              return true;
            }
            return testMatrixId === selectedTestMatrixId.value;
          })
          .filter(({ testTargetGroupId }) => {
            if (selectedGroupId.value === "all") {
              return true;
            }
            return testTargetGroupId === selectedGroupId.value;
          })
          .filter(({ testTargetId }) => {
            if (selectedTestTargetId.value === "all") {
              return true;
            }
            return testTargetId === selectedTestTargetId.value;
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
    });

    const chartData = computed((): Chart.ChartData => {
      rerender.value = false;

      nextTick(() => {
        rerender.value = true;
      });

      return {
        labels: filteredProgressDatas.value.map(
          (progressData) => progressData.date
        ),
        datasets: filteredProgressDatas.value.reduce(
          (acc, current) => {
            acc[0].data.push(current.planNumber);
            acc[1].data.push(current.completedNumber);
            acc[2].data.push(current.incompletedNumber);
            return acc;
          },
          [
            {
              label: store.getters.message(
                "progress-management.planned-sessions"
              ),
              borderColor: "#0077ff",
              data: [] as number[],
              fill: false,
              lineTension: 0,
            },
            {
              label: store.getters.message(
                "progress-management.completed-sessions"
              ),
              borderColor: "#00ff77",
              data: [] as number[],
              fill: false,
              lineTension: 0,
            },
            {
              label: store.getters.message(
                "progress-management.incompleted-sessions"
              ),
              borderColor: "#ff5555",
              data: [] as number[],
              fill: false,
              lineTension: 0,
            },
          ]
        ),
      };
    });

    const updatePeriod = (value: { start?: string; end?: string }) => {
      (async () => {
        if (value.start) {
          startDate.value = new TimestampImpl(value.start).format("YYYY-MM-DD");
        }

        if (value.end) {
          endDate.value = new TimestampImpl(value.end).format("YYYY-MM-DD");
        }

        progressDatas.value = await collectProgressDatas();
      })();
    };

    const collectProgressDatas = async (): Promise<DailyTestProgress[]> => {
      const filter = {
        period:
          startDate.value && endDate.value
            ? {
                since: new TimestampImpl(startDate.value),
                until: new TimestampImpl(endDate.value),
              }
            : undefined,
      };

      return store.dispatch("testManagement/collectProgressDatas", filter);
    };

    (async () => {
      await store.dispatch("changeWindowTitle", {
        title: store.getters.message(route.meta?.title ?? ""),
      });

      await store.dispatch("testManagement/readProject");

      progressDatas.value = await collectProgressDatas();

      const dates = progressDatas.value.map((data) => {
        return new TimestampImpl(data.date).unix();
      });
      startDate.value = new TimestampImpl(Math.min(...dates)).format(
        "YYYY-MM-DD"
      );
      endDate.value = new TimestampImpl(Math.max(...dates)).format(
        "YYYY-MM-DD"
      );
    })();

    return {
      store,
      rerender,
      startDateMenu,
      endDateMenu,
      startDate,
      endDate,
      selectedTestMatrixId,
      selectedGroupId,
      selectedTestTargetId,
      testMatrices,
      groups,
      testTargets,
      chartData,
      updatePeriod,
    };
  },
});
</script>

<style lang="sass" scoped>
@media print
  .no-print
    display: none
</style>
