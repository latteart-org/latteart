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
  <v-card flat class="pa-0">
    <v-container fluid id="import-option">
      <v-row>
        <v-col cols="12">
          {{ store.getters.message("import-export-dialog.select-project-file-label") }}
        </v-col>

        <v-col cols="12" class="pl-2 pr-2 pt-2">
          <select-file-button
            accept=".zip"
            :details-message="option.targetFile ? option.targetFile.name : ''"
            @select="selectImportFile"
          >
            {{ store.getters.message("import-export-dialog.select-project-file-button") }}
          </select-file-button>
        </v-col>

        <v-col class="pt-3">
          <v-checkbox
            :label="store.getters.message('import-export-dialog.project-data')"
            v-model="option.selectedOptionProject"
          />
          <v-checkbox
            :label="store.getters.message('import-export-dialog.testresult-data')"
            v-model="option.selectedOptionTestresult"
          />
          <v-checkbox
            :label="store.getters.message('import-export-dialog.config-data')"
            v-model="option.selectedOptionConfig"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import SelectFileButton from "@/components/molecules/SelectFileButton.vue";
import { defineComponent, ref, watch } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  components: {
    "select-file-button": SelectFileButton
  },
  setup(_, context) {
    const store = useStore();

    const option = ref<{
      selectedOptionProject: boolean;
      selectedOptionTestresult: boolean;
      selectedOptionConfig: boolean;
      targetFile: File | null;
    }>({
      selectedOptionProject: true,
      selectedOptionTestresult: true,
      selectedOptionConfig: true,
      targetFile: null
    });

    const update = (): void => {
      context.emit("update", option.value);
    };

    const selectImportFile = (targetFile: File): void => {
      option.value.targetFile = targetFile;
    };

    watch(option, update, { deep: true });

    return {
      store,
      option,
      selectImportFile
    };
  }
});
</script>

<style lang="sass">
#import-option
  .v-text-field__details
    display: none

  .v-input--selection-controls
    margin-top: 0px

  .v-messages
    display: none

  .v-text-field
    padding-top: 0px
</style>
