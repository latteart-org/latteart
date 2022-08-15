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
  <scrollable-dialog :opened="autofillConditionGroups">
    <template v-slot:title>{{
      $store.getters.message("config-view.setting-autofill")
    }}</template>
    <template v-slot:content>
      <div class="pre-wrap break-word">
        {{
          "自動入力可能なフォームが見つかりました。自動入力する場合は以下から自動入力定義を選んでください。"
        }}
      </div>
      <v-select
        label="設定名"
        :items="selectList"
        item-text="settingName"
        item-value="index"
        @change="selectGroup"
      ></v-select>
    </template>
    <template v-slot:footer>
      <v-spacer></v-spacer>
      <v-btn
        color="red"
        dark
        @click="
          accept();
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
import { Component, Vue } from "vue-property-decorator";
import ScrollableDialog from "@/vue/molecules/ScrollableDialog.vue";
import { AutofillConditionGroup } from "@/lib/operationHistory/types";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
  },
})
export default class AutofillSelectDialog extends Vue {
  private selectedIndex = -1;

  private get autofillConditionGroups(): AutofillConditionGroup[] | null {
    return this.$store.state.captureControll.autofillSelectDialog;
  }

  private get selectList(): { settingName: string; index: number }[] {
    return (this.autofillConditionGroups ?? []).map((group, index) => {
      return {
        settingName: group.settingName,
        index,
      };
    });
  }

  private selectGroup(index: number) {
    this.selectedIndex = index;
  }

  private async accept(): Promise<void> {
    if (this.autofillConditionGroups === null || this.selectedIndex < 0) {
      return;
    }
    await this.$store.dispatch(
      "captureControl/autofill",
      this.autofillConditionGroups[this.selectedIndex]
    );
  }

  private close(): void {
    this.$store.commit("captureControl/clearAutofillDialog");
  }
}
</script>
