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
    :title="$t('test-hint-edit-dialog.title')"
    :accept-button-disabled="isOkButtonDisabled"
    @accept="
      saveTestHint();
      close();
    "
    @cancel="close()"
  >
    <test-hint-input-form
      :model-value="editingTestHint"
      @update:model-value="updateTestHint"
    ></test-hint-input-form>
  </execute-dialog>
</template>

<script lang="ts">
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import type { PropType } from "vue";
import { useRootStore } from "@/stores/root";
import type { TestHint, TestHintProp } from "@/lib/operationHistory/types";
import TestHintInputForm from "./TestHintInputForm.vue";

export default defineComponent({
  components: {
    "execute-dialog": ExecuteDialog,
    "test-hint-input-form": TestHintInputForm
  },
  props: {
    opened: { type: Boolean, default: false, required: true },
    testHintProps: {
      type: Array as PropType<TestHintProp[]>,
      required: true
    },
    testHint: {
      type: Object as PropType<TestHint>,
      required: true
    }
  },
  emits: ["accept", "close"],
  setup(props, context) {
    const rootStore = useRootStore();
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

    const editingTestHint = computed(() => {
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
        testHintValue.value = props.testHint.value;
        testMatrixName.value = props.testHint.testMatrixName;
        groupName.value = props.testHint.groupName;
        testTargetName.value = props.testHint.testTargetName;
        viewPointName.value = props.testHint.viewPointName;
        customPropHeaders.value = props.testHintProps;
        customPropValues.value = props.testHintProps.map((testHintProp) => {
          const value =
            props.testHint.customs.find(({ propId }) => propId === testHintProp.id)?.value ?? "";
          return typeof value === "string" ? value : value.join(" ");
        });
        commentWords.value = props.testHint.commentWords.join(" ");
        operatedElements.value = props.testHint.operationElements;
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

    const saveTestHint = async () => {
      processing.value = true;
      try {
        await rootStore.repositoryService?.testHintRepository.putTestHint({
          id: props.testHint.id,
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
      saveTestHint,
      close,
      updateTestHint,
      editingTestHint,
      isOkButtonDisabled
    };
  }
});
</script>
