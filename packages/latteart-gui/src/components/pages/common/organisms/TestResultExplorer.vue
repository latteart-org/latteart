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
  <v-navigation-drawer
    class="navigation-drawer"
    absolute
    temporary
    width="360"
    v-model="isTestResultExplorerOpened"
  >
    <template v-slot:prepend>
      <v-list-item>
        <v-list-item-title class="text-h6"> テスト結果一覧 </v-list-item-title>
      </v-list-item>
    </template>

    <test-result-list />

    <template v-slot:append>
      <div class="pa-2">
        <v-btn block>テスト結果の削除</v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { CaptureControlState } from "@/store/captureControl";
import { Component, Vue } from "vue-property-decorator";
import TestResultList from "./TestResultList.vue";

@Component({
  components: {
    "test-result-list": TestResultList,
  },
})
export default class TestResultExplorer extends Vue {
  private get isTestResultExplorerOpened() {
    return (this.$store.state.captureControl as CaptureControlState)
      .isTestResultExplorerOpened;
  }

  private set isTestResultExplorerOpened(isOpened: boolean) {
    this.$store.commit("captureControl/setTestResultExplorerOpened", {
      isOpened,
    });
  }
}
</script>

<style lang="sass" scoped>
.navigation-drawer ::v-deep .v-navigation-drawer__content
  overflow-y: hidden !important
</style>
