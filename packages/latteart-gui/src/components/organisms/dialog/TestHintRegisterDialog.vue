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
  <execute-dialog
    :opened="opened"
    :title="$t('test-hint-register-dialog.title')"
    :accept-button-disabled="isOkButtonDisabled"
    @accept="
      registerTestHint();
      close();
    "
    @cancel="close()"
  >
    <test-hint-input-form
      :model-value="testHint"
      @update:model-value="updateTestHint"
    ></test-hint-input-form>
  </execute-dialog>
</template>

<script lang="ts">
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import type { PropType } from "vue";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useTestManagementStore } from "@/stores/testManagement";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useRootStore } from "@/stores/root";
import type { TestHintProp } from "@/lib/operationHistory/types";
import TestHintInputForm from "./TestHintInputForm.vue";
import {
  buildCommentMatchingWords,
  extractTestHintResources
} from "@/lib/common/testHintResourceHelper";

export default defineComponent({
  components: {
    "execute-dialog": ExecuteDialog,
    "test-hint-input-form": TestHintInputForm
  },
  props: {
    opened: { type: Boolean, default: false, required: true },
    relatedTestSteps: {
      type: Array as PropType<
        { operation: OperationForGUI; comments: { value: string; timestamp: string }[] }[]
      >,
      default: () => [],
      required: false
    }
  },
  emits: ["accept", "close"],
  setup(props, context) {
    const rootStore = useRootStore();
    const operationHistoryStore = useOperationHistoryStore();
    const testManagementStore = useTestManagementStore();
    const captureControlStore = useCaptureControlStore();
    const processing = ref(false);

    const testHintValue = ref("");
    const testMatrixName = ref("");
    const groupName = ref("");
    const testTargetName = ref("");
    const viewPointName = ref("");
    const customPropHeaders = ref<TestHintProp[]>([]);
    const customPropValues = ref<string[]>([]);
    const commentWords = ref("");
    const operatedElements = ref<{ tagname: string; type: string; text: string }[]>([]);

    const isOkButtonDisabled = computed(() => {
      return !testHintValue.value ? true : false;
    });

    const testHint = computed(() => {
      return {
        testHintValue: testHintValue.value,
        testMatrixName: testMatrixName.value,
        groupName: groupName.value,
        testTargetName: testTargetName.value,
        viewPointName: viewPointName.value,
        customProps: customPropHeaders.value.map((header, index) => {
          return {
            header,
            value: customPropValues.value.at(index) ?? ""
          };
        }),
        commentWords: commentWords.value,
        operatedElements: operatedElements.value
      };
    });

    const resetItems = () => {
      testHintValue.value = "";
      testMatrixName.value = "";
      groupName.value = "";
      testTargetName.value = "";
      viewPointName.value = "";
      customPropHeaders.value = [];
      customPropValues.value = [];
      commentWords.value = "";
      operatedElements.value = [];
    };

    const initialize = async () => {
      if (!props.opened) {
        return;
      }

      processing.value = true;

      resetItems();

      try {
        const testHints = await rootStore.dataLoader?.loadTestHints();
        const testHintResources = extractTestHintResources(props.relatedTestSteps);
        const testResultId = operationHistoryStore.testResultInfo.id;
        const currentStoryInfo = testResultId
          ? testManagementStore.getCurrentStoryInfo(testResultId)
          : undefined;

        if (currentStoryInfo && props.relatedTestSteps.length > 0) {
          testMatrixName.value = currentStoryInfo.testMatrixName;
          groupName.value = currentStoryInfo.groupName;
          testTargetName.value = currentStoryInfo.testTargetName;
          viewPointName.value = currentStoryInfo.viewPointName;
        }

        customPropHeaders.value = testHints?.props ?? [];
        commentWords.value = buildCommentMatchingWords(
          testHintResources,
          rootStore.viewSettings.testHint.commentMatching
        ).join(" ");
        operatedElements.value = testHintResources.elements;
      } finally {
        processing.value = false;
      }
    };

    const updateTestHint = async (newValue: {
      testHintValue: string;
      testMatrixName: string;
      groupName: string;
      testTargetName: string;
      viewPointName: string;
      customProps: { header: TestHintProp; value: string }[];
      commentWords: string;
      operatedElements: { tagname: string; type: string; text: string }[];
    }) => {
      testHintValue.value = newValue.testHintValue;
      testMatrixName.value = newValue.testMatrixName;
      groupName.value = newValue.groupName;
      testTargetName.value = newValue.testTargetName;
      viewPointName.value = newValue.viewPointName;
      customPropHeaders.value = newValue.customProps.map(({ header }) => header);
      customPropValues.value = newValue.customProps.map(({ value }) => value);
      commentWords.value = newValue.commentWords;
      operatedElements.value = newValue.operatedElements;
    };

    const registerTestHint = async () => {
      processing.value = true;
      try {
        await rootStore.repositoryService?.testHintRepository.postTestHint({
          value: testHintValue.value,
          testMatrixName: testMatrixName.value,
          groupName: groupName.value,
          testTargetName: testTargetName.value,
          viewPointName: viewPointName.value,
          customs: customPropHeaders.value.map((prop, index) => {
            return {
              propId: prop.id,
              value: customPropValues.value.at(index) ?? ""
            };
          }),
          commentWords: commentWords.value.split(" "),
          operationElements: operatedElements.value.filter((element) => {
            return !(element.tagname === "" && element.type === "" && element.text === "");
          })
        });
      } catch (error) {
        processing.value = false;
        throw error;
      }

      context.emit("accept");
    };

    const close = (): void => {
      context.emit("close");
    };

    const { opened } = toRefs(props);
    watch(opened, initialize);

    return {
      processing,
      registerTestHint,
      close,
      updateTestHint,
      testHint,
      isOkButtonDisabled
    };
  }
});
</script>
