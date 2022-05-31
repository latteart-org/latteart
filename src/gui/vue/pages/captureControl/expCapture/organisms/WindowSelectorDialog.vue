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
  <scrollable-dialog :opened="opened">
    <template v-slot:title>{{
      $store.getters.message("app.target-tab-window")
    }}</template>
    <template v-slot:content>
      <v-select
        :items="capturingWindowInfo.availableWindows"
        v-model="capturingWindowInfo.currentWindow"
      >
      </v-select>
    </template>
    <template v-slot:footer>
      <v-spacer></v-spacer>
      <v-btn @click="onAcceptWindowSelector()">{{
        $store.getters.message("common.ok")
      }}</v-btn>
      <v-btn @click="onCancelWindowSelector()">{{
        $store.getters.message("common.cancel")
      }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { WindowHandle } from "@/lib/operationHistory/types";
import ScrollableDialog from "@/vue/molecules/ScrollableDialog.vue";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
  },
})
export default class WindowSelectorDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private capturingWindowInfo: {
    currentWindow: string;
    availableWindows: WindowHandle[];
  } = {
    currentWindow: "",
    availableWindows: [],
  };

  @Watch("opened")
  private openWindowSelector(): void {
    if (this.opened) {
      this.$store.dispatch("captureControl/selectCapturingWindow");
      this.capturingWindowInfo.currentWindow =
        this.$store.state.captureControl.capturingWindowInfo.currentWindow;
      this.capturingWindowInfo.availableWindows.splice(
        0,
        this.capturingWindowInfo.availableWindows.length,
        ...this.$store.state.captureControl.capturingWindowInfo.availableWindows
      );
    }
  }

  private onAcceptWindowSelector(): void {
    (async () => {
      await this.$store.dispatch("captureControl/switchCapturingWindow", {
        to: this.capturingWindowInfo.currentWindow,
      });

      this.$emit("close");
    })();
  }

  private onCancelWindowSelector(): void {
    (async () => {
      await this.$store.dispatch("captureControl/switchCancel");

      this.$emit("close");
    })();
  }
}
</script>
