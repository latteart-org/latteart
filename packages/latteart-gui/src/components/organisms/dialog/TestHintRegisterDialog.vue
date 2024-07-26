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
      ok();
      close();
    "
    @cancel="close()"
  >
    <v-container fluid class="register-test-hint-dialog py-1 px-4 fill-height">
      <v-row style="height: 100%">
        <v-col class="px-2 py-0 scroll">
          <div>
            <v-textarea
              v-model="testHintValue"
              :label="$t('test-hint.common.hint-text')"
              :disabled="processing"
            />
          </div>

          <div>
            <v-text-field v-model="testMatrixName" :label="$t('test-hint.common.test-matrix')" />
          </div>

          <div>
            <v-text-field v-model="groupName" :label="$t('test-hint.common.group')" />
          </div>

          <div>
            <v-text-field v-model="testTargetName" :label="$t('test-hint.common.test-target')" />
          </div>

          <div>
            <v-text-field v-model="viewPointName" :label="$t('test-hint.common.view-point')" />
          </div>

          <div v-for="(testHintProp, index) in customPropHeaders" :key="index + testHintProp.id">
            <div v-if="testHintProp.type === 'string'">
              <v-textarea
                v-model="customPropValues[index]"
                :label="testHintProp.name"
                :disabled="processing"
              />
            </div>
            <div v-if="testHintProp.type === 'list'">
              <v-select
                v-model="customPropValues[index]"
                :label="testHintProp.name"
                :items="testHintProp.listItems"
                item-title="value"
                item-value="key"
                :disabled="processing"
              />
            </div>
          </div>

          <div>
            <v-textarea
              v-model="commentWords"
              :label="$t('test-hint.common.comment-words')"
              :disabled="processing"
            />
          </div>

          <div>
            <element-container v-model="operatedElements" />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </execute-dialog>
</template>

<script lang="ts">
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import type { PropType } from "vue";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useTestManagementStore } from "@/stores/testManagement";
import { useRootStore } from "@/stores/root";
import type { TestHintProp } from "@/lib/operationHistory/types";
import ElementContainer from "./ElementContainer.vue";

export default defineComponent({
  components: {
    "execute-dialog": ExecuteDialog,
    "element-container": ElementContainer
  },
  props: {
    opened: { type: Boolean, default: false, required: true },
    targetTestSteps: {
      type: Array as PropType<
        { operation: OperationForGUI; comments: { value: string; timestamp: string }[] }[]
      >,
      default: () => [],
      required: true
    }
  },
  emits: ["ok", "close"],
  setup(props, context) {
    const rootStore = useRootStore();
    const operationHistoryStore = useOperationHistoryStore();
    const testManagementStore = useTestManagementStore();
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
        customPropHeaders.value = testHints?.props ?? [];

        const testResultId = operationHistoryStore.testResultInfo.id;

        if (!testResultId) {
          return;
        }

        const story = testManagementStore.stories
          .filter(({ sessions }) => {
            return sessions.some(({ testResultFiles }) => {
              return testResultFiles.some(({ id }) => id === testResultId);
            });
          })
          .at(0);

        if (story) {
          const testMatrix = testManagementStore.findTestMatrix(story.testMatrixId);
          const group = testMatrix?.groups.find(({ testTargets }) =>
            testTargets.some(({ id }) => id === story.testTargetId)
          );
          const testTarget = group?.testTargets.find(({ id }) => id === story.testTargetId);
          const viewPoint = testMatrix?.viewPoints.find(({ id }) => id === story.viewPointId);

          testMatrixName.value = testMatrix?.name ?? "";
          groupName.value = group?.name ?? "";
          testTargetName.value = testTarget?.name ?? "";
          viewPointName.value = viewPoint?.name ?? "";
        }

        const defaultValues = props.targetTestSteps.reduce(
          (acc, testStep) => {
            const commentWords = testStep.comments.flatMap(({ value }) => value.split(" "));
            acc.commentWords.push(...commentWords);

            const displayedWords = testStep.operation.keywordSet
              ? Array.from(testStep.operation.keywordSet)
              : [];
            acc.displayedWords.push(...displayedWords);

            const element = testStep.operation.elementInfo;
            if (element && element.tagname) {
              acc.elements.push({
                tagname: element.tagname,
                type: element.attributes.type ?? "",
                text: element.text ?? ""
              });
            }

            return acc;
          },
          {
            commentWords: new Array<string>(),
            displayedWords: new Array<string>(),
            elements: new Array<{ tagname: string; type: string; text: string }>()
          }
        );

        const allCommentWords = defaultValues.commentWords.filter(
          (word, index, array) => array.indexOf(word) === index
        );

        const matchingTarget: "all" | "wordsOnPageOnly" = "all";

        commentWords.value = (
          matchingTarget === "all"
            ? allCommentWords
            : allCommentWords.filter((word) => defaultValues.displayedWords.includes(word))
        ).join(" ");
        operatedElements.value = defaultValues.elements.filter((e1, index, array) => {
          return (
            array.findIndex((e2) => {
              return (
                `${e2.tagname}_${e2.type}_${e2.text}` === `${e1.tagname}_${e1.type}_${e1.text}`
              );
            }) === index
          );
        });
      } finally {
        processing.value = false;
      }
    };

    const ok = async () => {
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

      context.emit("ok");
    };

    const close = (): void => {
      context.emit("close");
    };

    const { opened } = toRefs(props);
    watch(opened, initialize);

    return {
      processing,
      ok,
      close,
      testHintValue,
      testMatrixName,
      groupName,
      testTargetName,
      viewPointName,
      customPropHeaders,
      customPropValues,
      commentWords,
      operatedElements,
      isOkButtonDisabled
    };
  }
});
</script>
