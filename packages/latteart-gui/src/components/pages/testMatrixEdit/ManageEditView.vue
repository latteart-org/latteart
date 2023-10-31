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
  <v-container fluid fill-height pa-0>
    <v-container
      fluid
      pa-8
      class="align-self-start"
      style="height: 100%; overflow-y: scroll"
    >
      <v-btn @click="openTestMatrixDialogInCreateMode">{{
        $store.getters.message("manage-edit-view.add-test-matrix")
      }}</v-btn>

      <v-container v-if="hasTestMatrix" pa-0 fluid>
        <v-row class="mt-2">
          <v-col class="pb-0">
            <tab-selector
              :selectedItemId="selectedTestMatrixId"
              :items="testMatrices"
              @select="(id) => selectTestMatrix(id)"
            ></tab-selector>
          </v-col>
        </v-row>

        <v-row>
          <v-col class="pt-0">
            <v-card class="pa-2">
              <test-matrix-editor
                :testMatrixId="selectedTestMatrixId"
              ></test-matrix-editor>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-container>

    <test-matrix-dialog
      :testMatrixBeingEdited="testMatrixBeingEdited"
      @closeDialog="closeTestMatrixDialog"
      @updateTestMatrix="addNewTestMatrix"
    >
    </test-matrix-dialog>

    <execute-dialog
      :opened="editDialogOpened"
      :title="$store.getters.message('manage-edit-view.edit-viewPoint')"
      @accept="
        acceptEditDialog();
        editDialogOpened = false;
      "
      @cancel="editDialogOpened = false"
      :acceptButtonDisabled="editDialogValue === ''"
    >
      <template>
        <v-text-field v-model="editDialogValue" class="pt-0"></v-text-field>
      </template>
    </execute-dialog>

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
import { Component, Vue, Watch } from "vue-property-decorator";
import TestMatrixDialog from "@/components/organisms/testMatrixEdit/TestMatrixDialog.vue";
import { UpdateTestMatrixObject } from "@/components/organisms/testMatrixEdit/ManageEditTypes";
import { TestMatrix } from "@/lib/testManagement/types";
import ConfirmDialog from "@/components/molecules/ConfirmDialog.vue";
import TestMatrixEditor from "@/components/organisms/testMatrixEdit/TestMatrixEditor.vue";
import TabSelector from "@/components/molecules/TabSelector.vue";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";

@Component({
  components: {
    "test-matrix-dialog": TestMatrixDialog,
    "execute-dialog": ExecuteDialog,
    "confirm-dialog": ConfirmDialog,
    "test-matrix-editor": TestMatrixEditor,
    "tab-selector": TabSelector,
  },
})
export default class ManageEditView extends Vue {
  private selectedTestMatrixId = "";

  private editDialogOpened = false;
  private editDialogMessage = "";
  private editDialogValue = "";
  private testMatrixBeingEdited: TestMatrix | null = null;

  private confirmDialogOpened = false;
  private confirmDialogTitle = "";
  private confirmDialogMessage = "";
  private confirmDialogAccept() {
    /* Do nothing */
  }

  private get testMatrices(): TestMatrix[] {
    return this.$store.getters["testManagement/getTestMatrices"]();
  }

  private get hasTestMatrix(): boolean {
    return this.testMatrices.length >= 1;
  }

  private async created() {
    await this.$store.dispatch("testManagement/readProject");

    this.$store.dispatch("changeWindowTitle", {
      title: this.$store.getters.message(this.$route.meta?.title ?? ""),
    });

    this.selectTestMatrix(this.readTestMatrixIdFromLocalStorage());
  }

  @Watch("testMatrices")
  private chantSelectedTestMatrix(
    newTestMatrices: TestMatrix[],
    oldTestMatrices: TestMatrix[]
  ) {
    if (oldTestMatrices.length > newTestMatrices.length) {
      this.$nextTick(() => {
        this.selectTestMatrix(this.readTestMatrixIdFromLocalStorage());
      });
    }
  }

  private beforeDestroy() {
    localStorage.setItem(
      "latteart-management-selectedTestMatrixIdOnEditor",
      this.selectedTestMatrixId
    );
  }

  private selectTestMatrix(selectTestMatrixId: string): void {
    this.selectedTestMatrixId = selectTestMatrixId;
  }

  private goToTop() {
    this.$router.push({ name: "manageShowView" });
  }

  private openTestMatrixDialogInCreateMode(): void {
    this.testMatrixBeingEdited = {
      name: "",
      id: "",
      index: 0,
      groups: [],
      viewPoints: [],
    };
  }

  private closeTestMatrixDialog(): void {
    this.testMatrixBeingEdited = null;
  }

  private async addNewTestMatrix(obj: UpdateTestMatrixObject): Promise<void> {
    (async () => {
      await this.$store.dispatch("testManagement/addNewTestMatrix", {
        name: obj.testMatrix.name,
        viewPoints: obj.viewPoints,
      });
      this.selectTestMatrix(this.testMatrices[this.testMatrices.length - 1].id);
    })();
  }

  private readTestMatrixIdFromLocalStorage() {
    const testMatrixId =
      localStorage.getItem(
        "latteart-management-selectedTestMatrixIdOnEditor"
      ) ??
      this.testMatrices[0]?.id ??
      "";

    return this.testMatrices.find((tm) => tm.id === testMatrixId)
      ? testMatrixId
      : this.testMatrices[0]?.id;
  }
}
</script>
