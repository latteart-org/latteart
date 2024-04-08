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
  <line-chart :data="chartData" :options="chartOptions"></line-chart>
</template>

<script lang="ts">
import LineChart from "@/components/molecules/LineChart.vue";
import { useRootStore } from "@/stores/root";
import { computed, defineComponent, ref, type PropType } from "vue";

export default defineComponent({
  props: {
    progressData: {
      type: Object as PropType<
        {
          date: string;
          planNumber: number;
          completedNumber: number;
          incompletedNumber: number;
        }[]
      >,
      required: true
    }
  },
  components: { LineChart },
  setup(props) {
    const rootStore = useRootStore();

    const chartOptions = ref({
      legend: { position: "right" as const, labels: { boxWidth: 40 } },
      scales: { y: { min: 0, ticks: { stepSize: 5 } } }
    });

    const chartData = computed(() => {
      return {
        labels: props.progressData.map(({ date }) => date),
        datasets: props.progressData.reduce(
          (acc, current) => {
            acc[0].data.push(current.planNumber);
            acc[1].data.push(current.completedNumber);
            acc[2].data.push(current.incompletedNumber);
            return acc;
          },
          [
            {
              label: rootStore.message("progress-management.planned-sessions"),
              borderColor: "#0077ff",
              backgroundColor: "#0077ff80",
              data: [] as number[]
            },
            {
              label: rootStore.message("progress-management.completed-sessions"),
              borderColor: "#00ff77",
              backgroundColor: "#00ff7780",
              data: [] as number[]
            },
            {
              label: rootStore.message("progress-management.incompleted-sessions"),
              borderColor: "#ff5555",
              backgroundColor: "#ff555580",
              data: [] as number[]
            }
          ]
        )
      };
    });

    return { chartData, chartOptions };
  }
});
</script>

<style lang="sass" scoped>
.v-select__selections
  text-overflow: ellipsis
</style>
