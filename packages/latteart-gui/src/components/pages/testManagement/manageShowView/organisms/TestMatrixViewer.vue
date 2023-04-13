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
      <v-flex xs12>
        <div class="mt-2 ml-2 mb-2">{{ testMatrix.name }}</div>
      </v-flex>
    </v-layout>

    <v-layout justify-end row>
      <v-flex xs12>
        <v-expansion-panels v-model="expandedPanelIndex" class="py-0">
          <v-expansion-panel
            v-for="(group, index) in testMatrix.groups"
            :key="group.id"
            class="py-0"
            :id="`groupShowArea${index}`"
          >
            <v-expansion-panel-header class="py-0">
              <div :title="group.name" class="ellipsis">{{ group.name }}</div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <group-viewer
                :testMatrixId="testMatrixId"
                :viewPoints="testMatrix.viewPoints"
                :group="group"
              ></group-viewer>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import GroupViewer from "./GroupViewer.vue";
import { TestMatrix } from "@/lib/testManagement/types";

@Component({
  components: {
    "group-viewer": GroupViewer,
  },
})
export default class TestMatrixViewer extends Vue {
  @Prop({ type: String, default: "" }) public readonly testMatrixId!: string;

  private expandedPanelIndex: number | null = null;

  private get expandedGroupPanelIndexKey(): string {
    return `latteart-management-expandedGroupPanelIndex_${this.testMatrixId}`;
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
}
</script>

<style lang="sass" scoped>
.ellipsis
  overflow: hidden !important
  text-overflow: ellipsis !important
  white-space: nowrap !important
</style>
