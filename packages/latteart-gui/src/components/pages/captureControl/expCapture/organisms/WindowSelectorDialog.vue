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
  <execute-dialog
    :opened="opened"
    :title="$store.getters.message('app.target-tab-window')"
    @accept="onAcceptWindowSelector()"
    @cancel="onCancelWindowSelector()"
  >
    <template>
      <v-select
        :items="capturingWindowInfo.availableWindows"
        v-model="capturingWindowInfo.currentWindowHandle"
      >
      </v-select>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { WindowInfo } from "@/lib/operationHistory/types";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { CaptureControlState } from "@/store/captureControl";
import { OperationHistoryState } from "@/store/operationHistory";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
  },
})
export default class WindowSelectorDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private capturingWindowInfo: {
    currentWindowHandle: string;
    availableWindows: WindowInfo[];
  } = {
    currentWindowHandle: "",
    availableWindows: [],
  };

  @Watch("opened")
  private openWindowSelector(): void {
    const captureControlState = this.$store.state
      .captureControl as CaptureControlState;
    const operationHistoryState = this.$store.state
      .operationHistory as OperationHistoryState;

    const availableWindows = operationHistoryState.windows.filter((window) => {
      return captureControlState.captureSession?.windowHandles.includes(
        window.value
      );
    });

    if (this.opened && captureControlState.captureSession) {
      this.$store.dispatch("captureControl/selectCapturingWindow");
      this.capturingWindowInfo.currentWindowHandle =
        captureControlState.captureSession.currentWindowHandle;
      this.capturingWindowInfo.availableWindows.splice(
        0,
        this.capturingWindowInfo.availableWindows.length,
        ...availableWindows
      );
    }
  }

  private onAcceptWindowSelector(): void {
    (async () => {
      await this.$store.dispatch("captureControl/switchCapturingWindow", {
        to: this.capturingWindowInfo.currentWindowHandle,
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
