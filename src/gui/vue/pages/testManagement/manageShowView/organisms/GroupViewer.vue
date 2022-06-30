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
  <v-container fluid class="py-0 px-3">
    <fixed-data-table
      :items="items"
      :headers="headers"
      :pagination.sync="pagination"
      class="text-xs-center pb-3"
      hide-actions
    >
      <template #headers="props">
        <tr>
          <th
            v-for="(header, index) in props.headers"
            :width="header.width"
            :class="header.class"
            :key="index"
          >
            <label-with-tooltip :text="header.text" :tooltip="header.tooltip" />
          </th></tr
      ></template>
      <template #items="props">
        <tr class="business-info-row">
          <td class="py-0 px-2 my-0 business-info-title">
            <div
              :title="getNameText(props.item)"
              class="mx-auto ellipsis_short"
            >
              {{ getNameText(props.item) }}
            </div>
            <div>{{ getDoneAndPlan(props.item) }}</div>
          </td>
          <td
            v-for="(val, index) in viewPoints"
            :key="index"
            class="py-0 px-2 my-0"
          >
            <sessions-status
              :id="
                findStoryId({
                  testMatrixId,
                  testTargetId: props.item.id,
                  viewPointId: val.id,
                })
              "
              :plan="props.item[val.id]"
            ></sessions-status>
          </td>
        </tr>
      </template>
    </fixed-data-table>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import SessionsStatus from "./SessionsStatus.vue";
import {
  Group,
  ViewPoint,
  TestTarget,
  Plan,
  Session,
  Story,
} from "@/lib/testManagement/types";
import FixedDataTable from "@/vue/molecules/FixedDataTable.vue";
import LabelWithTooltip from "@/vue/molecules/LabelWithTooltip.vue";

@Component({
  components: {
    "sessions-status": SessionsStatus,
    "fixed-data-table": FixedDataTable,
    "label-with-tooltip": LabelWithTooltip,
  },
})
export default class GroupViewer extends Vue {
  @Prop({ type: Object, default: {} }) public readonly group!: Group;
  @Prop({ type: Array, default: [] }) public readonly viewPoints!: ViewPoint[];
  @Prop({ type: String, default: "" }) public readonly testMatrixId!: string;

  private get headers(): any[] {
    const headers: any = [];
    headers.push({
      value: "name",
      sortable: false,
      text: this.$store.getters.message("group-info.target"),
      align: "center",
      width: "200",
    });
    this.viewPoints.forEach((viewPoint: ViewPoint) => {
      headers.push({
        text: viewPoint.name,
        tooltip: viewPoint.description,
        value: viewPoint.id,
        sortable: false,
        align: "center",
        width: "150",
        class: "ellipsis_short",
      });
    });
    return headers;
  }

  private pagination: any = {
    rowsPerPage: -1,
  };

  private get items(): any[] {
    const items: any[] = [];
    this.group.testTargets.forEach((testTarget: TestTarget) => {
      const item: any = {
        name: testTarget.name,
        id: testTarget.id,
      };
      testTarget.plans.forEach((plan: Plan) => {
        item[plan.viewPointId] = Number(plan.value);
      });
      items.push(item);
    });
    return items;
  }

  private getTestTarget(item: any): TestTarget {
    const targetTestTarget = this.group.testTargets.find(
      (testTarget: TestTarget) => {
        return item.id === testTarget.id;
      }
    );
    if (!targetTestTarget) {
      return {
        id: "",
        name: "",
        plans: [],
      };
    }
    return targetTestTarget;
  }

  private getNameText(item: any): string {
    return this.getTestTarget(item).name;
  }

  private getDoneAndPlan(item: any): string {
    let planNum = 0;
    let done = 0;
    const targetTestTarget = this.getTestTarget(item);
    if (!targetTestTarget) {
      return done + " / " + planNum;
    }
    targetTestTarget.plans.forEach((plan: Plan) => {
      planNum += Number(plan.value);

      const targetStory = this.findStory({
        testMatrixId: this.testMatrixId,
        testTargetId: targetTestTarget.id,
        viewPointId: plan.viewPointId,
      });

      if (!targetStory) {
        return;
      }

      targetStory.sessions.forEach((session: Session) => {
        if (session.isDone) {
          done++;
        }
      });
    });
    return done + " / " + planNum;
  }

  private findStory(key: {
    testMatrixId: string;
    testTargetId: string;
    viewPointId: string;
  }): Story | undefined {
    return this.$store.getters[
      "testManagement/findStoryByTestTargetAndViewPointId"
    ](key.testTargetId, key.viewPointId, key.testMatrixId);
  }

  private findStoryId(key: {
    testMatrixId: string;
    testTargetId: string;
    viewPointId: string;
  }): string {
    return this.findStory(key)?.id ?? "";
  }
}
</script>

<style lang="sass" scoped>
.business-info-row
  border-bottom: 0px none #FFF !important

.business-info-title
  text-align: center
</style>
