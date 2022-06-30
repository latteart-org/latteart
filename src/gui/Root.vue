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
  <v-app>
    <router-view></router-view>
    <progress-dialog></progress-dialog>
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ErrorMessageDialog from "./vue/pages/common/ErrorMessageDialog.vue";
import ProgressDialog from "./vue/pages/common/ProgressDialog.vue";

@Component({
  components: {
    "progress-dialog": ProgressDialog,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class Root extends Vue {
  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private mounted(): void {
    (async () => {
      try {
        await this.$store.dispatch("loadLocaleFromSettings");
        await this.$store.dispatch("operationHistory/readSettings");
        await this.$store.dispatch("captureControl/readDeviceSettings");
      } catch (error) {
        if (error instanceof Error) {
          this.errorMessage = error.message;
          this.errorMessageDialogOpened = true;
        } else {
          throw error;
        }
      }

      if (this.$route.query.mode === "manage") {
        this.$router.push({ name: "manageShowView" });
      } else {
        this.$router.push({ name: "configView" });
      }
    })();
  }
}
</script>
