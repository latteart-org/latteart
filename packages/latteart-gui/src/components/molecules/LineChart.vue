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

<script lang="ts">
import { Line, mixins } from "vue-chartjs";
import Chart from "chart.js";
import { Prop, Mixins, Component } from "vue-property-decorator";

@Component
export default class LineChart extends Mixins(Line, mixins.reactiveProp) {
  @Prop({ type: Object, default: null })
  public readonly data!: Chart.ChartData;
  @Prop({ type: Object, default: null })
  public readonly chartOptions!: Chart.ChartOptions;

  public mounted(): void {
    this.renderChart(this.data, this.chartOptions);
  }
}
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
