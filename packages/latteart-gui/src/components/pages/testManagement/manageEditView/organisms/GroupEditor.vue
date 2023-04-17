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
      :headers-length="300"
      v-if="group.testTargets.length > 0"
      :items="items"
      :headers="headers"
      sort-icon=""
      hide-actions
      :options.sync="options"
      :grid-column-number="8"
    >
      <template #header="props">
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
      <template #item="props">
        <tr>
          <td class="px-0 py-0 my-0" style="width: 52px">
            <v-layout>
              <v-flex>
                <v-btn
                  text
                  icon
                  class="mt-3"
                  @click="openConfirmDialogToDeleteTestTarget(props.item.id)"
                  color="error"
                  ><v-icon>delete</v-icon></v-btn
                >
              </v-flex>
            </v-layout>
          </td>
          <td class="px-0 py-0 my-0 test-target-name-td">
            <v-layout row>
              <v-flex xs11>
                <v-text-field
                  :id="`testTargetNameTextField${group.id}${props.item.id}`"
                  :value="props.item.name"
                  @change="(value) => renameTestTarget(value, props.item.id)"
                ></v-text-field>
              </v-flex>
              <v-flex xs1 mr-2>
                <v-btn
                  small
                  text
                  icon
                  class="ml-0 pl-0 mb-0 pb-0"
                  :disabled="
                    spinButtonToChangeOrderIsDisabled(props.item.id, 'up')
                  "
                  @click="changeTestTargetOrder(props.item.id, 'up')"
                  ><v-icon>arrow_drop_up</v-icon></v-btn
                >
                <v-btn
                  small
                  text
                  icon
                  class="ml-0 pl-0 mt-0 pt-0"
                  :disabled="
                    spinButtonToChangeOrderIsDisabled(props.item.id, 'down')
                  "
                  @click="changeTestTargetOrder(props.item.id, 'down')"
                  ><v-icon>arrow_drop_down</v-icon></v-btn
                >
              </v-flex>
            </v-layout>
          </td>
          <td
            v-for="(viewPoint, index) in viewPoints"
            :key="index"
            class="py-0 pr-2"
          >
            <number-field
              arrowOnly
              @updateNumberFieldValue="
                ({ value }) =>
                  updatePlan({
                    testTargetId: props.item.id,
                    viewPointId: viewPoint.id,
                    newValue: value,
                  })
              "
              :id="`${group.id}_${props.item.id}_${viewPoint.id}`"
              :value="props.item[viewPoint.id]"
              :minValue="0"
            ></number-field>
          </td>
        </tr>
      </template>
    </fixed-data-table>

    <v-layout justify-start align-center row>
      <v-flex xs2
        ><v-text-field
          :id="`newTestTargetNameTextField${group.id}`"
          v-model="newTestTargetName"
          :label="this.$store.getters.message('group-edit-info.target')"
          height="24"
        ></v-text-field
      ></v-flex>
      <v-flex xs2
        ><v-btn
          :id="`createTestTargetButton${group.id}`"
          small
          @click="addNewTestTarget"
          v-bind:disabled="newTestTargetName === ''"
          >{{ $store.getters.message("group-edit-info.add") }}</v-btn
        ></v-flex
      >
    </v-layout>

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :onAccept="confirmDialogAccept"
      @close="confirmDialogOpened = false"
    />
  </v-container>
</template>

<script lang="ts">
import {
  Group,
  Plan,
  TestMatrix,
  TestTarget,
  ViewPoint,
} from "@/lib/testManagement/types";
import ConfirmDialog from "@/components/pages/common/ConfirmDialog.vue";
import { Component, Vue, Prop } from "vue-property-decorator";
import NumberField from "@/components/molecules/NumberField.vue";
import FixedDataTable from "@/components/molecules/FixedDataTable.vue";
import LabelWithTooltip from "@/components/molecules/LabelWithTooltip.vue";

@Component({
  components: {
    "number-field": NumberField,
    "confirm-dialog": ConfirmDialog,
    "fixed-data-table": FixedDataTable,
    "label-with-tooltip": LabelWithTooltip,
  },
})
export default class GroupEditor extends Vue {
  @Prop({ type: String, default: "" }) public readonly testMatrixId!: string;
  @Prop({ type: String, default: "" }) public readonly groupId!: string;

  private confirmDialogOpened = false;
  private confirmDialogTitle = "";
  private confirmDialogMessage = "";
  private confirmDialogAccept() {
    /* Do nothing */
  }

  private options = {
    itemsPerPage: -1,
  };

  private newTestTargetName = "";

  private get group(): Group | undefined {
    return this.$store.getters["testManagement/findGroup"](
      this.testMatrixId,
      this.groupId
    );
  }

