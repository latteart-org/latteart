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
  <v-container fluid fill-height pa-8 style="overflow-y: scroll">
    <v-container class="align-self-start">
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
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ProjectExportLauncher from "@/components/organisms/optionalFeatures/ProjectExportLauncher.vue";
import ProjectImportLauncher from "@/components/organisms/optionalFeatures/ProjectImportLauncher.vue";
import SnapshotOutputLauncher from "@/components/organisms/optionalFeatures/SnapshotOutputLauncher.vue";
import TestScriptGenerationlauncher from "@/components/organisms/optionalFeatures/TestScriptGenerationLauncher.vue";

@Component({
  components: {
    "snapshot-output-launcher": SnapshotOutputLauncher,
    "test-script-generation-launcher": TestScriptGenerationlauncher,
    "project-import-launcher": ProjectImportLauncher,
    "project-export-launcher": ProjectExportLauncher,
  },
})
export default class OptionalFeaturesView extends Vue {
  created() {
    this.$store.dispatch("changeWindowTitle", {
      title: this.$store.getters.message(this.$route.meta?.title ?? ""),
    });
  }
}
</script>
