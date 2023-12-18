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
    <v-list-item @click="openConfirmDialog" :disabled="isDisabled">
      <v-list-item-title>{{
        store.getters.message("test-result-page.delete-test-result")
      }}</v-list-item-title>
    </v-list-item>

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="
        store.getters.message('test-result-page.delete-test-result-title')
      "
      :message="confirmMessage"
      :onAccept="deleteTestResult"
      @close="confirmDialogOpened = false"
    />

    <information-message-dialog
      :opened="informationMessageDialogOpened"
      :title="store.getters.message('common.confirm')"
      :message="
        store.getters.message('test-result-page.delete-test-result-succeeded')
      "
      @close="informationMessageDialogOpened = false"
    ></information-message-dialog>

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import ConfirmDialog from "@/components/molecules/ConfirmDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import InformationMessageDialog from "@/components/molecules/InformationMessageDialog.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import { CaptureControlState } from "@/store/captureControl";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  components: {
    "confirm-dialog": ConfirmDialog,
    "error-message-dialog": ErrorMessageDialog,
    "information-message-dialog": InformationMessageDialog,
  },
  setup() {
    const store = useStore();

    const confirmDialogOpened = ref(false);
    const confirmMessage = ref("");

    const informationMessageDialogOpened = ref(false);

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const isDisabled = computed((): boolean => {
      return (
        isCapturing.value ||
        isReplaying.value ||
        isResuming.value ||
        testResultInfo.value.id === ""
      );
    });

    const isCapturing = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState)
        .isCapturing;
    });

    const isReplaying = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState)
        .isReplaying;
    });

    const isResuming = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState)
        .isResuming;
    });

    const testResultInfo = computed(() => {
      return ((store.state as any).operationHistory as OperationHistoryState)
        .testResultInfo;
    });

    const openConfirmDialog = async () => {
      const sessions: string[] = await store.dispatch(
        "operationHistory/getSessionIds"
      );

      confirmMessage.value =
        sessions.length > 0
          ? store.getters.message(
              "test-result-page.delete-test-result-associated-session-message",
              { value: testResultInfo.value.name }
            )
          : store.getters.message(
              "test-result-page.delete-test-result-message",
              { value: testResultInfo.value.name }
            );
      confirmDialogOpened.value = true;
    };

    const deleteTestResult = async (): Promise<void> => {
      await store.dispatch("openProgressDialog", {
        message: store.getters.message("remote-access.delete-testresults"),
      });

      try {
        await store.dispatch("operationHistory/deleteTestResults", {
          testResultIds: [testResultInfo.value.id],
        });
        store.commit("operationHistory/removeStoringTestResultInfos", {
          testResultInfos: [
            { id: testResultInfo.value.id, name: testResultInfo.value.name },
          ],
        });
        await store.dispatch("operationHistory/clearTestResult");
        store.commit("operationHistory/clearScreenTransitionDiagramGraph");
        store.commit("operationHistory/clearElementCoverages");
        store.commit("operationHistory/clearInputValueTable");
        await store.dispatch("captureControl/resetTimer");

        informationMessageDialogOpened.value = true;
      } catch (error) {
        if (error instanceof Error) {
          errorMessageDialogOpened.value = true;
          errorMessage.value = error.message;
        } else {
          throw error;
        }
      } finally {
        await store.dispatch("closeProgressDialog");
      }
    };

    return {
      store,
      confirmDialogOpened,
      confirmMessage,
      informationMessageDialogOpened,
      errorMessageDialogOpened,
      errorMessage,
      isDisabled,
      openConfirmDialog,
      deleteTestResult,
    };
  },
});
</script>
