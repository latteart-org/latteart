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
      v-if="group && group.testTargets.length > 0"
      :items="items"
      :headers="headers"
      :item-per-page="-1"
      hide-actions
      :grid-column-number="8"
    >
      <template #headers="{ columns }">
        <tr>
          <th
            v-for="(header, index) in columns"
            :key="index"
            :width="header.width"
            :class="header.headerProps?.class"
            style="border-bottom: solid 1px #ddd"
          >
            <label-with-tooltip :title="header.title" :tooltip="header.headerProps?.tooltip" />
          </th></tr
      ></template>
      <template #item="props">
        <tr>
          <td class="px-0 py-0 my-0" style="width: 52px">
            <v-btn
              variant="text"
              icon
              class="mt-3"
              color="error"
              @click="openConfirmDialogToDeleteTestTarget(props.item.id)"
              ><v-icon>delete</v-icon></v-btn
            >
          </td>
          <td class="pl-0 pr-1 py-0 my-0">
            <v-row>
              <v-col cols="11" class="pr-0">
                <v-text-field
                  :id="`testTargetNameTextField${group.id}${props.item.id}`"
                  :model-value="props.item.name"
                  @change="(e: any) => renameTestTarget(e.target._value, props.item.id)"
                ></v-text-field>
              </v-col>
              <v-col cols="1" align-self="center" class="pa-0 ma-0">
                <v-btn
                  size="small"
                  variant="text"
                  icon
                  class="ml-0 pl-0 mb-0 pb-0"
                  :disabled="spinButtonToChangeOrderIsDisabled(props.item.id, 'up')"
                  @click="changeTestTargetOrder(props.item.id, 'up')"
                  ><v-icon>arrow_drop_up</v-icon></v-btn
                >
                <v-btn
                  size="small"
                  variant="text"
                  icon
                  class="ml-0 pl-0 mt-0 pt-0"
                  :disabled="spinButtonToChangeOrderIsDisabled(props.item.id, 'down')"
                  @click="changeTestTargetOrder(props.item.id, 'down')"
                  ><v-icon>arrow_drop_down</v-icon></v-btn
                >
              </v-col>
            </v-row>
          </td>
          <td v-for="(viewPoint, index) in viewPoints" :key="index" class="py-0 pr-2">
            <number-field
              :id="`${group.id}_${props.item.id}_${viewPoint.id}`"
              arrow-only
              :value="props.item[viewPoint.id]"
              :min-value="0"
              @update-number-field-value="
                ({ value }) =>
                  updatePlan({
                    testTargetId: props.item.id,
                    viewPointId: viewPoint.id,
                    newValue: value
                  })
              "
            ></number-field>
          </td>
        </tr>
      </template>
    </fixed-data-table>

    <v-row>
      <v-col cols="2"
        ><v-text-field
          :id="`newTestTargetNameTextField${group?.id}`"
          v-model="newTestTargetName"
          :label="$t('group-edit-info.target')"
        ></v-text-field
      ></v-col>
      <v-col cols="2" class="d-flex align-center"
        ><v-btn
          :id="`createTestTargetButton${group?.id}`"
          size="small"
          :disabled="newTestTargetName === ''"
          @click="addNewTestTarget"
          >{{ $t("group-edit-info.add") }}</v-btn
        ></v-col
      >
    </v-row>

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :on-accept="confirmDialogAccept"
      @close="confirmDialogOpened = false"
    />
  </v-container>
</template>

<script lang="ts">
import type { Group, Plan, TestMatrix, TestTarget, ViewPoint } from "@/lib/testManagement/types";
import ConfirmDialog from "@/components/molecules/ConfirmDialog.vue";
import NumberField from "@/components/molecules/NumberField.vue";
import FixedDataTable from "@/components/molecules/FixedDataTable.vue";
import LabelWithTooltip from "@/components/molecules/LabelWithTooltip.vue";
import { computed, defineComponent, ref } from "vue";
import { useRootStore } from "@/stores/root";
import { useTestManagementStore } from "@/stores/testManagement";

