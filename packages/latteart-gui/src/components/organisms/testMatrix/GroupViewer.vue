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
  <v-container fluid class="py-0 px-3">
    <fixed-data-table
      :items="items"
      :headers="headers"
      :item-per-page="-1"
      class="text-center pb-3"
      hide-actions
    >
      <template #headers="{ columns }">
        <tr>
          <th
            v-for="(header, index) in columns"
            :width="header.width"
            :class="header.headerProps?.class"
            :key="index"
          >
            <label-with-tooltip :title="header.title" :tooltip="header.headerProps?.tooltip" />
          </th></tr
      ></template>
      <template #item="props">
        <tr class="business-info-row">
          <td class="py-0 px-2 my-0 business-info-title">
            <div :title="getNameText(props.item)" class="mx-auto ellipsis_short">
              {{ getNameText(props.item) }}
            </div>
            <div>{{ getDoneAndPlan(props.item) }}</div>
          </td>
          <td v-for="(val, index) in viewPoints" :key="index" class="py-0 px-2 my-0">
            <sessions-status
              :id="
                findStoryId({
                  testMatrixId,
                  testTargetId: props.item.id,
                  viewPointId: val.id
                })
              "
              :plan="props.item[val.id]"
              :displayedStories="displayedStories"
            ></sessions-status>
          </td>
        </tr>
      </template>
    </fixed-data-table>
  </v-container>
</template>

<script lang="ts">
import SessionsStatus from "./SessionsStatus.vue";
import type {
  Group,
  ViewPoint,
  TestTarget,
  Plan,
  Session,
  Story
} from "@/lib/testManagement/types";
import FixedDataTable from "@/components/molecules/FixedDataTable.vue";
import LabelWithTooltip from "@/components/molecules/LabelWithTooltip.vue";
import { computed, defineComponent, type PropType } from "vue";
import { useRootStore } from "@/stores/root";
import { useTestManagementStore } from "@/stores/testManagement";

export default defineComponent({
  props: {
    group: {
      type: Object as PropType<Group>,
      default: () => {},
      required: true
    },
    viewPoints: {
      type: Array as PropType<ViewPoint[]>,
      default: () => [],
      required: true
    },
    testMatrixId: { type: String, default: "", required: true },
    displayedStories: {
      type: Array as PropType<string[] | null>,
      default: null
    }
  },
  components: {
    "sessions-status": SessionsStatus,
    "fixed-data-table": FixedDataTable,
    "label-with-tooltip": LabelWithTooltip
  },
  setup(props) {
    const rootStore = useRootStore();
    const testManagementStore = useTestManagementStore();

    const headers = computed(() => {
      const headers = [];
      headers.push({
        value: "name",
        sortable: false,
        title: rootStore.message("group-info.target"),
        align: "center" as const,
        width: "200"
      });
      props.viewPoints.forEach((viewPoint: ViewPoint) => {
        headers.push({
          title: viewPoint.name,
          value: viewPoint.id,
          sortable: false,
          align: "center" as const,
          width: "150",
          headerProps: { class: "ellipsis_short", tooltip: viewPoint.description }
        });
      });
      return headers;
    });

    const items = computed(() => {
      const items: any[] = [];
      props.group.testTargets.forEach((testTarget: TestTarget) => {
        const item: any = {
          name: testTarget.name,
          id: testTarget.id
        };
        testTarget.plans.forEach((plan: Plan) => {
          item[plan.viewPointId] = Number(plan.value);
        });
        items.push(item);
      });
      return items;
    });

    const getTestTarget = (item: any): TestTarget => {
      const targetTestTarget = props.group.testTargets.find((testTarget: TestTarget) => {
        return item.id === testTarget.id;
      });
      if (!targetTestTarget) {
        return {
          id: "",
          name: "",
          index: 0,
          plans: []
        };
      }
      return targetTestTarget;
    };

    const getNameText = (item: any): string => {
      return getTestTarget(item).name;
    };

    const getDoneAndPlan = (item: any): string => {
      let planNum = 0;
      let done = 0;
      const targetTestTarget = getTestTarget(item);
      if (!targetTestTarget) {
        return done + " / " + planNum;
      }
      targetTestTarget.plans.forEach((plan: Plan) => {
        planNum += Number(plan.value);

        const targetStory = findStory({
          testMatrixId: props.testMatrixId,
          testTargetId: targetTestTarget.id,
          viewPointId: plan.viewPointId
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
    };

    const findStory = (key: {
      testMatrixId: string;
      testTargetId: string;
      viewPointId: string;
    }): Story | undefined => {
      return testManagementStore.findStoryByTestTargetAndViewPointId(
        key.testTargetId,
        key.viewPointId,
        key.testMatrixId
      );
    };

    const findStoryId = (key: {
      testMatrixId: string;
      testTargetId: string;
      viewPointId: string;
    }): string => {
      return findStory(key)?.id ?? "";
    };

    return {
      headers,
      items,
      getNameText,
      getDoneAndPlan,
      findStoryId
    };
  }
});
</script>

<style lang="sass" scoped>
.business-info-row
  border-bottom: 0px none #FFF !important

.business-info-title
  text-align: center
</style>
