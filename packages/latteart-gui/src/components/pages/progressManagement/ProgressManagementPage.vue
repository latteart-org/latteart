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
        {{ $t("progress-management.display-settings-section") }}
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col align-self="center" cols="1" class="pt-0 ml-4">
        {{ $t("progress-management.period") }}
      </v-col>
      <v-col align-self="center" class="pt-0">
        <v-menu
          v-model="startDateMenu"
          :close-on-content-click="false"
          :offset="40"
          transition="scale-transition"
          full-width
          min-width="290px"
        >
          <template #activator="{ props }">
            <v-text-field
              :model-value="startDate"
              single-line
              prepend-icon="event"
              readonly
              v-bind="props"
              class="mx-3"
              @change="(value: string) => updatePeriod({ start: value })"
            ></v-text-field>
          </template>
          <v-date-picker
            :value="startDate"
            @change="(value: string) => updatePeriod({ start: value })"
            @input="startDateMenu = false"
          ></v-date-picker>
        </v-menu>
      </v-col>
      <v-col align-self="center" cols="1" class="pt-0">
        {{ $t("progress-management.period-symbol") }}
      </v-col>
      <v-col align-self="center" class="pt-0">
        <v-menu
          v-model="endDateMenu"
          :close-on-content-click="false"
          :offset="40"
          transition="scale-transition"
          full-width
          min-width="290px"
        >
          <template #activator="{ props }">
            <v-text-field
              :model-value="endDate"
              single-line
              prepend-icon="event"
              readonly
              v-bind="props"
              class="mx-3"
              @change="(value: string) => updatePeriod({ end: value })"
            ></v-text-field>
          </template>
          <v-date-picker
            :value="endDate"
            @change="(value: string) => updatePeriod({ end: value })"
            @input="endDateMenu = false"
          ></v-date-picker>
        </v-menu>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        {{ $t("progress-management.filter-section") }}
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col>
        <v-select
          v-model="selectedTestMatrixId"
          :items="testMatrices"
          item-title="name"
          item-value="id"
          class="mx-3 text-truncate"
          :label="$t('progress-management.test-matrix')"
        ></v-select>
      </v-col>

      <v-col>
        <v-select
          v-model="selectedGroupId"
          :items="groups"
          item-title="name"
          item-value="id"
          class="mx-3 text-truncate"
          :label="$t('progress-management.group')"
        ></v-select>
      </v-col>

      <v-col>
        <v-select
          v-model="selectedTestTargetId"
          :items="testTargets"
          item-title="name"
          item-value="id"
          class="mx-3 text-truncate"
          :label="$t('progress-management.test-target')"
        ></v-select>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <progress-chart :progress-data="filteredProgressDatas"></progress-chart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import ProgressChart from "@/components/organisms/progressManagement/ProgressChart.vue";
import { TimestampImpl } from "@/lib/common/Timestamp";
import { type DailyTestProgress } from "@/lib/testManagement/types";
import { computed, defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useTestManagementStore } from "@/stores/testManagement";
import { useRootStore } from "@/stores/root";

export default defineComponent({
  components: {
    "progress-chart": ProgressChart
  },
  setup() {
    const rootStore = useRootStore();
    const testManagementStore = useTestManagementStore();
    const route = useRoute();

    const startDateMenu = ref(false);
    const endDateMenu = ref(false);

    const startDate = ref("");
    const endDate = ref("");

    const selectedTestMatrixId = ref("all");
    const selectedGroupId = ref("all");
    const selectedTestTargetId = ref("all");

    const progressDatas = ref<DailyTestProgress[]>([]);

    const unselectedItem = computed((): { id: string; name: string } => {
      return {
        id: "all",
        name: rootStore.message("progress-management.all")
      };
    });

    const testMatrices = computed(() => {
      const all = {
        ...unselectedItem.value,
        groups: testManagementStore.testMatrices.flatMap((testMatrix) => testMatrix.groups)
      };
      return [all, ...testManagementStore.testMatrices];
    });

    const groups = computed(() => {
      const groups =
        testMatrices.value.find((testMatrix) => testMatrix.id === selectedTestMatrixId.value)
          ?.groups ?? [];

      const all = {
        ...unselectedItem.value,
        testTargets: groups.flatMap((group) => group.testTargets)
      };
      return [all, ...groups];
    });

    const testTargets = computed(() => {
      const testTargets =
        groups.value.find((group) => group.id === selectedGroupId.value)?.testTargets ?? [];

      return [unselectedItem.value, ...testTargets];
    });

    watch(groups, (newGroups) => {
      if (!newGroups.find(({ id }) => id === selectedGroupId.value)) {
        selectedGroupId.value = unselectedItem.value.id;
      }
    });

    watch(testTargets, (newTestTargets) => {
      if (!newTestTargets.find(({ id }) => id === selectedTestTargetId.value)) {
        selectedTestTargetId.value = unselectedItem.value.id;
      }
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
          storyProgresses
        };
      });

      return filteredDatas.map((dailyProgress) => {
        return dailyProgress.storyProgresses.reduce(
          (acc, { plannedSessionNumber, completedSessionNumber, incompletedSessionNumber }) => {
            acc.planNumber += plannedSessionNumber;
            acc.completedNumber += completedSessionNumber;
            acc.incompletedNumber += incompletedSessionNumber;
            return acc;
          },
          {
            date: new TimestampImpl(dailyProgress.date).format("YYYY-MM-DD"),
            planNumber: 0,
            completedNumber: 0,
            incompletedNumber: 0
          }
        );
      });
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
                until: new TimestampImpl(endDate.value)
              }
            : undefined
      };

      return testManagementStore.collectProgressDatas(filter);
    };

    (async () => {
      rootStore.changeWindowTitle({
        title: rootStore.message(route.meta?.title ?? "")
      });

      await testManagementStore.readProject();

      progressDatas.value = await collectProgressDatas();

      const dates = progressDatas.value.map((data) => {
        return new TimestampImpl(data.date).unix();
      });
      startDate.value = new TimestampImpl(Math.min(...dates)).format("YYYY-MM-DD");
      endDate.value = new TimestampImpl(Math.max(...dates)).format("YYYY-MM-DD");
    })();

    return {
      t: rootStore.message,
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
      filteredProgressDatas,
      updatePeriod
    };
  }
});
</script>

<style lang="sass" scoped>
@media print
  .no-print
    display: none
</style>
