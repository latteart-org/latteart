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
    <slot></slot>
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, ref } from "vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { useRootStore } from "@/stores/root";

// interface ExtendError extends Error {
//   code?: string;
// }

export default defineComponent({
  components: {
    "error-message-dialog": ErrorMessageDialog
  },
  setup() {
    const rootStore = useRootStore();

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    onBeforeUnmount(() => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", asyncErrorhandler);
    });

    const errorHandler = (event: ErrorEvent) => {
      console.error(event);

      openErrorDialog({
        code: event.error?.code,
        message: event.error?.message
      });
    };

    const asyncErrorhandler = (event: PromiseRejectionEvent) => {
      console.error(event);

      openErrorDialog({
        code: event.reason?.code,
        message: event.reason?.message
      });
    };

    // const errorCaptured = (error: ExtendError) => {
    //   console.error(error);

    //   openErrorDialog({ code: error.code, message: error.message });

    //   return false;
    // };

    const openErrorDialog = (args: { code?: string; message?: string }) => {
      errorMessage.value = args.message
        ? args.message
        : rootStore.message(args.code ?? "error.common.fatal");
      errorMessageDialogOpened.value = true;
    };

    (() => {
      // Vue.config.errorHandler = errorCaptured;
      window.addEventListener("error", errorHandler);
      window.addEventListener("unhandledrejection", asyncErrorhandler);
    })();

    return { errorMessageDialogOpened, errorMessage };
  }
});
</script>

<style lang="sass">
html
  overflow-y: auto !important
</style>
