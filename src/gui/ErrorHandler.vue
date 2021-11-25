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
  <div>
    <slot></slot>
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ErrorMessageDialog from "./vue/pages/common/ErrorMessageDialog.vue";

interface ExtendError extends Error {
  code?: string;
}

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class ErrorHandler extends Vue {
  private errorMessageDialogOpened = false;
  private errorMessage = "";

  public created(): void {
    Vue.config.errorHandler = this.errorCaptured;
    window.addEventListener("error", this.errorHandler);
    window.addEventListener("unhandledrejection", this.asyncErrorhandler);
  }

  public beforeDestroy(): void {
    window.removeEventListener("error", this.errorHandler);
    window.removeEventListener("unhandledrejection", this.asyncErrorhandler);
  }

  private errorHandler(event: ErrorEvent) {
    console.error(event.error);

    this.openErrorDialog(event.error.code);
  }

  private asyncErrorhandler(event: PromiseRejectionEvent) {
    console.error(event.reason);

    this.openErrorDialog(event.reason.code);
  }

  private errorCaptured(error: ExtendError) {
    console.error(error);

    this.openErrorDialog(error.code);

    return false;
  }

  private openErrorDialog(code?: string) {
    this.errorMessage = this.$store.getters.message(
      code ?? "error.common.fatal"
    );
    this.errorMessageDialogOpened = true;
  }
}
</script>

<style lang="sass">
html
  overflow-y: auto !important
</style>
