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
  <v-container fluid class="pa-0" v-if="testMatrix">
    <v-layout justify-end row>
      <v-flex xs6>
        <div class="mt-2 ml-2">{{ testMatrix.name }}</div>
      </v-flex>

      <v-flex xs6 style="text-align: right">
        <v-btn small @click="testMatrixBeingEdited = testMatrix">
          {{ $store.getters.message("manage-edit-view.settings") }}
        </v-btn>
        <v-btn
          small
          color="red"
          dark
          @click="openConfirmDialogToDeleteTestMatrix"
        >
          {{ $store.getters.message("common.delete") }}
        </v-btn>
      </v-flex>
    </v-layout>

    <v-expansion-panel v-model="expandedPanelIndex" class="py-0">
      <v-expansion-panel-content
        :id="`groupEditAreaToggle${index}`"
        v-for="(group, index) in testMatrix.groups"
        :key="group.id"
        class="py-0 elevation-0"
      >
        <template v-slot:header class="py-0">
          <v-flex xs10>
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
          </v-flex>

          <v-flex xs2>
            <v-btn
              v-if="expandedPanelIndex === index"
              @click="openConfirmDialogToDeleteGroup(group.id)"
              small
              color="error"
              >{{ $store.getters.message("group-edit-list.delete") }}</v-btn
            >
          </v-flex>
        </template>

        <group-editor :testMatrixId="testMatrixId" :groupId="group.id" />
      </v-expansion-panel-content>
    </v-expansion-panel>

    <v-btn id="createGroupButton" @click="addNewGroup">{{
      $store.getters.message("group-edit-list.add")
    }}</v-btn>

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
import ConfirmDialog from "@/vue/pages/common/ConfirmDialog.vue";
import TestMatrixDialog from "./TestMatrixDialog.vue";
import { UpdateTestMatrixObject } from "../ManageEditTypes";
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

  private expandedPanelIndex: number | null = null;

  private get expandedGroupPanelIndexKey(): string {
    return `expandedEditorGroupPanelIndex_${this.testMatrixId}`;
  }

  created(): void {
    this.initializePanels();
  }

  @Watch("testMatrixId")
  private initializePanels() {
    const index = this.getSavedExpandedPanelIndex();

    this.expandedPanelIndex = -1;

    setTimeout(() => {
      this.expandedPanelIndex = index;
    }, 100);
  }

  @Watch("expandedPanelIndex")
  private saveExpandedPanelIndex(value: number | null) {
    if (value === null) {
      localStorage.removeItem(this.expandedGroupPanelIndexKey);
      return;
    }

    localStorage.setItem(this.expandedGroupPanelIndexKey, value.toString());
  }

  private getSavedExpandedPanelIndex(): number | null {
    const item = localStorage.getItem(this.expandedGroupPanelIndexKey);

    if (item === null) {
      return 0;
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
      "manage-edit-view.delete-test-matrix-confirm"
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
    });
  }

  private renameGroup(id: string, name: string): void {
    this.$store.dispatch("testManagement/updateGroup", {
      testMatrixId: this.testMatrixId,
      groupId: id,
      params: {
        name,
      },
    });
  }
}
</script>
