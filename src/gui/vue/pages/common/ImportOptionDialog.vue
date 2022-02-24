<!--
 Copyright 2021 NTT Corporation.

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
      $store.getters.message("import-export-dialog.import-title")
    }}</template>
    <template v-slot:content>
      <v-container class="px-0 pt-0" fluid id="import-option-dialog">
        <v-select
          item-text="name"
          item-value="url"
          :items="importZipFiles"
          :label="$store.getters.message('import-export-dialog.select-file')"
          @change="updateImportOption"
        ></v-select>
        <v-flex class="pt-3">
          <v-checkbox
            :label="$store.getters.message('import-export-dialog.project-data')"
            v-model="importOption.selectedOptionProject"
          >
          </v-checkbox>
          <v-checkbox
            :label="
              $store.getters.message('import-export-dialog.testresult-data')
            "
            v-model="importOption.selectedOptionTestresult"
          >
          </v-checkbox>
        </v-flex>
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
export default class ImportOptionDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private importItems: Array<{ url: string; name: string }> = [];

  private importOption = {
    selectedOptionProject: false,
    selectedOptionTestresult: false,
    selectedItem: {
      url: "",
      name: "",
    },
  };

  private get okButtonIsDisabled() {
    if (this.importOption.selectedItem.url === "") {
      return true;
    }

    if (
      !this.importOption.selectedOptionProject &&
      !this.importOption.selectedOptionTestresult
    ) {
      return true;
    }

    return false;
  }

  private get importZipFiles() {
    return this.importItems;
  }

  @Watch("opened")
  private async updateImportFiles() {
    if (this.opened) {
      this.importItems = await this.$store.dispatch(
        "operationHistory/getImportProjects"
      );
    }
  }

  private updateImportOption(url: string) {
    const selectedItem = this.importItems.find((item) => item.url === url);
    if (selectedItem) {
      this.importOption.selectedItem = { ...selectedItem };
    }
  }

  private execute(): void {
    this.$emit("execute", {
      ...this.importOption,
      selectedItem: {
        url: this.importOption.selectedItem.url,
        name: this.importOption.selectedItem.name,
      },
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
