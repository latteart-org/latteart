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
  <scrollable-dialog :opened="opened" :max-width="2000">
    <template #title>
      <span>{{ $t("test-hint.search-dialog.title") }}</span>
    </template>

    <template #content>
      <v-container fluid class="pa-0">
        <v-card flat height="100%">
          <v-card-text class="py-0">
            <v-row class="my-1 pb-2">
              <v-btn variant="elevated" @click="changeMatchingConditionsOpened">{{
                matchingConditionsOpened
                  ? $t("test-hint.search-dialog.show")
                  : $t("test-hint.search-dialog.hide")
              }}</v-btn>
            </v-row>
            <v-row v-if="matchingConditionsOpened" class="pb-4 my-0">
              <v-col>
                <v-row class="align-center py-0">
                  <v-checkbox
                    v-model="isFilteringByElementsEnabled"
                    density="comfortable"
                    :label="$t('test-hint.common.screen-elements')"
                    hide-details
                  ></v-checkbox>
                </v-row>
                <v-row class="align-center py-0">
                  <v-checkbox
                    v-model="isFilteringByCommentsEnabled"
                    :label="$t('test-hint.common.comment-words')"
                    class="mr-4"
                    hide-details
                    density="comfortable"
                  ></v-checkbox>
                  <v-text-field
                    v-model="search"
                    density="comfortable"
                    hide-details
                    :disabled="!isFilteringByCommentsEnabled"
                    @update:model-value="filterTestHints"
                  />
                </v-row>
                <v-row class="align-center ml-n1 mr-0 py-0">
                  <v-list-subheader class="pt-4 pr-3">{{
                    $t("test-hint.search-dialog.matching-scope")
                  }}</v-list-subheader>
                  <v-text-field
                    v-model="defaultSearchSeconds"
                    variant="underlined"
                    hide-details
                    type="number"
                    min="0"
                    :disabled="!isFilteringByElementsEnabled && !isFilteringByCommentsEnabled"
                    style="max-width: 150px"
                    :suffix="$t('config-page.test-hint.suffix')"
                    @update:model-value="
                      setSearchText();
                      filterTestHints();
                    "
                    @change="(e: any) => updateDefaultSearchSeconds(e.target._value)"
                  />
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-container>

      <v-divider />

      <test-hint-list
        :test-hint-props="testHintProps"
        :test-hints="filteredTestHints"
        :selectable="true"
        :checked-test-hint-ids="checkedTestHintIds"
        :test-hint-match-counts="testHintMatchCounts"
        @change:test-hints-selection="changeSelectedTestHintIds"
      >
        <template #actions>
          <span class="text-subtitle-1 font-weight-bold">{{
            `${$t("test-hint.search-dialog.matching-result")} (${filteredTestHints.length}/${testHints.length})`
          }}</span>
        </template></test-hint-list
      >
    </template>
    <template #footer>
      <v-spacer></v-spacer>
      <v-btn color="blue" variant="elevated" @click="$emit('close')">{{ $t("common.ok") }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import { type TestHint, type TestHintProp, type Comment } from "@/lib/operationHistory/types";
import ScrollableDialog from "@/components/molecules/ScrollableDialog.vue";
import TestHintList from "@/components/organisms/common/TestHintList.vue";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import { useRootStore } from "@/stores/root";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useCaptureControlStore } from "@/stores/captureControl";
import { selectMatchedTestHints } from "@/lib/operationHistory/testHint";

