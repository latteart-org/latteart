<!--
 Copyright 2024 NTT Corporation.

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
      <v-col cols="10">
        <div class="mt-2 ml-2">{{ testMatrix.name }}</div>
      </v-col>
      <v-col cols="2" style="text-align: right">
        <v-btn size="small" @click="testMatrixBeingEdited = testMatrix">
          {{ $t("test-matrix-edit-page.settings") }}
        </v-btn>
        <v-btn size="small" color="red" class="ml-2" @click="openConfirmDialogToDeleteTestMatrix">
          {{ $t("common.delete") }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-expansion-panels v-model="expandedPanelIndex">
          <v-expansion-panel
            v-for="(group, index) in testMatrix.groups"
            :id="`groupEditAreaToggle${index}`"
            :key="group.id"
            class="py-0 elevation-0"
            :value="index"
          >
            <v-expansion-panel-title class="py-0" :title.attr="group.name">
              <div v-if="expandedPanelIndex !== index" class="text-truncate">
                {{ group.name }}
              </div>
              <v-row>
                <v-col cols="10">
                  <v-text-field
                    v-if="expandedPanelIndex === index"
                    :id="`groupNameTextField${index}`"
                    variant="underlined"
                    :model-value="group.name"
                    @click="$event.stopPropagation()"
                    @change="(e: any) => renameGroup(group.id, e.target._value)"
                  ></v-text-field>
                </v-col>

                <v-col cols="2" class="align-self-center d-flex justify-end">
                  <v-btn
                    v-if="expandedPanelIndex === index"
                    size="small"
                    color="red"
                    class="mr-4"
                    @click.stop="openConfirmDialogToDeleteGroup(group.id)"
                    >{{ $t("group-edit-list.delete") }}</v-btn
                  >
                </v-col>
              </v-row>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <group-editor :test-matrix-id="testMatrixId" :group-id="group.id" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels> </v-col
    ></v-row>
    <v-row>
      <v-col cols="2"
        ><v-text-field v-model="groupName" variant="underlined" :label="$t('group-edit-list.name')"
      /></v-col>

      <v-col cols="10"
        ><v-btn
          id="createGroupButton"
          class="my-4"
          :disabled="groupName === ''"
          @click="addNewGroup"
          >{{ $t("group-edit-list.add") }}</v-btn
        ></v-col
      >
    </v-row>

    <test-matrix-dialog
      :test-matrix-being-edited="testMatrixBeingEdited"
      @close-dialog="testMatrixBeingEdited = null"
      @update-test-matrix="updateTestMatrix"
    />

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :on-accept="confirmDialogAccept"
      @close="confirmDialogOpened = false"
    />
  </v-container>
</template>

<script lang="ts">
import { type TestMatrix } from "@/lib/testManagement/types";
import ConfirmDialog from "@/components/molecules/ConfirmDialog.vue";
import TestMatrixDialog from "../dialog/TestMatrixDialog.vue";
import { type UpdateTestMatrixObject } from "./ManageEditTypes";
import GroupEditor from "./GroupEditor.vue";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import { useRootStore } from "@/stores/root";
import { useTestManagementStore } from "@/stores/testManagement";

export default defineComponent({
  components: {
    "group-editor": GroupEditor,
    "test-matrix-dialog": TestMatrixDialog,
    "confirm-dialog": ConfirmDialog
  },
  props: {
    testMatrixId: { type: String, default: "", required: true }
  },
  setup(props) {
    const rootStore = useRootStore();
    const testManagementStore = useTestManagementStore();

    const testMatrixBeingEdited = ref<TestMatrix | null>(null);

    const confirmDialogOpened = ref(false);
    const confirmDialogTitle = ref("");
    const confirmDialogMessage = ref("");
    const confirmDialogAccept = ref(() => {
      /* Do nothing */
    });

    const expandedPanelIndex = ref<number | undefined | null>(null);

    const groupName = ref("");

    const expandedGroupPanelIndexKey = computed((): string => {
      return `latteart-management-expandedEditorGroupPanelIndex_${props.testMatrixId}`;
    });

    const testMatrix = computed((): TestMatrix | undefined => {
      return testManagementStore.findTestMatrix(props.testMatrixId);
    });

    const initializePanels = () => {
      const index = getSavedExpandedPanelIndex();

      expandedPanelIndex.value = -1;

      setTimeout(() => {
        if (!index || !testMatrix.value?.groups) {
          expandedPanelIndex.value = 0;
        } else if (testMatrix.value.groups.length > index) {
          expandedPanelIndex.value = index;
        } else {
          expandedPanelIndex.value = 0;
        }
      }, 100);
    };

    const saveExpandedPanelIndex = (value: number | null | undefined) => {
      if (value === null || value === undefined) {
        localStorage.removeItem(expandedGroupPanelIndexKey.value);
        return;
      }

      localStorage.setItem(expandedGroupPanelIndexKey.value, value.toString());
    };

    const getSavedExpandedPanelIndex = (): number | undefined => {
      const item = localStorage.getItem(expandedGroupPanelIndexKey.value);

      if (item === null) {
        return undefined;
      }

      return parseInt(item, 10);
    };

    const openConfirmDialogToDeleteTestMatrix = () => {
      confirmDialogTitle.value = rootStore.message(
        "test-matrix-edit-page.delete-test-matrix-confirm"
      );
      confirmDialogMessage.value = rootStore.message("common.delete-warning");
      confirmDialogAccept.value = () => {
        testManagementStore.deleteTestMatrix({
          testMatrixId: props.testMatrixId
        });
      };

      confirmDialogOpened.value = true;
    };

    const updateTestMatrix = async (obj: UpdateTestMatrixObject): Promise<void> => {
      testManagementStore.updateTestMatrix({
        id: obj.testMatrix.id ?? "",
        name: obj.testMatrix.name,
        viewPoints: obj.viewPoints
      });
    };

    const openConfirmDialogToDeleteGroup = (groupId: string): void => {
      confirmDialogTitle.value = rootStore.message("group-edit-list.delete-group-confirm");
      confirmDialogMessage.value = rootStore.message("common.delete-warning");
      confirmDialogAccept.value = () => {
        testManagementStore.deleteGroup({
          testMatrixId: props.testMatrixId,
          groupId
        });
      };

      confirmDialogOpened.value = true;
    };

    const addNewGroup = async (): Promise<void> => {
      await testManagementStore.addNewGroup({
        testMatrixId: props.testMatrixId,
        groupName: groupName.value
      });
      groupName.value = "";
    };

    const renameGroup = (id: string, name: string): void => {
      testManagementStore.updateGroup({
        testMatrixId: props.testMatrixId,
        groupId: id,
        name
      });
    };

    const { testMatrixId } = toRefs(props);
    watch(testMatrixId, initializePanels);
    watch(expandedPanelIndex, saveExpandedPanelIndex);

    initializePanels();

    return {
      testMatrixBeingEdited,
      confirmDialogOpened,
      confirmDialogTitle,
      confirmDialogMessage,
      confirmDialogAccept,
      expandedPanelIndex,
      groupName,
      testMatrix,
      openConfirmDialogToDeleteTestMatrix,
      updateTestMatrix,
      openConfirmDialogToDeleteGroup,
      addNewGroup,
      renameGroup
    };
  }
});
</script>
