<!--
 Copyright 2025 NTT Corporation.

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
  <v-container fluid class="pa-0">
    <v-container fluid class="align-self-start pa-8" style="height: 100%">
      <v-btn @click="openTestMatrixDialogInCreateMode">{{
        $t("test-matrix-edit-page.add-test-matrix")
      }}</v-btn>

      <v-container v-if="hasTestMatrix" class="pa-0" fluid>
        <v-row class="mt-2">
          <v-col class="pb-0">
            <tab-selector
              :selected-item-id="selectedTestMatrixId"
              :items="testMatrices"
              @select="(id) => selectTestMatrix(id)"
            ></tab-selector>
          </v-col>
        </v-row>

        <v-row>
          <v-col class="pt-0">
            <v-card class="pa-2">
              <test-matrix-editor :test-matrix-id="selectedTestMatrixId"></test-matrix-editor>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-container>

    <test-matrix-dialog
      :test-matrix-being-edited="testMatrixBeingEdited"
      @close-dialog="closeTestMatrixDialog"
      @update-test-matrix="addNewTestMatrix"
    >
    </test-matrix-dialog>
  </v-container>
</template>

<script lang="ts">
import TestMatrixDialog from "@/components/organisms/dialog/TestMatrixDialog.vue";
import { type UpdateTestMatrixObject } from "@/components/organisms/testMatrixEdit/ManageEditTypes";
import { type TestMatrix } from "@/lib/testManagement/types";
import TestMatrixEditor from "@/components/organisms/testMatrixEdit/TestMatrixEditor.vue";
import TabSelector from "@/components/molecules/TabSelector.vue";
import { computed, defineComponent, onBeforeUnmount, ref, watch, nextTick } from "vue";
import { useTestManagementStore } from "@/stores/testManagement";
import { useRoute } from "vue-router";
import { useRootStore } from "@/stores/root";

export default defineComponent({
  components: {
    "test-matrix-dialog": TestMatrixDialog,
    "test-matrix-editor": TestMatrixEditor,
    "tab-selector": TabSelector
  },
  setup() {
    const rootStore = useRootStore();
    const testManagementStore = useTestManagementStore();
    const route = useRoute();

    const selectedTestMatrixId = ref("");
    const testMatrixBeingEdited = ref<TestMatrix | null>(null);

    const testMatrices = computed((): TestMatrix[] => {
      return testManagementStore.getTestMatrices();
    });

    const hasTestMatrix = computed((): boolean => {
      return testMatrices.value.length >= 1;
    });

    const selectTestMatrix = (selectTestMatrixId: string): void => {
      selectedTestMatrixId.value = selectTestMatrixId;
    };

    const chantSelectedTestMatrix = (
      newTestMatrices: TestMatrix[],
      oldTestMatrices: TestMatrix[]
    ) => {
      if (oldTestMatrices.length > newTestMatrices.length) {
        nextTick(() => {
          selectTestMatrix(readTestMatrixIdFromLocalStorage());
        });
      }
    };

    const openTestMatrixDialogInCreateMode = (): void => {
      testMatrixBeingEdited.value = {
        name: "",
        id: "",
        index: 0,
        groups: [],
        viewPoints: []
      };
    };

    const closeTestMatrixDialog = (): void => {
      testMatrixBeingEdited.value = null;
    };

    const addNewTestMatrix = async (obj: UpdateTestMatrixObject): Promise<void> => {
      (async () => {
        await testManagementStore.addNewTestMatrix({
          name: obj.testMatrix.name,
          viewPoints: obj.viewPoints
        });
        selectTestMatrix(testMatrices.value[testMatrices.value.length - 1].id);
      })();
    };

    const readTestMatrixIdFromLocalStorage = (): string => {
      const testMatrixId =
        localStorage.getItem("latteart-management-selectedTestMatrixIdOnEditor") ??
        testMatrices.value[0]?.id ??
        "";

      return testMatrices.value.find((tm) => tm.id === testMatrixId)
        ? testMatrixId
        : testMatrices.value[0]?.id;
    };

    onBeforeUnmount(async () => {
      localStorage.setItem(
        "latteart-management-selectedTestMatrixIdOnEditor",
        selectedTestMatrixId.value
      );
    });

    watch(testMatrices, chantSelectedTestMatrix);

    (async () => {
      await testManagementStore.readProject();

      rootStore.changeWindowTitle({
        title: rootStore.message(route.meta?.title ?? "")
      });

      selectTestMatrix(readTestMatrixIdFromLocalStorage());
    })();

    return {
      selectedTestMatrixId,
      testMatrixBeingEdited,
      testMatrices,
      hasTestMatrix,
      selectTestMatrix,
      openTestMatrixDialogInCreateMode,
      closeTestMatrixDialog,
      addNewTestMatrix
    };
  }
});
</script>
