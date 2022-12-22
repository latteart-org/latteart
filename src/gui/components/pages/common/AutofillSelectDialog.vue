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
    :title="$store.getters.message('autofill-select-dialog.title')"
    @accept="
      accept();
      close();
    "
    @cancel="close()"
  >
    <template>
      <div class="pre-wrap break-word">
        {{ message }}
      </div>
      <v-select
        :label="$store.getters.message('autofill-select-dialog.form-label')"
        :items="selectList"
        item-text="settingName"
        item-value="index"
        @change="selectGroup"
      ></v-select>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AutofillConditionGroup } from "@/lib/operationHistory/types";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
  },
})
export default class AutofillSelectDialog extends Vue {
  private selectedIndex = -1;
  private opened = false;

  private get dialogData(): {
    autofillConditionGroups: AutofillConditionGroup[];
    message: string;
  } | null {
    const data = this.$store.state.captureControl?.autofillSelectDialogData;
    this.opened = !!data?.autofillConditionGroups;
    return this.$store.state.captureControl?.autofillSelectDialogData ?? null;
  }

  private get autofillConditionGroups(): AutofillConditionGroup[] {
    return this.dialogData?.autofillConditionGroups ?? [];
  }

  private get message(): string {
    return this.dialogData?.message ?? "";
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
    await this.close();
  }

  private async close(): Promise<void> {
    this.opened = false;
    await new Promise((s) => setTimeout(s, 300));
    this.$store.commit("captureControl/setAutofillSelectDialog", {
      autofillConditionGroups: null,
    });
  }
}
</script>
