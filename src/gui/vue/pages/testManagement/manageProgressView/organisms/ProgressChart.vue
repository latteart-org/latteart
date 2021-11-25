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
  <line-chart :data="chartData" :chartOptions="chartOptions"></line-chart>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import LineChart from "@/vue/molecules/LineChart.vue";
import Chart from "chart.js";

@Component({
  components: {
    "line-chart": LineChart,
  },
})
export default class ProgressChart extends Vue {
  @Prop({
    type: Object,
    default: () => {
      /* Do nothing */
    },
  })
  public readonly datas!: Chart.ChartData;

  private chartOptions: Chart.ChartOptions = {
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
  };

  private get chartData(): Chart.ChartData {
    return this.datas;
  }
}
</script>

<style lang="sass" scoped>
.v-select__selections
  text-overflow: ellipsis
</style>
