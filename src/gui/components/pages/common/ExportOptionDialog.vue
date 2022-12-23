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
    :title="$store.getters.message('import-export-dialog.project-export-title')"
    @accept="
      execute();
      close();
    "
    @cancel="close()"
    :acceptButtonDisabled="okButtonIsDisabled"
  >
    <template>
      <v-container class="px-0" fluid id="export-option-dialog">
        <v-checkbox
          :label="$store.getters.message('import-export-dialog.project-data')"
          v-model="exporOption.selectedOptionProject"
        >
        </v-checkbox>
        <v-checkbox
          :label="
            $store.getters.message('import-export-dialog.testresult-data')
          "
          v-model="exporOption.selectedOptionTestresult"
        >
        </v-checkbox>
      </v-container>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
  },
})
export default class ExportOptionDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private exporOption = {
    selectedOptionProject: false,
    selectedOptionTestresult: false,
  };

  private get okButtonIsDisabled() {
    return (
      !this.exporOption.selectedOptionProject &&
      !this.exporOption.selectedOptionTestresult
    );
  }

  private execute(): void {
    this.$emit("execute", this.exporOption);
    this.close();
  }

  private close(): void {
    this.$emit("close");
  }
}
</script>

<style lang="sass">
#export-option-dialog
  .v-text-field__details
    display: none

  .v-input--selection-controls
    margin-top: 0px

  .v-messages
    display: none
</style>
