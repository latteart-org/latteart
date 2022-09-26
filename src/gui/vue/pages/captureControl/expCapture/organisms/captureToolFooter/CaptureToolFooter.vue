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
  <v-layout justify-start align-center row pl-2 pr-2>
    <browser-back-button />
    <browser-forward-button />

    <v-divider vertical class="mx-3" />

    <current-window-info />
    <v-spacer />
    <select-window-button />

    <v-divider vertical class="mx-3" />

    <autofill-button />

    <note-register-button />

    <v-divider vertical class="mx-3" />

    <go-config-view-button v-if="$route.name === 'historyView'" />
    <go-history-view-button v-else />

    <span class="px-1"><recording-time /></span>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import BrowserBackButton from "./BrowserBackButton.vue";
import BrowserForwardButton from "./BrowserForwardButton.vue";
import CurrentWindowInfo from "./CurrentWindowInfo.vue";
import GoConfigViewButton from "./GoConfigViewButton.vue";
import GoHistoryViewButton from "./GoHistoryViewButton.vue";
import NoteRegisterButton from "./NoteRegisterButton.vue";
import RecordingTime from "./RecordingTime.vue";
import SelectWindowButton from "./SelectWindowButton.vue";
import AutofillButton from "./AutofillButton.vue";

@Component({
  components: {
    "browser-back-button": BrowserBackButton,
    "browser-forward-button": BrowserForwardButton,
    "current-window-info": CurrentWindowInfo,
    "select-window-button": SelectWindowButton,
    "note-register-button": NoteRegisterButton,
    "go-config-view-button": GoConfigViewButton,
    "go-history-view-button": GoHistoryViewButton,
    "recording-time": RecordingTime,
    "autofill-button": AutofillButton,
  },
})
export default class CaptureToolFooter extends Vue {}
</script>
