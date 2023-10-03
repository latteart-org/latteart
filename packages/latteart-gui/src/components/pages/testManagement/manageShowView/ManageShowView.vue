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
  <div>
    <v-container fluid v-if="hasTestMatrix">
      <v-row>
        <v-col cols="3">
          <v-row>
            <v-col cols="4" style="align-self: center">
              <span style="color: rgba(0, 0, 0, 0.6)"
                ><v-icon>search</v-icon
                >{{ store.getters.message("manage-show.search") }}</span
              ></v-col
            >
            <v-col>
              <v-text-field
                v-model="search"
                :label="store.getters.message('manage-show.tester-name')"
              ></v-text-field></v-col></v-row
        ></v-col>
        <v-col cols="2" style="align-self: center">
          <v-checkbox
            :label="this.$store.getters.message('manage-show.status-ng')"
            v-model="isStatusFilterEnabled"
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
          :statusFilter="isStatusFilterEnabled"
        ></test-matrix-viewer>
      </v-card>
    </v-container>

    <v-footer
      v-if="$vuetify.breakpoint.width > 800"
      app
      height="auto"
      color="latteart-main"
      class="responsive-footer"
    >
      <legend-viewer></legend-viewer>
    </v-footer>
  </div>
</template>

<script lang="ts">
import { TestMatrix } from "@/lib/testManagement/types";
import TabSelector from "@/components/molecules/TabSelector.vue";
import LegendViewer from "./organisms/LegendViewer.vue";
import TestMatrixViewer from "./organisms/TestMatrixViewer.vue";
import { computed, defineComponent, onBeforeMount, ref, watch } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  components: {
    "legend-viewer": LegendViewer,
    "tab-selector": TabSelector,
    "test-matrix-viewer": TestMatrixViewer,
  },
  setup(props, context) {
    const store = useStore();

    const selectedTestMatrixId = ref("");
    const search = ref("");
    const isStatusFilterEnabled = ref(false);

    const locale = computed(() => {
      return store.getters.getLocale();
    });

    const testMatrices = computed((): TestMatrix[] => {
      const targetTestMatrices =
        store.getters["testManagement/getTestMatrices"]();

      if (targetTestMatrices.length > 0) {
        selectedTestMatrixId.value = targetTestMatrices[0].id;
      } else {
        selectedTestMatrixId.value = "";
      }
      return targetTestMatrices;
    });

    const hasTestMatrix = computed((): boolean => {
      return testMatrices.value.length >= 1;
    });

    const selectTestMatrix = (id: string): void => {
      const targetTestMatrix = testMatrices.value.find(
        (testMatrix) => testMatrix.id === id
      );

      if (!targetTestMatrix) {
        return;
      }

      selectedTestMatrixId.value = targetTestMatrix.id;
    };

    const updateWindowTitle = () => {
      store.dispatch("changeWindowTitle", {
        title: store.getters.message("manage-show.window-title"),
      });
    };

    const noticeTestMatrixChanged = () => {
      context.emit("selectTestMatrix", selectedTestMatrixId.value);
    };

    onBeforeMount(async () => {
      localStorage.setItem(
        "latteart-management-selectedTestMatrixIdOnViewer",
        selectedTestMatrixId.value
      );
    });

    watch(locale, updateWindowTitle);
    watch(selectedTestMatrixId, noticeTestMatrixChanged);

    const created = async () => {
      if (!store.state.progressDialog.opened) {
        await store.dispatch("testManagement/readProject");
      }
      updateWindowTitle();

      const testMatrixId =
        localStorage.getItem(
          "latteart-management-selectedTestMatrixIdOnViewer"
        ) ??
        testMatrices.value[0]?.id ??
        "";

      if (testMatrices.value.find((tm) => tm.id === testMatrixId)) {
        selectTestMatrix(testMatrixId);
      }
    };
    return {
      store,
      selectedTestMatrixId,
      search,
      isStatusFilterEnabled,
      testMatrices,
      hasTestMatrix,
      selectTestMatrix,
    };
  },
});
</script>