export default defineComponent({
  components: {
    "scrollable-dialog": ScrollableDialog,
    "test-hint-list": TestHintList
  },
  props: {
    opened: { type: Boolean, default: false }
  },
  emits: ["close"],
  setup(props, context) {
    const rootStore = useRootStore();
    const operationHistoryStore = useOperationHistoryStore();
    const captureControlStore = useCaptureControlStore();

    const matchingConditionsOpened = ref(false);
    const defaultSearchSeconds = ref(30);
    const isFilteringByElementsEnabled = ref(true);
    const isFilteringByCommentsEnabled = ref(true);
    const search = ref("");
    const testHintProps = ref<TestHintProp[]>([]);
    const testHints = ref<TestHint[]>([]);
    const filteredTestHints = ref<TestHint[]>([]);
    const testHintMatchCounts = ref<{ id: string; matchCount: number }[]>([]);

    const checkedTestHintIds = computed(() => {
      return captureControlStore.checkedTestHintIds;
    });

    const history = computed(() => {
      return operationHistoryStore.history;
    });

    const comments = computed((): Comment[] => {
      return operationHistoryStore.comments;
    });

    const borderTimestampByLastComment = computed((): number => {
      return (
        comments.value[comments.value.length - 1].timestamp - defaultSearchSeconds.value * 1000
      );
    });

    const borderTimeStampByLastTestStep = computed((): number => {
      return (
        Number(history.value[history.value.length - 1].operation.timestamp) -
        defaultSearchSeconds.value * 1000
      );
    });

    const testHintCommentWords = computed(() => {
      const commentWords = testHints.value.flatMap(({ commentWords }) => commentWords);
      return Array.from(new Set(commentWords));
    });

    const initialize = async () => {
      if (!props.opened || !rootStore.dataLoader) {
        return;
      }

      const testHintPropsAndData = await rootStore.dataLoader.loadTestHints();

      testHintProps.value = testHintPropsAndData.props;
      testHints.value = testHintPropsAndData.data;

      defaultSearchSeconds.value = rootStore.viewSettings.testHint.defaultSearchSeconds;

      setSearchText();
      filterTestHints();
    };

    const updateDefaultSearchSeconds = (seconds: number) => {
      defaultSearchSeconds.value = seconds < 0 ? 0 : seconds;
    };

    const setSearchText = () => {
      if (comments.value.length === 0) {
        return;
      }
      const filteredComments = comments.value.filter(
        (comment) => comment.timestamp > borderTimestampByLastComment.value
      );
      if (testHintCommentWords.value.length > 0) {
        const commentParts = Array.from(
          new Set(filteredComments.flatMap((comment) => comment.value.split(/\s/)))
        );

        const targetComments = commentParts.filter((part) =>
          testHintCommentWords.value.includes(part)
        );

        search.value = targetComments.length > 0 ? targetComments.join(" ") : "";
      } else {
        search.value = "";
      }
    };

    const collectRecentOperatedElements = () => {
      return history.value
        .filter(
          (step) =>
            Number(step.operation.timestamp) > borderTimeStampByLastTestStep.value &&
            step.coverageSource !== undefined
        )
        .map((step) => {
          return step.coverageSource?.screenElements.map((element) => {
            return {
              tagname: element.tagname ?? "",
              type: element.attributes?.type ?? "",
              text: element.text ?? ""
            };
          });
        })
        .flat() as { tagname: string; type: string; text: string }[];
    };

    const filterTestHints = () => {
      const matchingCondition = {
        comments:
          isFilteringByCommentsEnabled.value && search.value ? search.value.split(/\s/) : [],
        elements: isFilteringByElementsEnabled.value ? collectRecentOperatedElements() : []
      };

      const data = selectMatchedTestHints(testHints.value, matchingCondition);

      filteredTestHints.value = data.testHints;
      testHintMatchCounts.value = data.testHintMatchCounts;
    };

    const changeSelectedTestHintIds = (selectedTestHintIds: string[]) => {
      captureControlStore.checkedTestHintIds = selectedTestHintIds;
    };

    const changeMatchingConditionsOpened = () => {
      matchingConditionsOpened.value = matchingConditionsOpened.value ? false : true;
    };

    const close = () => {
      context.emit("close");
    };

    const { opened } = toRefs(props);
    watch(opened, initialize);
    watch(isFilteringByCommentsEnabled, filterTestHints);
    watch(isFilteringByElementsEnabled, filterTestHints);

    return {
      matchingConditionsOpened,
      defaultSearchSeconds,
      isFilteringByElementsEnabled,
      isFilteringByCommentsEnabled,
      search,
      testHintProps,
      testHints,
      filteredTestHints,
      testHintMatchCounts,
      checkedTestHintIds,
      updateDefaultSearchSeconds,
      setSearchText,
      filterTestHints,
      changeSelectedTestHintIds,
      changeMatchingConditionsOpened,
      close
    };
  }
});
</script>

<style lang="sass" scoped>
:deep(.v-messages)
  display: none

:deep(.v-text-field__details)
  display: none
</style>
