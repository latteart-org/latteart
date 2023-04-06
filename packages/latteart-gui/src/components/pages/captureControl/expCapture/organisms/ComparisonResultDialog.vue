<!--
 Copyright 2022 NTT Corporation.

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
      <span>{{ $store.getters.message("common.confirm") }}</span>
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
        $store.getters.message("history-view.compare-test-result-download")
      }}</span>
      <a :href="downloadLinkUrl" class="px-2" download>{{
        $store.getters.message("common.download-link")
      }}</a>

      <div v-if="diffs.length > 0">
        <v-divider class="mt-3 mb-2" />
        <v-data-table
          :headers="headers"
          :items="diffs"
          hide-actions
          class="hover-disabled"
        >
          <template v-slot:items="props">
            <td>
              {{ props.item.sequence }}
            </td>
            <td>
              {{ props.item.ngItemNames }}
            </td>
            <td>
              {{ props.item.remarks }}
            </td>
          </template>
        </v-data-table>
      </div>
    </template>
    <template v-slot:footer>
      <v-spacer></v-spacer>
      <v-btn color="blue" dark @click="$emit('close')">{{
        $store.getters.message("common.ok")
      }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import ScrollableDialog from "@/components/molecules/ScrollableDialog.vue";
import { TestResultComparisonResult } from "@/lib/operationHistory/types";
import { Component, Prop, Vue } from "vue-property-decorator";
@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
  },
})
export default class ComparisonResultDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({
    type: Object,
    default: () => {
      /* Do nothing */
    },
  })
  public readonly comparisonResult!: TestResultComparisonResult | null;
  private get headers() {
    return [
      {
        text: `${this.$store.getters.message(
          "history-view.compare-diffs-sequence"
        )}`,
        value: "sequence",
        sortable: false,
      },
      {
        text: `${this.$store.getters.message(
          "history-view.compare-diffs-items"
        )}`,
        value: "ngItemNames",
        sortable: false,
      },
      {
        text: `${this.$store.getters.message(
          "history-view.compare-diffs-remarks"
        )}`,
        value: "remarks",
        sortable: false,
      },
    ];
  }
  private get dialogMessages() {
    if (!this.comparisonResult) {
      return "";
    }

    const isSame = this.comparisonResult.summary.isOk;
    const diffCount = this.comparisonResult.summary.steps.filter(
      ({ isOk }) => !isOk
    ).length;

    return [
      this.$store.getters.message(
        "history-view.compare-test-result-completed",
        this.comparisonResult.targetNames
      ),
      isSame
        ? this.$store.getters.message(
            "history-view.compare-test-result-is-same"
          )
        : this.$store.getters.message(
            "history-view.compare-test-result-is-different",
            { diffCount }
          ),
    ];
  }

  private get downloadLinkUrl() {
    if (!this.comparisonResult) {
      return "";
    }
    return `${this.currentRepositoryUrl}/${this.comparisonResult.url}`;
  }

  private get diffs() {
    if (!this.comparisonResult) {
      return [];
    }

    const sequenceAndSteps = this.comparisonResult.summary.steps.map(
      (step, index) => {
        const ngItemNames = Object.entries(step.items)
          .filter(([_, value]) => !value.isOk)
          .flatMap(([name]) => {
            if (name === "title") {
              return [
                this.$store.getters.message(
                  "test-result-comparison-items.title"
                ),
              ];
            }
            if (name === "url") {
              return [
                this.$store.getters.message("test-result-comparison-items.url"),
              ];
            }
            if (name === "elementTexts") {
              return [
                this.$store.getters.message(
                  "test-result-comparison-items.elementTexts"
                ),
              ];
            }
            if (name === "screenshot") {
              return [
                this.$store.getters.message(
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
                this.$store.getters.message(
                  "history-view.compare-remarks-invalid-screenshot"
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
  }

  private get currentRepositoryUrl(): string {
    return this.$store.state.repositoryService.serviceUrl;
  }
}
</script>

<style lang="sass" scoped>
.hover-disabled ::v-deep
  tbody
    tr:hover
      background-color: transparent !important
</style>
