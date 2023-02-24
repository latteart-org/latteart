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
  <scrollable-dialog :opened="opened" :maxWidth="maxWidth">
    <template v-slot:title>{{ title }}</template>
    <template v-slot:content>
      <slot />
    </template>
    <template v-slot:footer>
      <v-spacer></v-spacer>
      <v-btn
        :disabled="disabled"
        :dark="!disabled"
        :color="strong ? 'red' : 'blue'"
        @click="accept()"
        >{{ $store.getters.message("common.ok") }}</v-btn
      >
      <v-btn color="white" @click="cancel()">{{
        $store.getters.message("common.cancel")
      }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ScrollableDialog from "@/components/molecules/ScrollableDialog.vue";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
  },
})
export default class ExecuteDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({ type: String, default: "" }) public readonly title!: string;
  @Prop({ type: Boolean, default: false })
  public readonly acceptButtonDisabled!: boolean;
  @Prop({ type: Boolean, default: false })
  public readonly strong!: boolean;
  @Prop({ type: Number, default: 500 }) public readonly maxWidth!: number;

  private isExecuted = false;

  private get disabled() {
    return this.acceptButtonDisabled || this.isExecuted;
  }

  @Watch("opened")
  private changeOpenedDialog(newValue: boolean) {
    if (newValue) {
      this.isExecuted = false;
    }
  }

  private accept(): void {
    this.isExecuted = true;
    this.$emit("accept");
  }

  private cancel(): void {
    this.$emit("cancel");
  }
}
</script>
