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
  <v-container fluid class="pa-0 fill-height">
    <v-container
      class="align-self-start pa-8 pt-4"
      fluid
      v-if="hasTestMatrix"
      style="height: calc(100% - 148px); overflow-y: scroll"
    >
      <v-row>
        <v-col cols="4">
          <v-row>
            <v-col cols="auto" style="align-self: center">
              <span style="color: rgba(0, 0, 0, 0.6)"
                ><v-icon>filter_list_alt</v-icon>{{ $t("test-matrix-page.search") }}</span
              ></v-col
            >
            <v-col>
              <v-text-field
                v-model="search"
                :label="$t('test-matrix-page.tester-name')"
                clearable
              ></v-text-field></v-col></v-row
        ></v-col>
        <v-col cols="auto" style="align-self: end">
          <v-checkbox
            :label="$t('test-matrix-page.incomplete-sessions')"
            v-model="isCompletionFilterEnabled"
            class="mt-2"
          ></v-checkbox>
        </v-col>
        <v-spacer></v-spacer>
      </v-row>

      <tab-selector
        :selectedItemId="selectedTestMatrixId"
        :items="testMatrices"
        @select="(id) => selectTestMatrix(id)"
      ></tab-selector>

      <v-card class="pa-2">
        <test-matrix-viewer
          :testMatrixId="selectedTestMatrixId"
          :search="search"
          :completionFilter="isCompletionFilterEnabled"
        ></test-matrix-viewer>
      </v-card>
    </v-container>

    <v-footer
      :absolute="true"
      height="148px"
      color="#424242"
      class="responsive-footer"
      style="overflow-y: hidden"
    >
      <legend-viewer></legend-viewer>
    </v-footer>
  </v-container>
</template>

<script lang="ts">
import { type TestMatrix } from "@/lib/testManagement/types";
import TabSelector from "@/components/molecules/TabSelector.vue";
import LegendViewer from "@/components/organisms/testMatrix/LegendViewer.vue";
import TestMatrixViewer from "@/components/organisms/testMatrix/TestMatrixViewer.vue";
import { computed, defineComponent, onBeforeUnmount, ref, watch } from "vue";
import { useTestManagementStore } from "@/stores/testManagement";
import { useRootStore } from "@/stores/root";
import { useRoute } from "vue-router";

export default defineComponent({
  components: {
    "legend-viewer": LegendViewer,
    "tab-selector": TabSelector,
    "test-matrix-viewer": TestMatrixViewer
  },
  setup(_, context) {
    const rootStore = useRootStore();
    const testManagementStore = useTestManagementStore();
    const route = useRoute();

    const selectedTestMatrixId = ref("");

    const search = ref(testManagementStore.testMatrixFilter.search);
    const isCompletionFilterEnabled = ref(
      testManagementStore.testMatrixFilter.isCompletionFilterEnabled
    );

    const testMatrices = computed((): TestMatrix[] => {
      return testManagementStore.getTestMatrices();
    });

    const hasTestMatrix = computed((): boolean => {
      return testMatrices.value.length >= 1;
    });

    const selectTestMatrix = (id: string): void => {
      const targetTestMatrix = testMatrices.value.find((testMatrix) => testMatrix.id === id);
      if (!targetTestMatrix) {
        return;
      }
      selectedTestMatrixId.value = targetTestMatrix.id;
    };

    const setSelectedTestMatrixId = () => {
      if (testMatrices.value.length > 0) {
        selectedTestMatrixId.value = testMatrices.value[0].id;
      } else {
        selectedTestMatrixId.value = "";
      }
    };

    const noticeTestMatrixChanged = () => {
      context.emit("selectTestMatrix", selectedTestMatrixId.value);
    };

    onBeforeUnmount(async () => {
      localStorage.setItem(
        "latteart-management-selectedTestMatrixIdOnViewer",
        selectedTestMatrixId.value
      );
      testManagementStore.setTestMatrixFilter({
        search: search.value,
        isCompletionFilterEnabled: isCompletionFilterEnabled.value
      });
    });

    watch(testMatrices, setSelectedTestMatrixId);
    watch(selectedTestMatrixId, noticeTestMatrixChanged);

    (async () => {
      rootStore.changeWindowTitle({
        title: rootStore.message(route.meta?.title ?? "")
      });

      if (!rootStore.progressDialog.opened) {
        await testManagementStore.readProject();
      }

      const testMatrixId =
        localStorage.getItem("latteart-management-selectedTestMatrixIdOnViewer") ??
        testMatrices.value[0]?.id ??
        "";
      if (testMatrices.value.find((tm) => tm.id === testMatrixId)) {
        selectTestMatrix(testMatrixId);
      }
    })();

    return {
      t: rootStore.message,
      selectedTestMatrixId,
      search,
      isCompletionFilterEnabled,
      testMatrices,
      hasTestMatrix,
      selectTestMatrix
    };
  }
});
</script>
