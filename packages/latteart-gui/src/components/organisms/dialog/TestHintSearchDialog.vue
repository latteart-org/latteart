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
        <v-card flat>
          <v-card-text class="py-0">
            <v-row class="my-1 pb-2">
              <v-btn variant="elevated" @click="changeMatchingConditionsOpened">{{
                matchingConditionsOpened
                  ? $t("test-hint.search-dialog.hide")
                  : $t("test-hint.search-dialog.show")
              }}</v-btn>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card v-if="matchingConditionsOpened" flat height="100%">
          <v-card-text class="py-0 pl-0">
            <v-card>
              <v-card-text class="py-1">
                <v-row class="my-0">
                  <v-col class="pa-1">
                    <v-radio-group v-model="isMatchingEnabled" hide-details>
                      <v-radio
                        :label="$t('test-hint.search-dialog.display-all-test-hints')"
                        :value="false"
                      ></v-radio>
                      <v-radio
                        :label="$t('test-hint.search-dialog.display-matched-test-hints')"
                        :value="true"
                      ></v-radio>
                    </v-radio-group>
                    <v-card class="pl-8" flat :disabled="!isMatchingEnabled">
                      <v-card-text class="pt-3">
                        <v-row class="align-center py-0">
                          <v-checkbox
                            v-model="isFilteringByElementsEnabled"
                            density="compact"
                            :label="$t('test-hint.common.screen-elements')"
                            hide-details
                          ></v-checkbox>
                        </v-row>
                        <v-row class="align-center py-0">
                          <v-checkbox
                            v-model="isFilteringByCommentsEnabled"
                            :label="$t('test-hint.search-dialog.comment-words')"
                            class="mr-4"
                            hide-details
                            density="compact"
                          ></v-checkbox>
                          <v-text-field
                            v-model="search"
                            density="compact"
                            hide-details
                            :disabled="!isFilteringByCommentsEnabled"
                            @update:model-value="filterTestHints"
                          />
                        </v-row>
                        <v-row class="align-center py-0">
                          <v-list-subheader class="pt-2 pr-3">{{
                            $t("test-hint.search-dialog.matching-scope")
                          }}</v-list-subheader>
                          <v-text-field
                            v-model="defaultSearchSeconds"
                            density="compact"
                            variant="underlined"
                            hide-details
                            type="number"
                            min="0"
                            :disabled="
                              !isFilteringByElementsEnabled && !isFilteringByCommentsEnabled
                            "
                            style="max-width: 150px"
                            :suffix="$t('config-page.test-hint.suffix')"
                            @update:model-value="
                              setSearchText();
                              filterTestHints();
                            "
                            @change="(e: any) => updateDefaultSearchSeconds(e.target._value)"
                          />
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            <v-card class="pl-1">
              <v-card-text class="pt-3">
                <v-row class="align-center py-0">
                  <v-checkbox
                    v-model="isFilteringByStoryEnabled"
                    density="comfortable"
                    :label="$t('test-hint.search-dialog.story-filter')"
                    hide-details
                    :disabled="currentStoryInfo ? false : true"
                  ></v-checkbox>
                </v-row>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-container>

      <v-divider />

      <test-hint-list
        :test-hint-props="testHintProps"
        :test-hints="filteredTestHints.length > 0 ? filteredTestHints : testHints"
        selectable
        :checked-test-hint-ids="checkedTestHintIds"
        :test-hint-match-counts="testHintMatchCounts"
        paging-disabled
        show-match-counts
        @change:test-hints-selection="changeSelectedTestHintIds"
      >
        <template #actions>
          <span class="text-subtitle-1 font-weight-bold">{{
            `${$t("test-hint.search-dialog.matching-result")} (${filteredTestHints.length}/${testHints.length})`
          }}</span>

          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-icon v-bind="props" class="icon-info mt-n1 pl-2">info</v-icon>
            </template>
            <span>{{ $t("test-hint.search-dialog.information") }}</span>
          </v-tooltip>

          <p v-if="filteredTestHints.length === 0" style="color: red">
            {{ $t("test-hint.search-dialog.no-test-hint-matched") }}
          </p>
        </template>
      </test-hint-list>
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
import { useTestManagementStore } from "@/stores/testManagement";
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
    const testManagementStore = useTestManagementStore();

    const matchingConditionsOpened = ref(false);
    const defaultSearchSeconds = ref(30);
    const isMatchingEnabled = ref(true);
    const isFilteringByStoryEnabled = ref(false);
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

    const testHintSetting = computed(() => {
      return rootStore.viewSettings.testHint;
    });

    const currentStoryInfo = computed(() => {
      return testManagementStore.getCurrentStoryInfo(operationHistoryStore.testResultInfo.id);
    });

    const borderTimeStampByLastTestStep = computed((): number => {
      return (
        Number(history.value[history.value.length - 1].operation.timestamp) -
        defaultSearchSeconds.value * 1000
      );
    });

    const initialize = async () => {
      if (!props.opened || !rootStore.dataLoader) {
        return;
      }

      const testHintPropsAndData = await rootStore.dataLoader.loadTestHints();

      testHintProps.value = testHintPropsAndData.props;
      testHints.value = testHintPropsAndData.data;

      matchingConditionsOpened.value = false;
      isFilteringByStoryEnabled.value = false;
      isFilteringByElementsEnabled.value = true;
      isFilteringByCommentsEnabled.value = true;

      defaultSearchSeconds.value = testHintSetting.value.defaultSearchSeconds;

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
        (comment) =>
          Number(history.value[history.value.length - 1].operation.timestamp) > comment.timestamp &&
          comment.timestamp > borderTimeStampByLastTestStep.value
      );

      if (filteredComments.length > 0) {
        const excludedWords = testHintSetting.value.commentMatching.excludedWords;

        const commentParts = Array.from(
          new Set(filteredComments.flatMap((comment) => comment.value.split(/\s/)))
        );

        const targetComments = commentParts.filter((part) => !excludedWords.includes(part));

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
      const result = (() => {
        const tempTestHints = isFilteringByStoryEnabled.value
          ? testHints.value.filter(
              (testHint) =>
                testHint.testMatrixName === currentStoryInfo.value?.testMatrixName &&
                testHint.groupName === currentStoryInfo.value?.groupName &&
                testHint.testTargetName === currentStoryInfo.value?.testTargetName &&
                testHint.viewPointName === currentStoryInfo.value?.viewPointName
            )
          : testHints.value;

        if (!isMatchingEnabled.value) {
          return { testHints: tempTestHints, testHintMatchCounts: [] };
        }

        const matchingCondition = {
          comments:
            isFilteringByCommentsEnabled.value && search.value ? search.value.split(/\s/) : [],
          elements: isFilteringByElementsEnabled.value ? collectRecentOperatedElements() : [],
          currentStoryInfo: isFilteringByStoryEnabled.value ? currentStoryInfo.value : undefined
        };

        return selectMatchedTestHints(tempTestHints, matchingCondition);
      })();

      filteredTestHints.value = result.testHints;
      testHintMatchCounts.value = result.testHintMatchCounts;
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
    watch(isMatchingEnabled, filterTestHints);
    watch(isFilteringByCommentsEnabled, filterTestHints);
    watch(isFilteringByElementsEnabled, filterTestHints);
    watch(isFilteringByStoryEnabled, filterTestHints);

    return {
      matchingConditionsOpened,
      defaultSearchSeconds,
      isMatchingEnabled,
      isFilteringByStoryEnabled,
      isFilteringByElementsEnabled,
      isFilteringByCommentsEnabled,
      search,
      testHintProps,
      testHints,
      filteredTestHints,
      testHintMatchCounts,
      checkedTestHintIds,
      currentStoryInfo,
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
