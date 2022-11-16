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
    :title="$store.getters.message('autofill-register-dialog.title')"
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
      <v-text-field
        v-model="settingName"
        :label="$store.getters.message('autofill-register-dialog.form-label')"
      ></v-text-field>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ExecuteDialog from "@/vue/molecules/ExecuteDialog.vue";
import { AutofillConditionGroup } from "@/lib/operationHistory/types";
import { ElementInfo } from "src/common/types";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
  },
})
export default class AutofillRegisterDialog extends Vue {
  private settingName = "";
  private opened = false;

  private get autofillRegisterDialogData(): {
    title: string;
    url: string;
    message: string;
    inputElements: ElementInfo[];
    callback: () => void;
  } | null {
    this.settingName =
      this.$store.state.captureControl?.autofillRegisterDialogData?.title ?? "";
    this.opened =
      !!this.$store.state.captureControl?.autofillRegisterDialogData;
    return this.$store.state.captureControl?.autofillRegisterDialogData ?? null;
  }

  private get message(): string {
    return this.autofillRegisterDialogData?.message ?? "";
  }

  private async accept(): Promise<void> {
    const autofillConditionGroup: AutofillConditionGroup = {
      isEnabled: true,
      settingName: this.settingName,
      url: this.autofillRegisterDialogData?.url ?? "",
      title: this.autofillRegisterDialogData?.title ?? "",
      inputValueConditions: (
        this.autofillRegisterDialogData?.inputElements ?? []
      )
        .filter((element) => {
          return element.attributes.type !== "hidden";
        })
        .map((element) => {
          return {
            isEnabled: true,
            locator: element.attributes.id ?? element.xpath,
            locatorType: element.attributes.id ? "id" : "xpath",
            locatorMatchType: "equals",
            inputValue:
              element.tagname === "INPUT" &&
              ["checkbox", "radio"].includes(element.attributes.type)
                ? element.checked === true
                  ? "on"
                  : "off"
                : element.value ?? "",
          };
        }),
    };
    this.$store.dispatch("operationHistory/updateAutofillConditionGroup", {
      conditionGroup: autofillConditionGroup,
      index: -1,
    });
    await this.close();
  }

  private async close(): Promise<void> {
    this.opened = false;
    await new Promise((s) => setTimeout(s, 300));
    const callback = this.autofillRegisterDialogData?.callback;
    this.$store.commit("captureControl/setAutofillRegisterDialog", null);
    if (callback) {
      this.$nextTick(() => {
        callback();
      });
    }
  }
}
</script>
