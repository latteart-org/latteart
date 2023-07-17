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
  <execute-dialog
    :opened="opened"
    :title="$store.getters.message('app.target-iframe')"
    @accept="onAcceptIframeSelector()"
    @cancel="$emit('close')"
  >
    {{ selectedItem }}
    <template>
      <v-select :items="items" v-model="selectedItem"> </v-select>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { CaptureControlState } from "@/store/captureControl";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
  },
})
export default class FrameSelectorDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private selectedItem: string | null = null;

  private get captureControlState(): CaptureControlState {
    return this.$store.state.captureControl;
  }

  private get isInIframe(): boolean {
    return this.captureControlState.currentFrame.locator !== "";
  }

  private get items(): { value: string; text: string }[] {
    const items = this.captureControlState.iframeElements.map(
      (element, index) => {
        return {
          text: element.attributes?.id ?? element.xpath,
          value: index.toString(),
        };
      }
    );
    return this.isInIframe
      ? [{ text: "default frame", value: "" }, ...items]
      : items;
  }

  private onAcceptIframeSelector(): void {
    if (this.selectedItem === null) {
      return;
    }
    (async () => {
      await this.$store.dispatch("captureControl/switchCapturingFrame", {
        iframeIndex: this.selectedItem,
        label:
          this.items.find((item) => this.selectedItem === item.value)?.text ??
          "",
      });

      this.$emit("close");
    })();
  }
}
</script>
