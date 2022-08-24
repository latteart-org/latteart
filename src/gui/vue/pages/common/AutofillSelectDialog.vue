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
      $store.getters.message("autofill-select-dialog.title")
    }}</template>
    <template v-slot:content>
      <div class="pre-wrap break-word">
        {{ $store.getters.message("autofill-select-dialog.message") }}
      </div>
      <v-select
        :label="$store.getters.message('autofill-select-dialog.form-label')"
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
    return this.$store.state.operationHistory?.autofillSelectDialogData ?? null;
  }

  private get opened(): boolean {
    return !!this.autofillConditionGroups;
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
    await this.$store.dispatch("captureControl/autofill", {
      autofillConditionGroup: this.autofillConditionGroups[this.selectedIndex],
    });
    this.close();
  }

  private close(): void {
    this.$store.commit("operationHistory/setAutofillSelectDialog", {
      autofillConditionGroups: null,
    });
  }
}
</script>
