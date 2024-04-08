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
    <v-container class="px-0" fluid id="export-option">
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
    </v-container>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  setup(_, context) {
    const store = useStore();

    const option = ref({
      selectedOptionProject: true,
      selectedOptionTestresult: true,
      selectedOptionConfig: true
    });

    const update = (): void => {
      context.emit("update", option.value);
    };

    watch(option, update, { deep: true });

    return {
      store,
      option
    };
  }
});
</script>

<style lang="sass">
#export-option
  .v-text-field__details
    display: none

  .v-input--selection-controls
    margin-top: 0px

  .v-messages
    display: none
</style>
