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
      $store.getters.message("auto-operation-select-dialog.title")
    }}</template>
    <template v-slot:content>
      <div class="pre-wrap break-word">
        {{ $store.getters.message("auto-operation-select-dialog.message") }}
      </div>
      <v-select
        :label="$store.getters.message('auto-operation-select-dialog.name')"
        :items="selectList"
        item-text="settingName"
        item-value="value"
        @change="selectGroup"
      ></v-select>
      <v-textarea
        :label="$store.getters.message('auto-operation-select-dialog.details')"
        readonly
        no-resize
        v-model="selectedDetails"
      ></v-textarea>
    </template>
    <template v-slot:footer>
      <v-spacer></v-spacer>
      <v-btn
        :disabled="okButtonIsDisabled"
        :dark="!okButtonIsDisabled"
        color="red"
        @click="
          ok();
          close();
        "
        >{{ $store.getters.message("common.ok") }}</v-btn
      >
      <v-btn color="white" @click="close()">{{
        $store.getters.message("common.cancel")
      }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ScrollableDialog from "@/vue/molecules/ScrollableDialog.vue";
import { AutoOperationConditionGroup } from "@/lib/operationHistory/types";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
  },
})
export default class AutoOperationSelectDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({ type: Array, default: [] })
  public readonly autoOperationConditionGroups!: AutoOperationConditionGroup[];
  private selectedIndex = -1;
  private selectedDetails = "";

  private get selectList() {
    return this.autoOperationConditionGroups.map((group, index) => {
      return {
        settingName: group.settingName,
        value: { index, details: group.details },
      };
    });
  }

  private get okButtonIsDisabled() {
    return this.selectedIndex < 0;
  }

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }
  }

  private selectGroup(value: { index: number; details: string }) {
    this.selectedIndex = value.index;
    this.selectedDetails = value.details;
  }

  private async ok(): Promise<void> {
    this.$emit("ok", this.selectedIndex);
  }

  private async close(): Promise<void> {
    this.$emit("close");
  }
}
</script>
