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
  <v-list-item @click="openConfigImportDialog" :disabled="isDisabled">
    <v-list-item-title>{{
      $store.getters.message("config-io.import-config")
    }}</v-list-item-title>

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />

    <config-import-dialog
      :opened="configImportDialogOpened"
      @execute="closeConfigImportDialog"
      @close="configImportDialogOpened = false"
    />

    <information-message-dialog
      :opened="informationMessageDialogOpened"
      :title="informationTitle"
      :message="informationMessage"
      @close="informationMessageDialogOpened = false"
    />
  </v-list-item>
</template>

<script lang="ts">
import ErrorMessageDialog from "@/components/pages/common/ErrorMessageDialog.vue";
import InformationMessageDialog from "@/components/pages/common/InformationMessageDialog.vue";
import ConfigImportDialog from "@/components/pages/common/ConfigImportDialog.vue";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "information-message-dialog": InformationMessageDialog,
    "config-import-dialog": ConfigImportDialog,
  },
})
export default class ConfigImportButton extends Vue {
  private isProcessing = false;

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private configImportDialogOpened = false;

  private informationMessageDialogOpened = false;
  private informationTitle = "";
  private informationMessage = "";

  private get isDisabled(): boolean {
    return (
      this.isCapturing ||
      this.isReplaying ||
      this.isResuming ||
      this.isProcessing
    );
  }

  private get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  private get isReplaying(): boolean {
    return this.$store.state.captureControl.isReplaying;
  }

  private get isResuming(): boolean {
    return this.$store.state.captureControl.isResuming;
  }

  private closeConfigImportDialog() {
    this.configImportDialogOpened = false;

    this.informationTitle = this.$store.getters.message(
      "config-io.import-config"
    );
    this.informationMessage = `${this.$store.getters.message(
      "config-io.completed-import"
    )}\n${this.$store.getters.message("config-io.please-redisplay")}`;
    this.informationMessageDialogOpened = true;
  }

  private openConfigImportDialog() {
    this.configImportDialogOpened = true;
  }
}
</script>
