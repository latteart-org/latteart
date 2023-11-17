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
  <line-chart :data="chartData" :chartOptions="chartOptions"></line-chart>
</template>

<script lang="ts">
import LineChart from "@/components/molecules/LineChart.vue";
import Chart from "chart.js";
import { computed, defineComponent, ref } from "vue";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    datas: {
      type: Object as PropType<Chart.ChartData>,
      default: () => {
        /* Do nothing */
      },
      required: true,
    },
  },
  components: {
    "line-chart": LineChart,
  },
  setup(props) {
    const chartOptions = ref<Chart.ChartOptions>({
      maintainAspectRatio: false,
      title: {
        display: false,
      },
      legend: {
        position: "right",
      },
      scales: {
        yAxes: [
          {
            ticks: {
              min: 0,
              stepSize: 5,
            },
          },
        ],
      },
    });

    const chartData = computed((): Chart.ChartData => {
      return props.datas;
    });

    return {
      chartData,
      chartOptions,
    };
  },
});
</script>

<style lang="sass" scoped>
.v-select__selections
  text-overflow: ellipsis
</style>
