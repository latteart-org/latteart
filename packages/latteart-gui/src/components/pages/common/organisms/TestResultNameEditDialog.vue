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
  <div>
    <execute-dialog
      :opened="opened"
      :title="$store.getters.message('test-result-list.edit')"
      @accept="
        execute();
        close();
      "
      @cancel="
        cancel();
        close();
      "
      :acceptButtonDisabled="okButtonIsDisabled"
    >
      <template>
        <v-text-field v-model="testResultName"></v-text-field>
      </template>
    </execute-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import NumberField from "@/components/molecules/NumberField.vue";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";

@Component({
  components: {
    "number-field": NumberField,
    "execute-dialog": ExecuteDialog,
  },
})
export default class TestResultNameEditDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({ type: String, default: "" })
  public readonly oldTestResultName!: string;

  private testResultName = "";

  private get okButtonIsDisabled() {
    return !this.testResultName;
  }

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }

    this.testResultName = this.oldTestResultName;
  }

  private execute() {
    this.$emit("execute", this.testResultName);
  }

  private cancel(): void {
    this.$emit("cancel");
  }

  private close(): void {
    this.$emit("close");
  }
}
</script>