export default defineComponent({
  components: {
    "number-field": NumberField,
    "confirm-dialog": ConfirmDialog,
    "fixed-data-table": FixedDataTable,
    "label-with-tooltip": LabelWithTooltip
  },
  props: {
    testMatrixId: { type: String, default: "", required: true },
    groupId: { type: String, default: "", required: true }
  },
  setup(props) {
    const rootStore = useRootStore();
    const testManagementStore = useTestManagementStore();

    const confirmDialogOpened = ref(false);
    const confirmDialogTitle = ref("");
    const confirmDialogMessage = ref("");
    const confirmDialogAccept = ref(() => {
      /* Do nothing */
    });

    const options = ref({ itemsPerPage: -1 });

    const newTestTargetName = ref("");

    const group = computed((): Group | undefined => {
      return testManagementStore.findGroup(props.testMatrixId, props.groupId);
    });

    const viewPoints = computed((): ViewPoint[] => {
      const testMatrix: TestMatrix | undefined = testManagementStore.findTestMatrix(
        props.testMatrixId
      );

      return testMatrix?.viewPoints ?? [];
    });

    const headers = computed(() => {
      const headers = [];

      headers.push({
        value: "delete",
        align: "center" as const,
        sortable: false,
        headerProps: { class: "text-xs-center py-1" }
      });

      headers.push({
        value: "name",
        align: "center" as const,
        sortable: false,
        title: rootStore.message("group-edit-info.target"),
        headerProps: { class: "text-xs-center py-1" },
        width: "250"
      });

      viewPoints.value.forEach((viewPoint: ViewPoint) => {
        headers.push({
          title: viewPoint.name,
          value: viewPoint.id,
          sortable: false,
          align: "center" as const,
          width: "180",
          headerProps: {
            class: "text-xs-center py-1 ellipsis_short",
            tooltip: viewPoint.description
          }
        });
      });
      return headers;
    });

    const items = computed((): { [key: string]: string | number }[] => {
      if (!group.value) {
        return [];
      }

      return group.value.testTargets.map((testTarget: TestTarget) => {
        const item: { [key: string]: string | number } = {
          name: testTarget.name,
          id: testTarget.id
        };

        testTarget.plans.forEach((plan: Plan) => {
          item[plan.viewPointId] = plan.value;
        });

        return item;
      });
    });

    const openConfirmDialogToDeleteTestTarget = (testTargetId: string): void => {
      confirmDialogTitle.value = rootStore.message("group-edit-info.delete-target-confirm");
      confirmDialogMessage.value = rootStore.message("common.delete-warning");
      confirmDialogAccept.value = () => {
        testManagementStore.deleteTestTarget({
          testMatrixId: props.testMatrixId,
          groupId: props.groupId,
          testTargetId: testTargetId
        });
      };

      confirmDialogOpened.value = true;
    };

    const addNewTestTarget = async (): Promise<void> => {
      await testManagementStore.addNewTestTarget({
        testMatrixId: props.testMatrixId,
        groupId: props.groupId,
        testTargetName: newTestTargetName.value
      });

      newTestTargetName.value = "";
    };

    const spinButtonToChangeOrderIsDisabled = (
      testTargetId: string,
      type: "up" | "down"
    ): boolean => {
      if (!group.value) {
        return false;
      }

      const index = group.value.testTargets.findIndex((testTarget: TestTarget) => {
        return testTarget.id === testTargetId;
      });

      if (index === -1) {
        return false;
      }

      if (type === "up") {
        return index === 0;
      } else {
        return index === group.value.testTargets.length - 1;
      }
    };

    const changeTestTargetOrder = async (testTargetId: string, type: "up" | "down") => {
      if (!group.value) {
        return;
      }
      const index = group.value.testTargets.findIndex(
        (testTarget) => testTarget.id === testTargetId
      );

      const t1 = group.value.testTargets[index];
      const t2 = group.value.testTargets[type === "up" ? index - 1 : index + 1];

      await testManagementStore.updateTestTargets({
        testMatrixId: props.testMatrixId,
        groupId: props.groupId,
        testTargets: [
          { id: t1.id, index: type === "up" ? t1.index - 1 : t1.index + 1 },
          { id: t2.id, index: type === "up" ? t2.index + 1 : t1.index - 1 }
        ]
      });
    };

    const renameTestTarget = async (
      testTargetName: string,
      testTargetId: string
    ): Promise<void> => {
      await testManagementStore.updateTestTargets({
        testMatrixId: props.testMatrixId,
        groupId: props.groupId,
        testTargets: [{ id: testTargetId, name: testTargetName }]
      });
    };

    const updatePlan = (args: {
      testTargetId: string;
      viewPointId: string;
      newValue: number;
    }): void => {
      (async () => {
        const newPlans = group.value?.testTargets
          .find((testTarget) => testTarget.id === args.testTargetId)
          ?.plans.map((plan) => {
            if (plan.viewPointId !== args.viewPointId) {
              return plan;
            }

            return {
              viewPointId: plan.viewPointId,
              value: args.newValue
            };
          });

        if (!newPlans) {
          return;
        }

        await testManagementStore.updateTestTargets({
          testMatrixId: props.testMatrixId,
          groupId: props.groupId,
          testTargets: [
            {
              id: args.testTargetId,
              plans: newPlans
            }
          ]
        });
      })();
    };

    return {
      confirmDialogOpened,
      confirmDialogTitle,
      confirmDialogMessage,
      confirmDialogAccept,
      options,
      newTestTargetName,
      group,
      viewPoints,
      headers,
      items,
      openConfirmDialogToDeleteTestTarget,
      addNewTestTarget,
      spinButtonToChangeOrderIsDisabled,
      changeTestTargetOrder,
      renameTestTarget,
      updatePlan
    };
  }
});
</script>
