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
    :title="$store.getters.message('auto-operation-select-dialog.title')"
    @accept="
      ok();
      close();
    "
    @cancel="close()"
    :acceptButtonDisabled="okButtonIsDisabled"
  >
    <template>
      <div class="pre-wrap break-word">
        {{ $store.getters.message("auto-operation-select-dialog.message") }}
      </div>
      <v-select
        :label="$store.getters.message('auto-operation-select-dialog.name')"
        :items="selectList"
        v-model="selectedItem"
        item-text="settingName"
        item-value="value"
      ></v-select>
      <v-textarea
        :label="$store.getters.message('auto-operation-select-dialog.details')"
        readonly
        no-resize
        :value="selectedItem ? selectedItem.details : ''"
      ></v-textarea>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { AutoOperationConditionGroup } from "@/lib/operationHistory/types";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
  },
})
export default class AutoOperationSelectDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({ type: Array, default: [] })
  public readonly autoOperationConditionGroups!: AutoOperationConditionGroup[];
  private selectedItem: {
    index: number;
    setingName: string;
    details: string;
  } | null = null;

  private get selectList() {
    return this.autoOperationConditionGroups.map((group, index) => {
      return {
        settingName: group.settingName,
        value: { index, details: group.details },
      };
    });
  }

  private get okButtonIsDisabled() {
    return this.selectedItem === null;
  }

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }
    this.selectedItem = null;
  }

  private async ok(): Promise<void> {
    this.$emit("ok", this.selectedItem?.index);
  }

  private async close(): Promise<void> {
    this.$emit("close");
  }
}
</script>
