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
  <v-container fluid v-if="testMatrix">
    <v-row>
      <v-col cols="10">
        <div class="mt-2 ml-2">{{ testMatrix.name }}</div>
      </v-col>
      <v-col cols="2" style="text-align: right">
        <v-btn small @click="testMatrixBeingEdited = testMatrix">
          {{ $store.getters.message("test-matrix-edit-page.settings") }}
        </v-btn>
        <v-btn
          small
          color="red"
          dark
          @click="openConfirmDialogToDeleteTestMatrix"
          class="ml-2"
        >
          {{ $store.getters.message("common.delete") }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-expansion-panels v-model="expandedPanelIndex">
          <v-expansion-panel
            :id="`groupEditAreaToggle${index}`"
            v-for="(group, index) in testMatrix.groups"
            :key="group.id"
            class="py-0 elevation-0"
          >
            <v-expansion-panel-header class="py-0">
              <v-row>
                <v-col cols="10">
                  <div
                    v-if="expandedPanelIndex !== index"
                    :title="group.name"
                    class="ellipsis"
                  >
                    {{ group.name }}
                  </div>
                  <v-text-field
                    :id="`groupNameTextField${index}`"
                    v-if="expandedPanelIndex === index"
                    :value="group.name"
                    @click="$event.stopPropagation()"
                    @change="(value) => renameGroup(group.id, value)"
                  ></v-text-field>
                </v-col>

                <v-col cols="2" class="align-self-center d-flex justify-end">
                  <v-btn
                    v-if="expandedPanelIndex === index"
                    @click.stop="openConfirmDialogToDeleteGroup(group.id)"
                    small
                    color="error"
                    class="mr-4"
                    >{{
                      $store.getters.message("group-edit-list.delete")
                    }}</v-btn
                  >
                </v-col>
              </v-row>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <group-editor :testMatrixId="testMatrixId" :groupId="group.id" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels> </v-col
    ></v-row>
    <v-row>
      <v-col cols="2"
        ><v-text-field
          v-model="groupName"
          :label="this.$store.getters.message('group-edit-list.name')"
      /></v-col>

      <v-col cols="10"
        ><v-btn
          id="createGroupButton"
          @click="addNewGroup"
          class="my-4"
          :disabled="groupName === ''"
          >{{ $store.getters.message("group-edit-list.add") }}</v-btn
        ></v-col
      >
    </v-row>

    <test-matrix-dialog
      :testMatrixBeingEdited="testMatrixBeingEdited"
      @closeDialog="testMatrixBeingEdited = null"
      @updateTestMatrix="updateTestMatrix"
    />

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
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { TestMatrix } from "@/lib/testManagement/types";
import ConfirmDialog from "@/components/molecules/ConfirmDialog.vue";
import TestMatrixDialog from "../dialog/TestMatrixDialog.vue";
import { UpdateTestMatrixObject } from "./ManageEditTypes";
import GroupEditor from "./GroupEditor.vue";

@Component({
  components: {
    "group-editor": GroupEditor,
    "test-matrix-dialog": TestMatrixDialog,
    "confirm-dialog": ConfirmDialog,
  },
})
export default class TestMatrixEditor extends Vue {
  @Prop({ type: String, default: "" }) public readonly testMatrixId!: string;

  private testMatrixBeingEdited: TestMatrix | null = null;

  private confirmDialogOpened = false;
  private confirmDialogTitle = "";
  private confirmDialogMessage = "";
  private confirmDialogAccept = () => {
    /* Do nothing */
  };

  private expandedPanelIndex: number | undefined | null = null;

  private groupName: string = "";

  private get expandedGroupPanelIndexKey(): string {
    return `latteart-management-expandedEditorGroupPanelIndex_${this.testMatrixId}`;
  }

  created(): void {
    this.initializePanels();
  }

  @Watch("testMatrixId")
  private initializePanels() {
    const index = this.getSavedExpandedPanelIndex();

    this.expandedPanelIndex = -1;

    setTimeout(() => {
      if (!index || !this.testMatrix?.groups) {
        this.expandedPanelIndex = 0;
      } else if (this.testMatrix.groups.length > index) {
        this.expandedPanelIndex = index;
      } else {
        this.expandedPanelIndex = 0;
      }
    }, 100);
  }

  @Watch("expandedPanelIndex")
  private saveExpandedPanelIndex(value: number | null | undefined) {
    if (value === null || value === undefined) {
      localStorage.removeItem(this.expandedGroupPanelIndexKey);
      return;
    }

    localStorage.setItem(this.expandedGroupPanelIndexKey, value.toString());
  }

  private getSavedExpandedPanelIndex(): number | undefined {
    const item = localStorage.getItem(this.expandedGroupPanelIndexKey);

    if (item === null) {
      return undefined;
    }

    return parseInt(item, 10);
  }

  private get testMatrix(): TestMatrix | undefined {
    return this.$store.getters["testManagement/findTestMatrix"](
      this.testMatrixId
    );
  }

  private openConfirmDialogToDeleteTestMatrix() {
    this.confirmDialogTitle = this.$store.getters.message(
      "test-matrix-edit-page.delete-test-matrix-confirm"
    );
    this.confirmDialogMessage = this.$store.getters.message(
      "common.delete-warning"
    );
    this.confirmDialogAccept = () => {
      this.$store.dispatch("testManagement/deleteTestMatrix", {
        testMatrixId: this.testMatrixId,
      });
    };

    this.confirmDialogOpened = true;
  }

  private async updateTestMatrix(obj: UpdateTestMatrixObject): Promise<void> {
    this.$store.dispatch("testManagement/updateTestMatrix", {
      id: obj.testMatrix.id,
      name: obj.testMatrix.name,
      viewPoints: obj.viewPoints,
    });
  }

  private openConfirmDialogToDeleteGroup(groupId: string): void {
    this.confirmDialogTitle = this.$store.getters.message(
      "group-edit-list.delete-group-confirm"
    );
    this.confirmDialogMessage = this.$store.getters.message(
      "common.delete-warning"
    );
    this.confirmDialogAccept = () => {
      this.$store.dispatch("testManagement/deleteGroup", {
        testMatrixId: this.testMatrixId,
        groupId,
      });
    };

    this.confirmDialogOpened = true;
  }

  private async addNewGroup(): Promise<void> {
    await this.$store.dispatch("testManagement/addNewGroup", {
      testMatrixId: this.testMatrixId,
      groupName: this.groupName,
    });
    this.groupName = "";
  }

  private renameGroup(id: string, name: string): void {
    this.$store.dispatch("testManagement/updateGroup", {
      testMatrixId: this.testMatrixId,
      groupId: id,
      name,
    });
  }
}
</script>
