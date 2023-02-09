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
  <line-chart :data="chartData" :chartOptions="chartOptions"></line-chart>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import LineChart from "@/components/molecules/LineChart.vue";
import { abbreviatedCharLength } from "@/lib/common/util";
import "chartjs-plugin-colorschemes/src/plugins/plugin.colorschemes";
import Chart from "chart.js";
const {
  Aspect6,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("chartjs-plugin-colorschemes/src/colorschemes/colorschemes.office");

@Component({
  components: {
    "line-chart": LineChart,
  },
})
export default class QualityChart extends Vue {
  @Prop({ type: Object }) public readonly qualityDatas!: any;
  @Prop({ type: Number }) public readonly totalBugNum!: number;

  private get chartData() {
    return {
      labels: this.getLabels(),
      datasets: this.qualityDatas.datasets.map((data: any) => {
        data.label = abbreviatedCharLength(data.label, 20);
        return data;
      }),
    };
  }

  private get chartOptions(): Chart.ChartOptions {
    return {
      maintainAspectRatio: false,
      responsive: true,
      title: {
        display: false,
      },
      legend: {
        position: "right",
        labels: {
          boxWidth: 30,
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              min: 0,
              stepSize: this.totalBugNum > 10 ? 5 : 1,
            },
            scaleLabel: {
              display: true,
              labelString: this.$store.getters.message(
                "quality-chart.bug-report-number"
              ),
            },
          },
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: this.$store.getters.message(
                "quality-chart.number-session"
              ),
            },
          },
        ],
      },
      plugins: {
        colorschemes: {
          scheme: Aspect6,
        },
      },
    };
  }

  private getLabels() {
    let maxLen = 0;
    this.qualityDatas.datasets.forEach((dataset: any) => {
      if (maxLen < dataset.data.length) {
        maxLen = dataset.data.length;
      }
    });
    if (maxLen <= 10) {
      maxLen = 10;
    }
    return [...Array(maxLen).keys()].map((i) => String(i++));
  }
}
</script>

<style lang="sass" scoped>
.v-select__selections
  text-overflow: ellipsis
</style>