  private get viewPoints(): ViewPoint[] {
    const testMatrix: TestMatrix | undefined = this.$store.getters[
      "testManagement/findTestMatrix"
    ](this.testMatrixId, this.groupId);

    return testMatrix?.viewPoints ?? [];
  }

  private get headers(): {
    value?: string;
    align?: string;
    sortable?: boolean;
    class?: string[];
    text?: string;
    description?: string;
    width?: string;
  }[] {
    const headers = [];

    headers.push({
      value: "delete",
      align: "center",
      sortable: false,
      class: ["text-xs-center", "py-1"],
    });

    headers.push({
      value: "name",
      align: "center",
      sortable: false,
      text: this.$store.getters.message("group-edit-info.target"),
      class: ["text-xs-center", "py-1"],
      width: "250",
    });

    this.viewPoints.forEach((viewPoint: ViewPoint) => {
      headers.push({
        text: viewPoint.name,
        tooltip: viewPoint.description,
        value: viewPoint.id,
        sortable: false,
        align: "center",
        width: "180",
        class: ["text-xs-center", "py-1", "ellipsis_short"],
      });
    });

    return headers;
  }

  private get items(): { [key: string]: string | number }[] {
    if (!this.group) {
      return [];
    }

    return this.group.testTargets.map((testTarget: TestTarget) => {
      const item: { [key: string]: string | number } = {
        name: testTarget.name,
        id: testTarget.id,
      };

      testTarget.plans.forEach((plan: Plan) => {
        item[plan.viewPointId] = plan.value;
      });

      return item;
    });
  }

  private openConfirmDialogToDeleteTestTarget(testTargetId: string): void {
    this.confirmDialogTitle = this.$store.getters.message(
      "group-edit-info.delete-target-confirm"
    );
    this.confirmDialogMessage = this.$store.getters.message(
      "common.delete-warning"
    );
    this.confirmDialogAccept = () => {
      this.$store.dispatch("testManagement/deleteTestTarget", {
        testMatrixId: this.testMatrixId,
        groupId: this.groupId,
        testTargetId: testTargetId,
      });
    };

    this.confirmDialogOpened = true;
  }

  private async addNewTestTarget(): Promise<void> {
    await this.$store.dispatch("testManagement/addNewTestTarget", {
      testMatrixId: this.testMatrixId,
      groupId: this.groupId,
      testTargetName: this.newTestTargetName,
    });

    this.newTestTargetName = "";
  }

  private spinButtonToChangeOrderIsDisabled(
    testTargetId: string,
    type: "up" | "down"
  ): boolean {
    if (!this.group) {
      return false;
    }

    const index = this.group.testTargets.findIndex((testTarget: TestTarget) => {
      return testTarget.id === testTargetId;
    });

    if (index === -1) {
      return false;
    }

    if (type === "up") {
      return index === 0;
    } else {
      return index === this.group.testTargets.length - 1;
    }
  }

  private async changeTestTargetOrder(
    testTargetId: string,
    type: "up" | "down"
  ) {
    if (!this.group) {
      return;
    }
    const index = this.group.testTargets.findIndex(
      (testTarget) => testTarget.id === testTargetId
    );

    const t1 = this.group.testTargets[index];
    const t2 = this.group.testTargets[type === "up" ? index - 1 : index + 1];

    await this.$store.dispatch("testManagement/updateTestTargets", {
      testMatrixId: this.testMatrixId,
      groupId: this.groupId,
      testTargets: [
        { id: t1.id, index: type === "up" ? t1.index - 1 : t1.index + 1 },
        { id: t2.id, index: type === "up" ? t2.index + 1 : t1.index - 1 },
      ],
    });
  }

  private async renameTestTarget(
    testTargetName: string,
    testTargetId: string
  ): Promise<void> {
    await this.$store.dispatch("testManagement/updateTestTargets", {
      testMatrixId: this.testMatrixId,
      groupId: this.groupId,
      testTargets: [{ id: testTargetId, name: testTargetName }],
    });
  }

  private updatePlan(args: {
    testTargetId: string;
    viewPointId: string;
    newValue: number;
  }): void {
    (async () => {
      const newPlans = this.group?.testTargets
        .find((testTarget) => testTarget.id === args.testTargetId)
        ?.plans.map((plan) => {
          if (plan.viewPointId !== args.viewPointId) {
            return plan;
          }

          return {
            viewPointId: plan.viewPointId,
            value: args.newValue,
          };
        });

      if (!newPlans) {
        return;
      }

      await this.$store.dispatch("testManagement/updateTestTargets", {
        testMatrixId: this.testMatrixId,
        groupId: this.groupId,
        testTargets: [
          {
            id: args.testTargetId,
            plans: newPlans,
          },
        ],
      });
    })();
  }
}
</script>
