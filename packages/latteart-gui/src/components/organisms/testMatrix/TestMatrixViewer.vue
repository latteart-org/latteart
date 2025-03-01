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
  <v-container v-if="testMatrix" fluid>
    <v-row>
      <v-col class="ma-2">{{ testMatrix.name }}</v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-expansion-panels v-model="expandedPanelIndex">
          <v-expansion-panel
            v-for="(group, index) in testMatrix.groups"
            :id="`groupShowArea${index}`"
            :key="group.id"
            class="py-0"
            :value="index"
          >
            <v-expansion-panel-title :title.attr="group.name">
              <div class="text-truncate">{{ group.name }}</div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <group-viewer
                :test-matrix-id="testMatrixId"
                :view-points="testMatrix.viewPoints"
                :displayed-stories="displayedStories"
                :group="group"
              ></group-viewer>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import GroupViewer from "./GroupViewer.vue";
import { type Story, type TestMatrix } from "@/lib/testManagement/types";
import { useTestManagementStore } from "@/stores/testManagement";
import { computed, defineComponent, ref, toRefs, watch } from "vue";

export default defineComponent({
  components: {
    "group-viewer": GroupViewer
  },
  props: {
    testMatrixId: { type: String, default: "", required: true },
    search: { type: String, default: "", required: false },
    completionFilter: { type: Boolean, default: false, required: true }
  },
  setup(props) {
    const testManagementStore = useTestManagementStore();

    const expandedPanelIndex = ref<number | undefined | null>(null);
    const displayedStories = ref<string[] | null>(null);

    let isInitialized = false;

    const expandedGroupPanelIndexKey = computed((): string => {
      return `latteart-management-expandedGroupPanelIndex_${props.testMatrixId}`;
    });

    const targetTestMatrix = computed((): TestMatrix | undefined => {
      return testManagementStore.findTestMatrix(props.testMatrixId);
    });

    const stories = computed((): Story[] => {
      const targetStories: Story[] = testManagementStore.getStories();
      return targetStories.filter(({ testMatrixId }) => testMatrixId === props.testMatrixId);
    });

    const testMatrix = ref<TestMatrix | undefined>(undefined);

    const initializePanels = () => {
      const index = getSavedExpandedPanelIndex();

      expandedPanelIndex.value = -1;
      testMatrix.value = targetTestMatrix.value;

      setTimeout(() => {
        if (!index || !testMatrix.value?.groups) {
          expandedPanelIndex.value = 0;
        } else if (testMatrix.value.groups.length > index) {
          expandedPanelIndex.value = index;
        } else {
          expandedPanelIndex.value = 0;
        }
        isInitialized = true;
      }, 100);

      filterItems();
    };

    const saveExpandedPanelIndex = (value: number | null | undefined) => {
      if (!isInitialized) {
        return;
      }
      if (value === null || value === undefined) {
        localStorage.removeItem(expandedGroupPanelIndexKey.value);
        return;
      }

      localStorage.setItem(expandedGroupPanelIndexKey.value, value.toString());
    };

    const getSavedExpandedPanelIndex = (): number => {
      const item = localStorage.getItem(expandedGroupPanelIndexKey.value);
      return item ? parseInt(item, 10) : 0;
    };

    const filterItems = () => {
      displayedStories.value = null;
      if (!props.search && !props.completionFilter) {
        testMatrix.value = targetTestMatrix.value;
        return;
      }
      if (!targetTestMatrix.value) {
        testMatrix.value = targetTestMatrix.value;
        return;
      }

      const filteredStories = filterStories();
      displayedStories.value = filteredStories.map((story) => story.id);

      const testTargetIds = new Set(filteredStories.map(({ testTargetId }) => testTargetId));

      const groups = targetTestMatrix.value.groups.map((group) => {
        const testTargets = group.testTargets.filter(({ id }) => testTargetIds.has(id));
        return { ...group, testTargets };
      });

      const viewPointIds = new Set(filteredStories.map(({ viewPointId }) => viewPointId));
      const viewPoints = targetTestMatrix.value.viewPoints.filter(({ id }) => viewPointIds.has(id));

      testMatrix.value = {
        ...targetTestMatrix.value,
        groups,
        viewPoints
      };
    };

    const filterStories = () => {
      if (props.completionFilter && props.search) {
        return filteredStoriesByTextAndCompleted();
      }

      if (props.completionFilter) {
        return filteredStoriesByCompleted();
      }

      if (props.search) {
        return filteredStoriesByText();
      }

      return stories.value;
    };

    const filteredStoriesByCompleted = () => {
      return stories.value.filter(
        (story) => story.sessions.findIndex(({ isDone }) => !isDone) > -1
      );
    };

    const filteredStoriesByText = () => {
      const filteredStoriesByText: Story[] = [];
      for (const story of stories.value) {
        const sessionIndex = story.sessions.findIndex(
          ({ testerName }) => testerName === props.search
        );

        if (sessionIndex > -1) {
          filteredStoriesByText.push({ ...story });
        }
      }

      return filteredStoriesByText;
    };

    const filteredStoriesByTextAndCompleted = () => {
      const filteredStoriesByText: Story[] = [];
      for (const story of stories.value) {
        const sessionIndex = story.sessions.findIndex(
          ({ testerName, isDone }) => testerName === props.search && !isDone
        );

        if (sessionIndex > -1) {
          filteredStoriesByText.push({ ...story });
        }
      }

      return filteredStoriesByText;
    };

    const { testMatrixId, search, completionFilter } = toRefs(props);
    watch(testMatrixId, initializePanels);
    watch(expandedPanelIndex, saveExpandedPanelIndex);
    watch(search, filterItems);
    watch(completionFilter, filterItems);

    initializePanels();

    return {
      expandedPanelIndex,
      testMatrix,
      displayedStories
    };
  }
});
</script>

<style lang="sass" scoped>
.ellipsis
  overflow: hidden !important
  text-overflow: ellipsis !important
  white-space: nowrap !important
</style>
