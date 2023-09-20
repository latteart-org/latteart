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
  <div>
    <v-btn
      :disabled="isDisabled"
      icon
      text
      large
      color="grey darken-3"
      @click="resetHistory"
      :title="$store.getters.message('app.reset')"
      class="mx-2"
    >
      <v-icon>add_circle_outline</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class ClearHistoryButton extends Vue {
  private get isDisabled(): boolean {
    return this.isCapturing || this.isReplaying || this.isResuming;
  }

  private get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  private get isReplaying(): boolean {
    return this.$store.state.captureControl.isReplaying;
  }

  private get isResuming(): boolean {
    return this.$store.state.captureControl.isResuming;
  }

  private resetHistory(): void {
    this.$store.dispatch("operationHistory/clearTestResult");
    this.$store.commit("operationHistory/clearStoringTestResultInfos");
    this.$store.commit("operationHistory/clearScreenTransitionDiagramGraph");
    this.$store.commit("operationHistory/clearElementCoverages");
    this.$store.commit("operationHistory/clearInputValueTable");
    this.$store.dispatch("captureControl/resetTimer");
  }
}
</script>
