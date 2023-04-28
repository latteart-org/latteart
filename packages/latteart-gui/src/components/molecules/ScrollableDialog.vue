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
  <v-dialog
    scrollable
    persistent
    max-height="800"
    :max-width="maxWidth"
    v-model="openedDialog"
    :transition="noTransition ? false : 'dialog-transition'"
    :fullscreen="fullscreen"
    @keydown="cancelKeydown"
  >
    <v-card>
      <v-card-title class="headline" primary-title>
        <slot name="title"></slot>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text :style="{ height: 'calc(100% - 48px - 48px)' }">
        <div>
          <slot name="content"></slot>
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <slot name="footer"></slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class ScrollableDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({ type: Boolean, default: false }) public readonly fullscreen!: boolean;
  @Prop({ type: Boolean, default: false })
  public readonly noTransition!: boolean;
  @Prop({ type: String, default: "" }) public readonly title!: string;
  @Prop({ type: String, default: "" }) public readonly content!: string;
  @Prop({ type: String, default: "" }) public readonly footer!: string;
  @Prop({ type: Number, default: 500 }) public readonly maxWidth!: number;

  private openedDialog = false;

  @Watch("opened")
  private changeOpenedDialog(newValue: boolean) {
    setTimeout(() => {
      this.openedDialog = newValue;
    }, 100);
  }

  private cancelKeydown(event: Event) {
    event.stopPropagation();
  }
}
</script>
