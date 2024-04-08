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
import { abbreviatedCharLength } from "@/lib/common/util";
import { useRootStore } from "@/stores/root";
import { computed, defineComponent, type PropType } from "vue";

export default defineComponent({
  props: {
    qualityData: {
      type: Object as PropType<{ datasets: { label: string; data: number[] }[] }>,
      required: true
    },
    totalBugNum: { type: Number, required: true }
  },
  components: { LineChart },
  setup(props) {
    const rootStore = useRootStore();

    const chartData = computed(() => {
      return {
        labels: getLabels(),
        datasets: props.qualityData.datasets.map((dataset) => {
          dataset.label = abbreviatedCharLength(dataset.label, 20);
          return dataset;
        })
      };
    });

    const chartOptions = computed(() => {
      return {
        legend: { position: "right" as const, labels: { boxWidth: 30 } },
        scales: {
          y: {
            min: 0,
            ticks: { stepSize: props.totalBugNum > 10 ? 5 : 1 },
            title: {
              display: true,
              text: rootStore.message("quality-chart.bug-report-number")
            }
          },
          x: {
            title: {
              display: true,
              text: rootStore.message("quality-chart.number-session")
            }
          }
        },
        plugins: { colors: { forceOverride: true } }
      };
    });

    const getLabels = () => {
      let maxLen = 0;
      props.qualityData.datasets.forEach((dataset: any) => {
        if (maxLen < dataset.data.length) {
          maxLen = dataset.data.length;
        }
      });
      if (maxLen <= 10) {
        maxLen = 10;
      }
      return [...Array(maxLen).keys()].map((i) => String(i++));
    };

    return { chartData, chartOptions };
  }
});
</script>

<style lang="sass" scoped>
.v-select__selections
  text-overflow: ellipsis
</style>
