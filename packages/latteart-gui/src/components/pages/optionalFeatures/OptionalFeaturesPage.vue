<!--
 Copyright 2024 NTT Corporation.

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
  <v-container fluid class="pa-8">
    <v-row>
      <v-col cols="12">
        <v-card class="pa-0">
          <snapshot-output-launcher />
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-0">
          <test-script-generation-launcher />
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-0">
          <project-import-launcher />
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-0">
          <project-export-launcher />
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-0">
          <usersettings-import-launcher />
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-0">
          <usersettings-export-launcher />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import ProjectExportLauncher from "@/components/organisms/optionalFeatures/ProjectExportLauncher.vue";
import ProjectImportLauncher from "@/components/organisms/optionalFeatures/ProjectImportLauncher.vue";
import SnapshotOutputLauncher from "@/components/organisms/optionalFeatures/SnapshotOutputLauncher.vue";
import TestScriptGenerationlauncher from "@/components/organisms/optionalFeatures/TestScriptGenerationLauncher.vue";
import UserSettingsExportLauncher from "@/components/organisms/optionalFeatures/UserSettingsExportLauncher.vue";
import UserSettingsImportLauncher from "@/components/organisms/optionalFeatures/UserSettingsImportLauncher.vue";
import { useRootStore } from "@/stores/root";
import { defineComponent } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  components: {
    "snapshot-output-launcher": SnapshotOutputLauncher,
    "test-script-generation-launcher": TestScriptGenerationlauncher,
    "project-import-launcher": ProjectImportLauncher,
    "project-export-launcher": ProjectExportLauncher,
    "usersettings-import-launcher": UserSettingsImportLauncher,
    "usersettings-export-launcher": UserSettingsExportLauncher
  },
  setup() {
    const rootStore = useRootStore();
    const route = useRoute();

    rootStore.changeWindowTitle({
      title: rootStore.message(route.meta?.title ?? "")
    });
  }
});
</script>
