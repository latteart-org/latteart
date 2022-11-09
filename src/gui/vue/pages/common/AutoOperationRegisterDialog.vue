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
      $store.getters.message("auto-operation-register-dialog.title")
    }}</template>
    <template v-slot:content>
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
  public readonly targetOperations!: Operation[];
  private settingName = "";
  private settingDetails = "";
  private invalidTypes = ["switch_window"];
  private isProcessing = false;

  private get okButtonIsDisabled() {
    return this.isProcessing || !this.settingName ? true : false;
  }

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }
    this.isProcessing = false;
    this.settingName = "";
    this.settingDetails = "";
  }

  private get invalidOperations() {
    return this.targetOperations.filter((operation) => {
      return this.invalidTypes.includes(operation.type);
    });
  }

  private ok() {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;
    if (this.invalidOperations.length > 0) {
      this.$emit("error", this.invalidTypes);
      this.isProcessing = false;
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
