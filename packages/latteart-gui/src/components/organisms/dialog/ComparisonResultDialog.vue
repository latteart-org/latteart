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
  <scrollable-dialog :opened="opened" :maxWidth="1000">
    <template v-slot:title>
      <span>{{ store.getters.message("common.confirm") }}</span>
    </template>
    <template v-slot:content>
      <span
        class="pre-wrap break-word"
        v-for="(message, index) in dialogMessages"
        :key="index"
        >{{ message }}</span
      >
      <br />
      <span class="pre-wrap break-word">{{
        store.getters.message("test-result-page.compare-test-result-download")
      }}</span>
      <a :href="downloadLinkUrl" class="px-2" download>{{
        store.getters.message("common.download-link")
      }}</a>

      <div v-if="diffs.length > 0">
        <v-divider class="mt-3 mb-2" />
        <v-data-table
          :headers="headers"
          :items="diffs"
          :items-per-page="-1"
          hide-default-footer
          class="hover-disabled"
        >
          <template v-slot:item="props">
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
    <template v-slot:footer>
      <v-spacer></v-spacer>
      <v-btn color="blue" dark @click="$emit('close')">{{
        store.getters.message("common.ok")
      }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import ScrollableDialog from "@/components/molecules/ScrollableDialog.vue";
import { TestResultComparisonResult } from "@/lib/operationHistory/types";
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true },
    comparisonResult: {
      type: Object as PropType<TestResultComparisonResult | null>,
      default: () => {
        /* Do nothing */
      },
    },
  },
  components: {
    "scrollable-dialog": ScrollableDialog,
  },
  setup(props) {
    const store = useStore();

    const headers = computed(() => {
      return [
        {
          text: `${store.getters.message(
            "test-result-page.compare-diffs-sequence"
          )}`,
          value: "sequence",
          sortable: false,
        },
        {
          text: `${store.getters.message(
            "test-result-page.compare-diffs-items"
          )}`,
          value: "ngItemNames",
          sortable: false,
        },
        {
          text: `${store.getters.message(
            "test-result-page.compare-diffs-remarks"
          )}`,
          value: "remarks",
          sortable: false,
        },
      ];
    });

    const dialogMessages = computed(() => {
      if (!props.comparisonResult) {
        return "";
      }

      const isSame = props.comparisonResult.summary.isOk;
      const diffCount = props.comparisonResult.summary.steps.filter(
        ({ isOk }) => !isOk
      ).length;

      return [
        store.getters.message(
          "test-result-page.compare-test-result-completed",
          props.comparisonResult.targetNames
        ),
        isSame
          ? store.getters.message(
              "test-result-page.compare-test-result-is-same"
            )
          : store.getters.message(
              "test-result-page.compare-test-result-is-different",
              { diffCount }
            ),
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

      const sequenceAndSteps = props.comparisonResult.summary.steps.map(
        (step, index) => {
          const ngItemNames = Object.entries(step.items)
            .filter(([_, value]) => !value.isOk)
            .flatMap(([name]) => {
              if (name === "title") {
                return [
                  store.getters.message("test-result-comparison-items.title"),
                ];
              }
              if (name === "url") {
                return [
                  store.getters.message("test-result-comparison-items.url"),
                ];
              }
              if (name === "elementTexts") {
                return [
                  store.getters.message(
                    "test-result-comparison-items.elementTexts"
                  ),
                ];
              }
              if (name === "screenshot") {
                return [
                  store.getters.message(
                    "test-result-comparison-items.screenshot"
                  ),
                ];
              }
              return [];
            })
            .join(", ");

          const remarks = (
            step.errors?.flatMap((error) => {
              if (error === "invalid_screenshot") {
                return [
                  store.getters.message(
                    "test-result-page.compare-remarks-invalid-screenshot"
                  ),
                ];
              }
              if (error === "image_sizes_do_not_match") {
                return [
                  store.getters.message(
                    "test-result-page.compare-remarks-image-sizes-do-not-match"
                  ),
                ];
              }

              return [];
            }) ?? []
          ).join("\n");

          return { sequence: index + 1, isOk: step.isOk, ngItemNames, remarks };
        }
      );

      return sequenceAndSteps.filter(
        ({ isOk, ngItemNames }) => !isOk && ngItemNames !== ""
      );
    });

    const currentRepositoryUrl = computed((): string => {
      return store.state.repositoryService.serviceUrl;
    });

    return {
      store,
      headers,
      dialogMessages,
      downloadLinkUrl,
      diffs,
    };
  },
});
</script>

<style lang="sass" scoped>
.hover-disabled ::v-deep
  tbody
    tr:hover
      background-color: transparent !important
</style>
