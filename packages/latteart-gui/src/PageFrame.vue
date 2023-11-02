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
    <v-container fluid fill-height pa-0>
      <v-app-bar color="latteart-main" dark absolute flat>
        <v-toolbar-title>{{
          $store.getters.message($route.meta.title)
        }}</v-toolbar-title>
      </v-app-bar>

      <v-container
        fluid
        fill-height
        pa-0
        style="margin-top: 64px; height: calc(100vh - 64px)"
      >
        <router-view @selectTestMatrix="changeMatrixId"></router-view>
      </v-container>
    </v-container>

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import AlertDialog from "./components/molecules/AlertDialog.vue";
import ErrorMessageDialog from "./components/molecules/ErrorMessageDialog.vue";

@Component({
  components: {
    "alert-dialog": AlertDialog,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class PageFrame extends Vue {
  private selectedTestMatrixId = "";

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

  private changeMatrixId(testMatrixId: string): void {
    this.selectedTestMatrixId = testMatrixId;
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

<style lang="sass" scoped>
@media print
  .no-print
    display: none
</style>
