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
  <v-container fluid class="pa-0 fill-height">
    <v-container fluid class="pa-0 fill-height">
      <v-app-bar color="#424242" theme="dark" absolute flat>
        <v-toolbar-title>{{ $t(title) }}</v-toolbar-title>
      </v-app-bar>

      <v-container fluid class="pa-0 fill-height">
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
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { useRootStore } from "@/stores/root";
import { useTestManagementStore } from "@/stores/testManagement";
import { defineComponent, nextTick, ref, computed } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  components: {
    "error-message-dialog": ErrorMessageDialog
  },
  setup() {
    const rootStore = useRootStore();
    const testManagementStore = useTestManagementStore();
    const route = useRoute();

    const selectedTestMatrixId = ref("");

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const changeMatrixId = (testMatrixId: string): void => {
      selectedTestMatrixId.value = testMatrixId;
    };

    const title = computed((): string => {
      return route.meta.title ?? "";
    });

    (async () => {
      try {
        rootStore.openProgressDialog({
          message: rootStore.message("manage.loading-project")
        });
        await testManagementStore.initialize();
      } catch (error) {
        console.error(error);
        if (!(error instanceof Error)) {
          throw error;
        }
        errorMessage.value = error.message;
        errorMessageDialogOpened.value = true;
      } finally {
        nextTick(() => {
          rootStore.closeProgressDialog();
        });
      }
    })();

    return {
      t: rootStore.message,
      title,
      errorMessageDialogOpened,
      errorMessage,
      changeMatrixId
    };
  }
});
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
