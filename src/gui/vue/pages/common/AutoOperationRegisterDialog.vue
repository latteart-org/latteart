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
    <template v-slot:title>自動操作：登録</template>
    <template v-slot:content>
      <div class="pre-wrap break-word">
        選択した操作を登録しますか？登録する場合は操作セット名を入力してください。
      </div>
      <v-text-field v-model="settingName" label="操作セット名"></v-text-field>
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
import { Operation } from "@/lib/operationHistory/Operation";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
  },
})
export default class AutoOperationRegisterDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({ type: Array, default: () => [] })
  public readonly checkedOperations!: Operation[];
  private settingName = "";

  private get okButtonIsDisabled() {
    return !this.settingName ? true : false;
  }

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }
    this.settingName = "";
  }

  private ok() {
    const sortedOperations = this.checkedOperations.sort(
      (a, b) => a.sequence - b.sequence
    );
    this.$store.dispatch("operationHistory/registerAutoOperation", {
      settingName: this.settingName,
      checkedOperations: sortedOperations,
    });

    this.$emit("ok");
  }

  private close(): void {
    this.$emit("close");
  }
}
</script>
