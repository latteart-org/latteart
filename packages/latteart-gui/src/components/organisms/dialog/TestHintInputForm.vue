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
  <v-container fluid class="register-test-hint-dialog py-1 px-4 fill-height">
    <v-row style="height: 100%">
      <v-col class="px-2 py-0 scroll">
        <div>
          <v-textarea
            :model-value="modelValue.testHintValue"
            variant="underlined"
            :label="$t('common.hint-text')"
            @update:model-value="(value: string) => emitTestHintUpdated({ testHintValue: value })"
          />
        </div>

        <div>
          <p class="text-subtitle-1 text-medium-emphasis">{{ $t("common.issues") }}</p>
          <test-hint-issue-container
            :model-value="modelValue.issues"
            @update:model-value="(value) => emitTestHintUpdated({ issues: value })"
          />
        </div>

        <div>
          <v-text-field
            :model-value="modelValue.testMatrixName"
            variant="underlined"
            :label="$t('common.test-matrix')"
            @update:model-value="(value: string) => emitTestHintUpdated({ testMatrixName: value })"
          />
        </div>

        <div>
          <v-text-field
            :model-value="modelValue.groupName"
            variant="underlined"
            :label="$t('common.group')"
            @update:model-value="(value: string) => emitTestHintUpdated({ groupName: value })"
          />
        </div>

        <div>
          <v-text-field
            :model-value="modelValue.testTargetName"
            variant="underlined"
            :label="$t('common.test-target')"
            @update:model-value="(value: string) => emitTestHintUpdated({ testTargetName: value })"
          />
        </div>

        <div>
          <v-text-field
            :model-value="modelValue.viewPointName"
            variant="underlined"
            :label="$t('common.test-hint-viewpoint')"
            @update:model-value="(value: string) => emitTestHintUpdated({ viewPointName: value })"
          />
        </div>

        <div v-for="({ header, value }, index) in modelValue.customProps" :key="index + header.id">
          <div v-if="header.type === 'string'">
            <v-textarea
              :model-value="value"
              variant="underlined"
              :label="header.name"
              @update:model-value="
                (value: string) =>
                  emitTestHintUpdated({
                    customProps: modelValue.customProps.map((prop, i) => {
                      return { header: prop.header, value: i === index ? value : prop.value };
                    })
                  })
              "
            />
          </div>
          <div v-if="header.type === 'list'">
            <v-select
              :model-value="value"
              variant="underlined"
              :label="header.name"
              :items="header.listItems"
              item-title="value"
              item-value="key"
              @update:model-value="
                (value: string) =>
                  emitTestHintUpdated({
                    customProps: modelValue.customProps.map((prop, i) => {
                      return { header: prop.header, value: i === index ? value : prop.value };
                    })
                  })
              "
            />
          </div>
        </div>

        <div>
          <v-textarea
            :model-value="modelValue.commentWords"
            variant="underlined"
            :label="$t('common.comment-words')"
            @update:model-value="(value: string) => emitTestHintUpdated({ commentWords: value })"
          />
        </div>

        <div>
          <element-container
            :model-value="modelValue.operatedElements"
            @update:model-value="(value) => emitTestHintUpdated({ operatedElements: value })"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { TestHintProp } from "@/lib/operationHistory/types";
import ElementContainer from "./ElementContainer.vue";
import TestHintIssueContainer from "./TestHintIssueContainer.vue";

export default defineComponent({
  components: {
    "element-container": ElementContainer,
    "test-hint-issue-container": TestHintIssueContainer
  },
  props: {
    modelValue: {
      type: Object as PropType<{
        testHintValue: string;
        testMatrixName: string;
        groupName: string;
        testTargetName: string;
        viewPointName: string;
        customProps: { header: TestHintProp; value: string }[];
        commentWords: string;
        operatedElements: { tagname: string; type: string; text: string }[];
        issues: string[];
      }>,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(props, context) {
    const emitTestHintUpdated = (
      newValue: Partial<{
        testHintValue: string;
        testMatrixName: string;
        groupName: string;
        testTargetName: string;
        viewPointName: string;
        customProps: { header: TestHintProp; value: string }[];
        commentWords: string;
        operatedElements: { tagname: string; type: string; text: string }[];
        issues: string[];
      }>
    ) => {
      context.emit("update:modelValue", { ...props.modelValue, ...newValue });
    };

    return {
      emitTestHintUpdated
    };
  }
});
</script>
