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
  <v-card flat height="100%">
    <v-card-title class="pt-0">
      <v-text-field
        v-model="search"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>

    <v-data-table
      v-model="selectedTestResults"
      :headers="headers"
      :items="items"
      item-key="id"
      :show-select="showSelect"
      hide-default-footer
      :items-per-page="-1"
      :search="search"
      height="calc(100% - 64px)"
      :style="{ height: '100%', width: '100%' }"
      fixed-header
    >
      <template v-slot:[`item.name`]="{ item }">
        <td
          :class="{ ellipsis: true }"
          :style="{ 'max-width': 0 }"
          @click="loadHistory(item.id)"
          v-ripple
        >
          <v-menu rounded="lg" offset-x open-on-hover>
            <template v-slot:activator="{ on, attrs }">
              <div
                v-on="on"
                v-bind="attrs"
                :style="{
                  height: '100%',
                  display: 'flex',
                  'align-items': 'center',
                }"
              >
                <div
                  :class="{ ellipsis: true }"
                  :style="{ 'max-width': '100%' }"
                >
                  {{ item.name }}
                </div>
              </div>
            </template>

            <v-card>
              <v-list>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title v-if="!isEditing">{{
                      item.name
                    }}</v-list-item-title>
                    <v-list-item-title v-else
                      ><v-text-field v-model="item.name" @click.stop
                    /></v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action v-if="showSelect">
                    <v-btn
                      v-if="!isEditing"
                      icon
                      @click.stop="editTestResultName(item.id, item.name)"
                      ><v-icon>edit</v-icon></v-btn
                    >
                    <v-btn
                      v-else
                      icon
                      @click.stop="editTestResultName(item.id, item.name)"
                      ><v-icon color="red">edit</v-icon></v-btn
                    >
                  </v-list-item-action>
                </v-list-item>
              </v-list>

              <v-divider></v-divider>

              <v-list>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>{{
                      $store.getters.message("test-result-list.url")
                    }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ item.initialUrl }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>{{
                      $store.getters.message("test-result-list.testing-time")
                    }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ millisecondsToHHmmss(item.testingTime) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item v-if="hasTestPurpose(item.testPurposes)">
                  <v-list-item-content>
                    <v-list-item-title>{{
                      $store.getters.message("test-result-list.test-purpose")
                    }}</v-list-item-title>
                    <v-list-item-subtitle
                      v-for="(testPurpose, i) in item.testPurposes"
                      :key="i"
                    >
                      {{ "・" + testPurpose.value }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item v-if="item.creationTimestamp > 0">
                  <v-list-item-content>
                    <v-list-item-title>{{
                      $store.getters.message(
                        "test-result-list.creation-timestamp"
                      )
                    }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ millisecondsToDateFormat(item.creationTimestamp) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>

              <v-divider></v-divider>

              <v-card-actions v-if="actions">
                <slot name="item-actions" v-bind:item="item"></slot>
              </v-card-actions>
            </v-card>
          </v-menu>
        </td>
      </template>
    </v-data-table>

    <error-message-dialog
      :opened="errorDialogOpened"
      :message="errorDialogMessage"
      @close="errorDialogOpened = false"
    />
  </v-card>
</template>

<script lang="ts">
import { formatDateTime, formatTime } from "@/lib/common/Timestamp";
import { TestResultSummary } from "@/lib/operationHistory/types";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ErrorMessageDialog from "../ErrorMessageDialog.vue";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class TestResultList extends Vue {
  @Prop({ type: Boolean, default: false }) actions!: boolean;
  @Prop({ type: Boolean, default: false }) showSelect!: boolean;
  @Prop({ type: Boolean, default: false }) opened!: boolean;
  @Prop({ type: Array, default: [] }) items!: TestResultSummary[];

  private selectedTestResults: TestResultSummary[] = [];
  private search = "";
  private isEditing = false;
  private beforTestResultName = "";

  private errorDialogOpened = false;
  private errorDialogMessage = "";

  private get headers() {
    return [
      {
        text: this.$store.getters.message("test-result-list.name"),
        value: "name",
      },
    ];
  }

  @Watch("opened")
  private async initialize() {
    if (!this.opened) {
      this.selectedTestResults = [];
    }
  }

  @Watch("selectedTestResults")
  private updateCheckedTestResults(): void {
    const checkedTestResults = this.selectedTestResults.map(({ id }) => id);
    this.$store.commit("operationHistory/setCheckedTestResults", {
      checkedTestResults,
    });
  }

  private hasTestPurpose(testPurposes: { value: string }[]) {
    if (!testPurposes) {
      return false;
    }
    return testPurposes.length > 0;
  }

  private async editTestResultName(
    testResultId: string,
    testResultName: string
  ) {
    if (this.isEditing) {
      if (this.beforTestResultName !== testResultName) {
        await this.$store.dispatch("operationHistory/changeTestResultName", {
          testResultId,
          testResultName,
        });
      }
      this.isEditing = false;
    } else {
      this.beforTestResultName = testResultName;
      this.isEditing = true;
    }
  }

  private millisecondsToHHmmss(millisecondsTime: number) {
    return formatTime(millisecondsTime);
  }

  private millisecondsToDateFormat(millisecondsTime: number) {
    return formatDateTime(millisecondsTime);
  }

  private async loadHistory(testResultId: string) {
    if (this.actions) {
      return;
    }

    if (!testResultId) {
      return;
    }

    setTimeout(async () => {
      try {
        this.$store.commit("captureControl/setTestResultExplorerOpened", {
          isOpened: false,
        });

        this.$store.dispatch("openProgressDialog", {
          message: this.$store.getters.message("remote-access.load"),
        });

        await this.loadTestResults(testResultId);
      } catch (error) {
        if (error instanceof Error) {
          this.errorDialogMessage = error.message;
          this.errorDialogOpened = true;
        } else {
          throw error;
        }
      } finally {
        this.$store.dispatch("closeProgressDialog");
      }
    }, 300);
  }

  private async loadTestResults(...testResultIds: string[]) {
    try {
      await this.$store.dispatch("operationHistory/loadTestResultSummaries", {
        testResultIds,
      });

      await this.$store.dispatch("operationHistory/loadTestResult", {
        testResultId: testResultIds[0],
      });

      this.$store.commit("operationHistory/setCanUpdateModels", {
        setCanUpdateModels: false,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        this.errorDialogOpened = true;
        this.errorDialogMessage = error.message;
      } else {
        throw error;
      }
    }
  }
}
</script>

<style lang="sass" scoped>

.ellipsis
  overflow: hidden
  white-space: nowrap
  text-overflow: ellipsis
</style>
