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
  <v-treeview
    :items="items"
    item-key="id"
    selectable
    open-on-click
    v-model="selectedTestResults"
    :open.sync="openedItemKeys"
    transition
  >
    <template v-slot:prepend="{ item, open }">
      <v-icon v-if="item.children">
        {{ open ? "folder_open" : "folder" }}
      </v-icon>
      <v-icon v-else> view_list </v-icon>
    </template>

    <template v-slot:label="{ item, leaf }">
      <v-menu rounded="lg" offset-x>
        <template v-slot:activator="{ on, attrs }">
          <span v-if="leaf" v-on="on" v-bind="attrs">{{ item.name }}</span>
          <span v-else> {{ item.name }} </span>
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
                <v-btn v-if="!isEditing" icon @click.stop="editTestResultName()"
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
                <v-list-item-title> URL </v-list-item-title>
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
          </v-list>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn text @click="menu = false">読込</v-btn>
            <v-btn text @click="menu = false">エクスポート</v-btn>
            <v-btn text @click="menu = false">スクリプト生成</v-btn>
            <v-btn text @click="menu = false">リプレイ</v-btn>
            <v-btn text @click="menu = false">比較</v-btn>
            <v-btn text @click="menu = false">スクリーンショット出力</v-btn>
            <v-btn text color="red" @click="menu = false">削除</v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </template>
  </v-treeview>
</template>

<script lang="ts">
import { formatTime } from "@/lib/common/Timestamp";
import { TestResultSummary } from "@/lib/operationHistory/types";
import { Component, Vue } from "vue-property-decorator";

type TestResultExplorerItem =
  | { id: string; name: string; children: TestResultExplorerItem[] }
  | TestResultSummary;

@Component
export default class TestResultExplorer extends Vue {
  private openedItemKeys: TestResultExplorerItem["id"][] = [];
  private selectedTestResults: TestResultSummary[] = [];

  private items: TestResultExplorerItem[] = [];

  private isEditing = false;

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

    this.items = [
      {
        id: "project_1",
        name: "プロジェクト",
        children,
      },
    ];
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

  private async fetchItems(parentItem: TestResultExplorerItem) {
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
}
</script>
