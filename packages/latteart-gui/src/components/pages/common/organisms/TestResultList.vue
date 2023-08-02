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
      :headers="headers"
      :items="items"
      item-key="id"
      show-select
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
                      ><v-text-field :value="item.name" @click.stop
                    /></v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn
                      v-if="!isEditing"
                      icon
                      @click.stop="editTestResultName()"
                      ><v-icon>edit</v-icon></v-btn
                    >
                    <v-btn v-else icon @click.stop="editTestResultName()"
                      ><v-icon color="red">edit</v-icon></v-btn
                    >
                  </v-list-item-action>
                </v-list-item>
              </v-list>

              <v-divider></v-divider>

              <v-list>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title> テスト対象URL </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ item.initialUrl }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title> テスト時間 </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ millisecondsToHHmmss(item.testingTime) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item v-if="hasTestPurpose(item.testPurposes)">
                  <v-list-item-content>
                    <v-list-item-title> テスト目的 </v-list-item-title>
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
                    <v-list-item-title> 作成日時 </v-list-item-title>
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
import { formatTime, TimestampImpl } from "@/lib/common/Timestamp";
import { TestResultSummary } from "@/lib/operationHistory/types";
import { Component, Prop, Vue } from "vue-property-decorator";
import ErrorMessageDialog from "../ErrorMessageDialog.vue";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class TestResultList extends Vue {
  @Prop({ type: Boolean, default: false }) actions!: boolean;

  private openedItemKeys: TestResultSummary["id"][] = [];
  private selectedTestResults: TestResultSummary[] = [];

  private headers = [{ text: "テスト結果名", value: "name" }];
  private items: TestResultSummary[] = [];
  private search = "";

  private isEditing = false;

  private errorDialogOpened = false;
  private errorDialogMessage = "";

  private async mounted() {
    const testResults: TestResultSummary[] = await this.$store
      .dispatch("operationHistory/getTestResults")
      .catch(() => []);

    const children = testResults.map((testResult) => {
      return {
        ...testResult,
        testPurposes: testResult.testPurposes.slice(0, 5),
      };
    });

    this.items = children;
  }

  private hasTestPurpose(testPurposes: { value: string }[]) {
    if (!testPurposes) {
      return false;
    }
    return testPurposes.length > 0;
  }

  private editTestResultName() {
    if (this.isEditing) {
      this.isEditing = false;
    } else {
      this.isEditing = true;
    }
  }

  private millisecondsToHHmmss(millisecondsTime: number) {
    return formatTime(millisecondsTime);
  }

  private millisecondsToDateFormat(millisecondsTime: number) {
    return new TimestampImpl(millisecondsTime).format("YYYY/MM/DD HH:mm:ss");
  }

  private async fetchItems(parentItem: TestResultSummary) {
    if (!("children" in parentItem)) {
      return;
    }

    const fetchedTestResults: TestResultSummary[] = await this.$store
      .dispatch("operationHistory/getTestResults")
      .catch(() => []);

    if (fetchedTestResults.length === 0) {
      return;
    }

    parentItem.children = [...fetchedTestResults];
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
