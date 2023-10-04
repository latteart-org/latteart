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
            <v-col cols="auto" style="align-self: center">
              <span style="color: rgba(0, 0, 0, 0.6)"
                ><v-icon>search</v-icon
                >{{ this.$store.getters.message("manage-show.search") }}</span
              ></v-col
            >
            <v-col>
              <v-text-field
                v-model="search"
                :label="this.$store.getters.message('manage-show.tester-name')"
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
import { Component, Vue, Watch } from "vue-property-decorator";
import LegendViewer from "./organisms/LegendViewer.vue";
import TestMatrixViewer from "./organisms/TestMatrixViewer.vue";

@Component({
  components: {
    "legend-viewer": LegendViewer,
    "tab-selector": TabSelector,
    "test-matrix-viewer": TestMatrixViewer,
  },
})
export default class ManageShow extends Vue {
  private selectedTestMatrixId = "";
  private search = "";
  private isStatusFilterEnabled = false;

  private get locale() {
    return this.$store.getters.getLocale();
  }

  @Watch("locale")
  private updateWindowTitle() {
    this.$store.dispatch("changeWindowTitle", {
      title: this.$store.getters.message("manage-show.window-title"),
    });
  }

  @Watch("selectedTestMatrixId")
  private noticeTestMatrixChanged() {
    this.$emit("selectTestMatrix", this.selectedTestMatrixId);
  }

  private get testMatrices(): TestMatrix[] {
    const targetTestMatrices =
      this.$store.getters["testManagement/getTestMatrices"]();

    if (targetTestMatrices.length > 0) {
      this.selectedTestMatrixId = targetTestMatrices[0].id;
    } else {
      this.selectedTestMatrixId = "";
    }

    return targetTestMatrices;
  }

  private get hasTestMatrix(): boolean {
    return this.testMatrices.length >= 1;
  }

  private async created() {
    if (!this.$store.state.progressDialog.opened) {
      await this.$store.dispatch("testManagement/readProject");
    }
    this.updateWindowTitle();

    const testMatrixId =
      localStorage.getItem(
        "latteart-management-selectedTestMatrixIdOnViewer"
      ) ??
      this.testMatrices[0]?.id ??
      "";

    if (this.testMatrices.find((tm) => tm.id === testMatrixId)) {
      this.selectTestMatrix(testMatrixId);
    }
  }

  private beforeDestroy() {
    localStorage.setItem(
      "latteart-management-selectedTestMatrixIdOnViewer",
      this.selectedTestMatrixId
    );
  }

  private selectTestMatrix(id: string): void {
    const targetTestMatrix = this.testMatrices.find(
      (testMatrix) => testMatrix.id === id
    );

    if (!targetTestMatrix) {
      return;
    }

    this.selectedTestMatrixId = targetTestMatrix.id;
  }
}
</script>
