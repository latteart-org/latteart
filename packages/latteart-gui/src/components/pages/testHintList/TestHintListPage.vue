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
  <v-container fluid class="pa-4">
    <test-hint-list
      :test-hint-props="testHintProps"
      :test-hints="testHints"
      editable
      @click:edit-test-hint-button="openTestHintEditDialog"
      @click:delete-test-hint-button="openTestHintDeleteDialog"
    >
      <template #actions>
        <v-btn class="ml-3" @click="isTestHintPropsEditDialogOpened = true">{{
          $t("common.edit-props")
        }}</v-btn>
        <v-btn class="ml-3" @click="isTestHintRegisterDialogOpened = true">{{
          $t("common.register-test-hint")
        }}</v-btn>
      </template>
    </test-hint-list>

    <test-hint-props-edit-dialog
      :opened="isTestHintPropsEditDialogOpened"
      :props="testHintProps"
      @update="updateTestHintProps"
      @close="isTestHintPropsEditDialogOpened = false"
    ></test-hint-props-edit-dialog>

    <test-hint-register-dialog
      :opened="isTestHintRegisterDialogOpened"
      @accept="loadTestHints"
      @close="isTestHintRegisterDialogOpened = false"
    ></test-hint-register-dialog>

    <test-hint-edit-dialog
      :opened="isTestHintEditDialogOpened"
      :test-hint-props="testHintProps"
      :test-hint="editingTestHint"
      @accept="loadTestHints"
      @close="isTestHintEditDialogOpened = false"
    ></test-hint-edit-dialog>

    <error-message-dialog
      :opened="isErrorMessageDialogOpened"
      :message="errorMessage"
      @close="isErrorMessageDialogOpened = false"
    />

    <confirm-dialog
      :opened="isConfirmDialogOpened"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :on-accept="confirmDialogAccept"
      @close="isConfirmDialogOpened = false"
    />
  </v-container>
</template>

<script lang="ts">
import { type TestHint, type TestHintProp } from "@/lib/operationHistory/types";
import { computed, defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import { useRootStore } from "@/stores/root";
import TestHintList from "@/components/organisms/common/TestHintList.vue";
import TestHintPropsEditDialog from "@/components/organisms/dialog/TestHintPropsEditDialog.vue";
import TestHintRegisterDialog from "@/components/organisms/dialog/TestHintRegisterDialog.vue";
import ConfirmDialog from "@/components/molecules/ConfirmDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import TestHintEditDialog from "@/components/organisms/dialog/TestHintEditDialog.vue";

export default defineComponent({
  components: {
    "test-hint-list": TestHintList,
    "test-hint-props-edit-dialog": TestHintPropsEditDialog,
    "test-hint-register-dialog": TestHintRegisterDialog,
    "test-hint-edit-dialog": TestHintEditDialog,
    "error-message-dialog": ErrorMessageDialog,
    "confirm-dialog": ConfirmDialog
  },
  setup() {
    const rootStore = useRootStore();
    const route = useRoute();

    const testHintProps = ref<TestHintProp[]>([]);
    const testHints = ref<TestHint[]>([]);
    const editingTestHintId = ref("");

    const isTestHintPropsEditDialogOpened = ref<boolean>(false);
    const isTestHintRegisterDialogOpened = ref<boolean>(false);
    const isTestHintEditDialogOpened = ref<boolean>(false);
    const isErrorMessageDialogOpened = ref<boolean>(false);
    const errorMessage = ref<string>("");
    const isConfirmDialogOpened = ref<boolean>(false);
    const confirmDialogTitle = ref<string>("");
    const confirmDialogMessage = ref<string>("");
    const confirmDialogAccept = ref(() => {
      /* Do nothing */
    });

    const editingTestHint = computed(() => {
      return (
        testHints.value.find(({ id }) => {
          return id === editingTestHintId.value;
        }) ?? {
          id: "",
          value: "",
          testMatrixName: "",
          groupName: "",
          testTargetName: "",
          viewPointName: "",
          customs: [],
          commentWords: [],
          operationElements: [],
          issues: []
        }
      );
    });

    const openTestHintEditDialog = (testHintId: string) => {
      editingTestHintId.value = testHintId;
      isTestHintEditDialogOpened.value = true;
    };

    const openTestHintDeleteDialog = (testHintId: string) => {
      confirmDialogTitle.value = rootStore.message("test-hint-list-page.delete-message");
      confirmDialogMessage.value = rootStore.message("common.delete-warning", {
        value: testHintId
      });

      confirmDialogAccept.value = () => {
        deleteTestHint(testHintId);
      };

      isConfirmDialogOpened.value = true;
    };

    const loadTestHints = async () => {
      if (!rootStore.dataLoader) {
        return;
      }

      const testHintPropsAndData = await rootStore.dataLoader.loadTestHints();

      testHintProps.value = testHintPropsAndData.props;
      testHints.value = testHintPropsAndData.data;
    };

    const updateTestHintProps = async (
      updatedProps: (Omit<TestHintProp, "id"> & { id?: string })[]
    ) => {
      if (!rootStore.repositoryService) {
        return;
      }

      try {
        await rootStore.repositoryService.testHintPropRepository.putTestHintProps(updatedProps);
        await loadTestHints();
      } catch (error) {
        if (error instanceof Error) {
          isErrorMessageDialogOpened.value = true;
          errorMessage.value = error.message;
        } else {
          throw error;
        }
      }
    };

    const deleteTestHint = async (testHintId: string) => {
      if (!rootStore.repositoryService) {
        return;
      }

      try {
        await rootStore.repositoryService.testHintRepository.deleteTestHint({ id: testHintId });
        await loadTestHints();
      } catch (error) {
        if (error instanceof Error) {
          isErrorMessageDialogOpened.value = true;
          errorMessage.value = error.message;
        } else {
          throw error;
        }
      }
    };

    (async () => {
      rootStore.changeWindowTitle({
        title: rootStore.message(route.meta?.title ?? "")
      });

      await loadTestHints();
    })();

    return {
      testHintProps,
      testHints,
      editingTestHint,
      isTestHintPropsEditDialogOpened,
      isTestHintRegisterDialogOpened,
      isTestHintEditDialogOpened,
      isErrorMessageDialogOpened,
      errorMessage,
      isConfirmDialogOpened,
      confirmDialogTitle,
      confirmDialogMessage,
      confirmDialogAccept,
      loadTestHints,
      updateTestHintProps,
      openTestHintEditDialog,
      openTestHintDeleteDialog
    };
  }
});
</script>
