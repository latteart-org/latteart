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
  <v-layout justify-start align-center row>
    <v-icon class="pl-4 pr-1">input</v-icon>
    <v-text-field
      single-line
      :label="$store.getters.message('app.test-result-name')"
      v-model="testResultName"
      @change="changeCurrentTestResultName"
      :disabled="isDisabled"
      id="outputDirectoryTextField"
    ></v-text-field>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class TestResultNameTextField extends Vue {
  public get isDisabled(): boolean {
    return this.isCapturing || this.isResuming;
  }

  public get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  public get isResuming(): boolean {
    return this.$store.state.captureControl.isResuming;
  }

  public get testResultName(): string {
    return this.$store.state.operationHistory.testResultInfo.name;
  }

  public set testResultName(name: string) {
    this.$store.commit("operationHistory/setTestResultName", { name });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public changeCurrentTestResultName() {
    this.$store.dispatch("operationHistory/changeCurrentTestResult", {
      startTime: null,
      initialUrl: "",
    });
  }
}
</script>
