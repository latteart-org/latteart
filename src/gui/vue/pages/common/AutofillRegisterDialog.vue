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
      $store.getters.message("autofill-register-dialog.title")
    }}</template>
    <template v-slot:content>
      <div class="pre-wrap break-word">
        {{ message }}
      </div>
      <v-text-field
        v-model="settingName"
        :label="$store.getters.message('autofill-register-dialog.form-label')"
      ></v-text-field>
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
import {
  AutofillConditionGroup,
  ElementInfo,
} from "@/lib/operationHistory/types";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
  },
})
export default class AutofillRegisterDialog extends Vue {
  private settingName = "";

  private get autofillRegisterDialogData(): {
    title: string;
    url: string;
    message: string;
    inputElements: ElementInfo[];
    callback: () => void;
  } | null {
    this.settingName =
      this.$store.state.operationHistory?.autofillRegisterDialogData?.title ??
      "";
    return (
      this.$store.state.operationHistory?.autofillRegisterDialogData ?? null
    );
  }

  private get message(): string {
    return this.autofillRegisterDialogData?.message ?? "";
  }

  private get opened(): boolean {
    return !!this.autofillRegisterDialogData;
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
    this.close();
  }

  private close(): void {
    const callback = this.autofillRegisterDialogData?.callback;
    this.$store.commit("operationHistory/setAutofillRegisterDialog", null);
    if (callback) {
      this.$nextTick(() => {
        callback();
      });
    }
  }
}
</script>
