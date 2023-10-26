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
  <v-container fluid fill-height pa-0>
    <router-view></router-view>

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :onAccept="confirmDialogAccept"
      @close="confirmDialogOpened = false"
    />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import AlertDialog from "@/components/pages/common/AlertDialog.vue";
import ErrorMessageDialog from "@/components/pages/common/ErrorMessageDialog.vue";

import ConfirmDialog from "../common/ConfirmDialog.vue";

@Component({
  components: {
    "alert-dialog": AlertDialog,
    "error-message-dialog": ErrorMessageDialog,
    "confirm-dialog": ConfirmDialog,
  },
})
export default class Manager extends Vue {
  private isConfirmButtonDisabled = false;

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  public created(): void {
    (async () => {
      try {
        this.$store.dispatch("openProgressDialog", {
          message: this.$store.getters.message("manage.loading-project"),
        });
        await this.$store.dispatch("testManagement/initialize");
      } catch (error) {
        console.error(error);
        if (!(error instanceof Error)) {
          throw error;
        }
        this.errorMessage = error.message;
        this.errorMessageDialogOpened = true;
      } finally {
        this.$nextTick(() => {
          this.$store.dispatch("closeProgressDialog");
        });
      }
    })();
  }
}
</script>

<style lang="sass">
.pre-wrap
  white-space: pre-wrap
.break-word
  word-wrap: break-word

@mixin ellipsis
  overflow: hidden !important
  text-overflow: ellipsis !important
  white-space: nowrap !important

.ellipsis
  @include ellipsis

.ellipsis_short
  @include ellipsis
  max-width: 200px
</style>
