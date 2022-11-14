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
    :title="$store.getters.message('auto-operation-register-dialog.title')"
    @accept="
      ok();
      close();
    "
    @cancel="close()"
    :acceptButtonDisabled="okButtonIsDisabled"
  >
    <template>
      <div class="pre-wrap break-word">
        {{ $store.getters.message("auto-operation-register-dialog.message") }}
      </div>
      <v-text-field
        v-model="settingName"
        :label="$store.getters.message('auto-operation-register-dialog.name')"
      ></v-text-field>
      <v-textarea
        :label="
          $store.getters.message('auto-operation-register-dialog.details')
        "
        v-model="settingDetails"
      ></v-textarea>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { Operation } from "@/lib/operationHistory/Operation";
import ExecuteDialog from "@/vue/molecules/ExecuteDialog.vue";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
  },
})
export default class AutoOperationRegisterDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({ type: Array, default: () => [] })
  public readonly targetOperations!: Operation[];
  private settingName = "";
  private settingDetails = "";
  private invalidTypes = ["switch_window"];

  private get okButtonIsDisabled() {
    return !this.settingName ? true : false;
  }

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }
    this.settingName = "";
    this.settingDetails = "";
  }

  private get invalidOperations() {
    return this.targetOperations.filter((operation) => {
      return this.invalidTypes.includes(operation.type);
    });
  }

  private ok() {
    if (this.invalidOperations.length > 0) {
      this.$emit("error", this.invalidTypes);
      return;
    }
    const sortedOperations = this.targetOperations
      .sort((a, b) => a.sequence - b.sequence)
      .map((operation) => {
        return {
          input: operation.input,
          type: operation.type,
          elementInfo: operation.elementInfo,
          title: operation.title,
          url: operation.url,
        };
      });
    this.$store.dispatch("operationHistory/registerAutoOperation", {
      settingName: this.settingName,
      settingDetails: this.settingDetails,
      operations: sortedOperations,
    });

    this.$emit("ok");
  }

  private close(): void {
    this.$emit("close");
  }
}
</script>
