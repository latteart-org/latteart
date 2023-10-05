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
      <v-col class="ma-2">{{ testMatrix.name }}</v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-expansion-panels v-model="expandedPanelIndex">
          <v-expansion-panel
            v-for="(group, index) in testMatrix.groups"
            :key="group.id"
            class="py-0"
            :id="`groupShowArea${index}`"
          >
            <v-expansion-panel-header>
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import GroupViewer from "./GroupViewer.vue";
import { Story, TestMatrix } from "@/lib/testManagement/types";

@Component({
  components: {
    "group-viewer": GroupViewer,
  },
})
export default class TestMatrixViewer extends Vue {
  @Prop({ type: String, default: "" }) public readonly testMatrixId!: string;
  @Prop({ type: String, default: "" }) public readonly search!: string;
  @Prop({ type: Boolean, default: false })
  public readonly completionFilter!: boolean;

  private expandedPanelIndex: number | undefined | null = null;
  private testMatrix = this.targetTestMatrix;

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
    this.testMatrix = this.targetTestMatrix;

    setTimeout(() => {
      if ((this.testMatrix?.groups.length ?? 0) > (index ?? 0)) {
        this.expandedPanelIndex = index;
      } else {
        this.expandedPanelIndex = 0;
      }
    }, 100);

    this.filterItems();
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
      if (this.testMatrix?.groups.length ?? 0 > 0) {
        return 0;
      }
      return undefined;
    }

    return parseInt(item, 10);
  }

  private get targetTestMatrix(): TestMatrix | undefined {
    return this.$store.getters["testManagement/findTestMatrix"](
      this.testMatrixId
    );
  }

  private get stories(): Story[] {
    const targetStories: Story[] =
      this.$store.getters["testManagement/getStories"]();
    return targetStories.filter(
      ({ testMatrixId }) => testMatrixId === this.testMatrixId
    );
  }

  @Watch("completionFilter")
  @Watch("search")
  private filterItems() {
    if (!this.search && !this.completionFilter) {
      this.testMatrix = this.targetTestMatrix;
      return;
    }
    if (!this.targetTestMatrix) {
      this.testMatrix = this.targetTestMatrix;
      return;
    }

    const filteredStories = this.filterStories();

    const testTargetIds = new Set(
      filteredStories.map(({ testTargetId }) => testTargetId)
    );

    const groups = this.targetTestMatrix.groups.map((group) => {
      const testTargets = group.testTargets.filter(({ id }) =>
        testTargetIds.has(id)
      );
      return { ...group, testTargets };
    });

    const viewPointIds = new Set(
      filteredStories.map(({ viewPointId }) => viewPointId)
    );
    const viewPoints = this.targetTestMatrix.viewPoints.filter(({ id }) =>
      viewPointIds.has(id)
    );

    this.testMatrix = {
      ...this.targetTestMatrix,
      groups,
      viewPoints,
    };
  }

  private filterStories() {
    const filteredStoriesByCompleted = this.completionFilter
      ? this.stories.filter(
          (story) => story.sessions.findIndex(({ isDone }) => !isDone) > -1
        )
      : this.stories;

    if (this.search) {
      const filteredStoriesByText: Story[] = [];
      for (const story of filteredStoriesByCompleted) {
        const sessionIndex = story.sessions.findIndex(
          ({ testerName }) => testerName === this.search
        );
        if (sessionIndex > -1) {
          filteredStoriesByText.push({ ...story });
        }
      }

      return filteredStoriesByText;
    }

    return filteredStoriesByCompleted;
  }
}
</script>

<style lang="sass" scoped>
.ellipsis
  overflow: hidden !important
  text-overflow: ellipsis !important
  white-space: nowrap !important
</style>
