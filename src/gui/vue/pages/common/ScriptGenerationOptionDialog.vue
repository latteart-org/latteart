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
  <execute-dialog
    :opened="opened"
    :title="$store.getters.message('history-view.generate-testscript-title')"
    @accept="
      execute();
      close();
    "
    @cancel="close()"
  >
    <template>
      {{ $store.getters.message("history-view.generate-testscript-option") }}
      <v-container fluid pa-1 fill-height id="simple-test-script-generation">
        <v-layout row wrap>
          <v-flex xs12 pb-2>
            {{ $store.getters.message("history-view.testscript") }}
          </v-flex>
          <v-flex xs12 pl-2>
            <v-checkbox
              :label="
                $store.getters.message(
                  'history-view.generate-simple-testscript'
                )
              "
              v-model="testGenerationOption.testScript.isSimple"
            >
            </v-checkbox>
          </v-flex>
        </v-layout>
      </v-container>
      <v-container fluid pa-1 fill-height id="max-test-data-generation">
        <v-layout row wrap>
          <v-flex xs12 pb-2>
            {{ $store.getters.message("history-view.testdata") }}
          </v-flex>
          <v-flex xs12 pl-2>
            <v-checkbox
              :label="$store.getters.message('history-view.method-data-driven')"
              :disabled="testGenerationOption.testScript.isSimple"
              v-model="testGenerationOption.testData.useDataDriven"
            >
            </v-checkbox>
          </v-flex>
          <v-flex xs12 pl-2>
            <number-field
              :value="testGenerationOption.maxGeneration"
              @updateNumberFieldValue="updateMaxGeneration"
              :label="$store.getters.message('history-view.max-generation')"
              :disabled="
                !testGenerationOption.testData.useDataDriven ||
                testGenerationOption.testScript.isSimple
              "
              :minValue="0"
            >
            </number-field>
          </v-flex>
          <v-flex xs12 pl-3>
            <span>{{
              $store.getters.message("history-view.generate-only-template")
            }}</span>
          </v-flex>
        </v-layout>
      </v-container>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import NumberField from "@/vue/molecules/NumberField.vue";
import ExecuteDialog from "@/vue/molecules/ExecuteDialog.vue";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
    "number-field": NumberField,
  },
})
export default class ScriptGenerationOptionDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened?: boolean;

  private testGenerationOption = {
    testScript: {
      isSimple: false,
    },
    testData: {
      useDataDriven: false,
      maxGeneration: 0,
    },
  };

  private updateMaxGeneration(data: { value: number }) {
    this.testGenerationOption.testData.maxGeneration = data.value;
  }

  private execute(): void {
    this.$emit("execute", this.testGenerationOption);
    this.close();
  }

  private close(): void {
    this.$emit("close");
  }
}
</script>

<style lang="sass">
#max-test-data-generation
  .v-text-field__details
    display: none

  .v-input--selection-controls
    margin-top: 0px

  .v-messages
    display: none
</style>
