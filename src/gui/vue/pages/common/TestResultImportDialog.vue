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
  <scrollable-dialog :opened="dialogOpened">
    <template v-slot:title>{{
      $store.getters.message("import-export-dialog.import-title")
    }}</template>
    <template v-slot:content>
      <v-container class="px-0 pt-0" fluid id="import-option-dialog">
        <v-select
          v-model="selectedUrl"
          item-text="name"
          item-value="url"
          :items="importTestResults"
          :label="
            $store.getters.message(
              'import-export-dialog.select-test-result-file'
            )
          "
        ></v-select>
      </v-container>
    </template>
    <template v-slot:footer>
      <v-spacer></v-spacer>
      <v-btn
        :disabled="okButtonIsDisabled"
        :dark="!okButtonIsDisabled"
        color="blue"
        @click="
          execute();
          close();
        "
        >{{ $store.getters.message("common.ok") }}</v-btn
      >
      <v-btn @click="close()">{{
        $store.getters.message("common.cancel")
      }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import ScrollableDialog from "@/vue/molecules/ScrollableDialog.vue";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
  },
})
export default class TestResultImportDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private dialogOpened = false;
  private selectedUrl = "";
  private importTestResults: {
    url: string;
    name: string;
  }[] = [];

  private get okButtonIsDisabled() {
    return this.selectedUrl === "";
  }

  @Watch("opened")
  private async updateImportFiles(newValue: boolean) {
    try {
      if (newValue) {
        this.importTestResults = await this.$store.dispatch(
          "operationHistory/getImportTestResults"
        );
      }
      this.dialogOpened = newValue;
    } catch (e) {
      console.error(e);
      this.close();
    }
  }

  private execute(): void {
    const target = this.importTestResults.find((testResult) => {
      return testResult.url === this.selectedUrl;
    });
    if (!target) {
      throw new Error(`invalid url: ${this.selectedUrl}`);
    }
    this.$emit("execute", {
      url: target.url,
      name: target.name,
    });
    this.close();
  }

  private close(): void {
    this.$emit("close");
  }
}
</script>

<style lang="sass">
#import-option-dialog
  .v-text-field__details
    display: none

  .v-input--selection-controls
    margin-top: 0px

  .v-messages
    display: none

  .v-text-field
    padding-top: 0px
</style>
