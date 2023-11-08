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
        store.getters.message("test-matrix-edit-page.add-test-matrix")
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
  </v-container>
</template>

<script lang="ts">
import TestMatrixDialog from "@/components/organisms/dialog/TestMatrixDialog.vue";
import { UpdateTestMatrixObject } from "@/components/organisms/testMatrixEdit/ManageEditTypes";
import { TestMatrix } from "@/lib/testManagement/types";
import TestMatrixEditor from "@/components/organisms/testMatrixEdit/TestMatrixEditor.vue";
import TabSelector from "@/components/molecules/TabSelector.vue";
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  ref,
  watch,
  nextTick,
} from "vue";
import { useStore } from "@/store";
import { useRoute } from "vue-router/composables";

export default defineComponent({
  components: {
    "test-matrix-dialog": TestMatrixDialog,
    "test-matrix-editor": TestMatrixEditor,
    "tab-selector": TabSelector,
  },
  setup() {
    const store = useStore();
    const route = useRoute();

    const selectedTestMatrixId = ref("");
    const testMatrixBeingEdited = ref<TestMatrix | null>(null);

    const testMatrices = computed((): TestMatrix[] => {
      return store.getters["testManagement/getTestMatrices"]();
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
        viewPoints: [],
      };
    };

    const closeTestMatrixDialog = (): void => {
      testMatrixBeingEdited.value = null;
    };

    const addNewTestMatrix = async (
      obj: UpdateTestMatrixObject
    ): Promise<void> => {
      (async () => {
        await store.dispatch("testManagement/addNewTestMatrix", {
          name: obj.testMatrix.name,
          viewPoints: obj.viewPoints,
        });
        selectTestMatrix(testMatrices.value[testMatrices.value.length - 1].id);
      })();
    };

    const readTestMatrixIdFromLocalStorage = (): string => {
      const testMatrixId =
        localStorage.getItem(
          "latteart-management-selectedTestMatrixIdOnEditor"
        ) ??
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
      await store.dispatch("testManagement/readProject");

      await store.dispatch("changeWindowTitle", {
        title: store.getters.message(route.meta?.title ?? ""),
      });

      selectTestMatrix(readTestMatrixIdFromLocalStorage());
    })();

    return {
      store,
      selectedTestMatrixId,
      testMatrixBeingEdited,
      testMatrices,
      hasTestMatrix,
      selectTestMatrix,
      openTestMatrixDialogInCreateMode,
      closeTestMatrixDialog,
      addNewTestMatrix,
    };
  },
});
</script>
