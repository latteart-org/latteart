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
  <scrollable-dialog :opened="opened" :max-width="1000">
    <template #title>
      <span>{{ $t("common.confirm") }}</span>
    </template>
    <template #content>
      <span v-for="(message, index) in dialogMessages" :key="index" class="pre-wrap break-word">{{
        message
      }}</span>
      <br />
      <span class="pre-wrap break-word">{{
        $t("comparison-result-dialog.compare-test-result-download")
      }}</span>
      <a :href="downloadLinkUrl" class="px-2" download>{{ $t("common.download-link") }}</a>

      <div v-if="diffs.length > 0">
        <v-divider class="mt-3 mb-2" />
        <v-data-table
          :headers="headers"
          :items="diffs"
          :items-per-page="-1"
          hide-default-footer
          class="hover-disabled"
        >
          <template #item="props">
            <tr>
              <td>
                {{ props.item.sequence }}
              </td>
              <td>
                {{ props.item.ngItemNames }}
              </td>
              <td>
                {{ props.item.remarks }}
              </td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </template>
    <template #footer>
      <v-spacer></v-spacer>
      <v-btn color="blue" variant="elevated" @click="$emit('close')">{{ $t("common.ok") }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import ScrollableDialog from "@/components/molecules/ScrollableDialog.vue";
import { type TestResultComparisonResult } from "@/lib/operationHistory/types";
import { useRootStore } from "@/stores/root";
import { computed, defineComponent } from "vue";
import type { PropType } from "vue";

export default defineComponent({
  components: {
    "scrollable-dialog": ScrollableDialog
  },
  props: {
    opened: { type: Boolean, default: false, required: true },
    comparisonResult: {
      type: Object as PropType<TestResultComparisonResult | null>,
      default: () => {
        /* Do nothing */
      }
    }
  },
  emits: ["close"],
  setup(props) {
    const rootStore = useRootStore();

    const headers = computed(() => {
      return [
        {
          title: `${rootStore.message("comparison-result-dialog.compare-diffs-sequence")}`,
          value: "sequence",
          sortable: false
        },
        {
          title: `${rootStore.message("comparison-result-dialog.compare-diffs-items")}`,
          value: "ngItemNames",
          sortable: false
        },
        {
          title: `${rootStore.message("comparison-result-dialog.compare-diffs-remarks")}`,
          value: "remarks",
          sortable: false
        }
      ];
    });

    const dialogMessages = computed(() => {
      if (!props.comparisonResult) {
        return "";
      }

      const isSame = props.comparisonResult.summary.isOk;
      const diffCount = props.comparisonResult.summary.steps.filter(({ isOk }) => !isOk).length;

      return [
        rootStore.message(
          "comparison-result-dialog.compare-test-result-completed",
          props.comparisonResult.targetNames
        ),
        isSame
          ? rootStore.message("comparison-result-dialog.compare-test-result-is-same")
          : rootStore.message("comparison-result-dialog.compare-test-result-is-different", {
              diffCount: diffCount.toString()
            })
      ];
    });

    const downloadLinkUrl = computed(() => {
      if (!props.comparisonResult) {
        return "";
      }
      return `${currentRepositoryUrl.value}/${props.comparisonResult.url}`;
    });

    const diffs = computed(() => {
      if (!props.comparisonResult) {
        return [];
      }

      const sequenceAndSteps = props.comparisonResult.summary.steps.map((step) => {
        const ngItemNames = Object.entries(step.items)
          .filter(([_, value]) => !value.isOk)
          .flatMap(([name]) => {
            if (name === "title") {
              return [rootStore.message("common.page-title")];
            }
            if (name === "url") {
              return [rootStore.message("common.page-url")];
            }
            if (name === "elementTexts") {
              return [rootStore.message("common.element-texts")];
            }
            if (name === "screenshot") {
              return [rootStore.message("common.screenshot")];
            }
            return [];
          })
          .join(", ");

        const remarks = (
          step.errors?.flatMap((error) => {
            if (error === "invalid_screenshot") {
              return [rootStore.message("error.operation_history.invalid_screenshot")];
            }
            if (error === "image_sizes_do_not_match") {
              return [rootStore.message("error.operation_history.image_sizes_do_not_match")];
            }

            return [];
          }) ?? []
        ).join("\n");

        return { sequence: step.sequence, isOk: step.isOk, ngItemNames, remarks };
      });

      return sequenceAndSteps.filter(({ isOk, ngItemNames }) => !isOk && ngItemNames !== "");
    });

    const currentRepositoryUrl = computed((): string => {
      return rootStore.repositoryService?.serviceUrl ?? "";
    });

    return {
      headers,
      dialogMessages,
      downloadLinkUrl,
      diffs
    };
  }
});
</script>

<style lang="sass" scoped>
:deep(.hover-disabled)
  tbody
    tr:hover
      background-color: transparent !important
</style>
