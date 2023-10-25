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
    <test-result-navigation-drawer />

    <v-app-bar color="white" flat absolute height="64px">
      <capture-tool-header />
    </v-app-bar>

    <v-container
      fluid
      fill-height
      py-0
      :style="{
        'margin-top': '4px',
        'max-height': 'calc(100vh - 64px - 64px)',
      }"
    >
      <router-view />
    </v-container>

    <v-footer absolute height="64px">
      <capture-tool-footer />
    </v-footer>

    <autofill-select-dialog />
    <completion-dialog />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CaptureToolHeader from "./organisms/captureToolHeader/CaptureToolHeader.vue";
import CaptureToolFooter from "./organisms/captureToolFooter/CaptureToolFooter.vue";
import ConfirmDialog from "../../common/ConfirmDialog.vue";
import ErrorMessageDialog from "../../common/ErrorMessageDialog.vue";
import AutofillSelectDialog from "@/components/pages/common/AutofillSelectDialog.vue";
import NoteRegisterDialog from "../../common/NoteRegisterDialog.vue";
import NoteUpdateDialog from "../../common/NoteUpdateDialog.vue";
import TestResultNavigationDrawer from "../../common/organisms/TestResultNavigationDrawer.vue";
import CompletionDialog from "../../common/CompletionDialog.vue";

@Component({
  components: {
    "capture-tool-header": CaptureToolHeader,
    "capture-tool-footer": CaptureToolFooter,
    "confirm-dialog": ConfirmDialog,
    "error-message-dialog": ErrorMessageDialog,
    "autofill-select-dialog": AutofillSelectDialog,
    "note-register-dialog": NoteRegisterDialog,
    "note-update-dialog": NoteUpdateDialog,
    "test-result-navigation-drawer": TestResultNavigationDrawer,
    "completion-dialog": CompletionDialog,
  },
})
export default class ExpCapture extends Vue {}
</script>

<style lang="sass" scoped>
html
  overflow: hidden
</style>

<style lang="sass">
#windowHandlesSelectedBox
  max-height: 50px !important
</style>
