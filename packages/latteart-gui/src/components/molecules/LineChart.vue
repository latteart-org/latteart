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
  <line-chart-impl :data="chartData" :options="chartOptions" />
</template>

<script lang="ts">
import { Line } from "vue-chartjs";
import { defineComponent, type PropType, computed } from "vue";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Colors
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Colors
);

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<{
        labels: string[];
        datasets: {
          label: string;
          data: number[];
          borderColor?: string;
          backgroundColor?: string;
        }[];
      }>,
      default: null
    },
    options: {
      type: Object as PropType<{
        legend: {
          position: "top" | "left" | "bottom" | "right" | "chartArea";
          labels: { boxWidth: number };
        };
        scales: {
          y?: {
            min?: number;
            ticks?: { stepSize: number };
            title?: { display: boolean; text: string };
          };
          x?: {
            min?: number;
            ticks?: { stepSize: number };
            title?: { display: boolean; text: string };
          };
        };
        plugins?: { colors?: { forceOverride: boolean } };
      }>,
      default: null
    }
  },
  components: {
    "line-chart-impl": Line
  },
  setup(props) {
    const chartData = computed(() => props.data);
    const chartOptions = computed(() => {
      return {
        ...props.options,
        maintainAspectRatio: false
      };
    });

    return { chartData, chartOptions };
  }
});
</script>

<style lang="sass" scoped>
@media print
  canvas#line-chart
    min-width: 100%
    min-height: 100%
    max-width: 100%
    max-height: 100%
    height: auto!important
    width: auto!important
</style>
