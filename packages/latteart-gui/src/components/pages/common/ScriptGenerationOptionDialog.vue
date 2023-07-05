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
      <v-checkbox
        :label="
          $store.getters.message('history-view.generate-simple-testscript')
        "
        v-model="testGenerationOption.testScript.isSimple"
      >
      </v-checkbox>
      <v-checkbox
        v-model="testGenerationOption.testScript.useMultiLocator"
        class="mt-0"
      >
        <template v-slot:label>
          <div>
            {{ $store.getters.message("history-view.use-multi-locator1") }}
            <a
              href="https://github.com/latteart-org/multi-locator"
              target="_blank"
              @click.stop
              v-on="on"
              >multi-locator</a
            >{{ $store.getters.message("history-view.use-multi-locator2") }}
          </div>
        </template>
      </v-checkbox>
      <v-container fluid pa-1 fill-height id="simple-test-script-generation">
        <v-row>
          <v-col cols="12" class="pb-2">
            <p
              :class="{
                'mb-0': true,
                'text--disabled': testGenerationOption.testScript.isSimple,
              }"
            >
              {{
                $store.getters.message("history-view.custom-button-definition")
              }}
            </p>
          </v-col>
          <v-col cols="12" class="pl-2">
            <span
              :class="{
                caption: true,
                'theme--light': true,
                'v-label': true,
                'text--disabled': testGenerationOption.testScript.isSimple,
              }"
            >
              {{ $store.getters.message("history-view.custom-button-tags") }}
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-icon
                    size="15"
                    v-on="on"
                    class="icon-info"
                    :disabled="testGenerationOption.testScript.isSimple"
                    >info</v-icon
                  >
                </template>
                <span>{{
                  $store.getters.message("history-view.default-button-tags", {
                    value: standardButtontags.join(", "),
                  })
                }}</span>
              </v-tooltip>
            </span>

            <v-combobox
              :items="customButtonCandidateTags"
              :search-input.sync="search"
              v-model="testGenerationOption.customButtonTags"
              :class="{ 'pt-0': true, 'mt-0': true }"
              multiple
              small-chips
              hide-selected
              deletable-chips
              append-outer-icon="refresh"
              @click:append-outer="resetCustomButtonTags"
              @change="clearSearchText"
              :disabled="testGenerationOption.testScript.isSimple"
            >
              <template v-slot:no-data>
                <v-list-item v-if="search">
                  <v-list-item-content>
                    <v-list-item-title>
                      No results matching "<strong>{{ search }}</strong
                      >". Press <kbd>enter</kbd> to create a new one
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-combobox>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid pa-1 fill-height id="max-test-data-generation">
        <v-row>
          <v-col cols="12" class="pb-2">
            <p
              :class="{
                'mb-0': true,
                'text--disabled': testGenerationOption.testScript.isSimple,
              }"
            >
              {{ $store.getters.message("history-view.testdata") }}
            </p>
          </v-col>
          <v-col cols="12" class="pl-2">
            <v-checkbox
              :label="$store.getters.message('history-view.method-data-driven')"
              :disabled="testGenerationOption.testScript.isSimple"
              v-model="testGenerationOption.testData.useDataDriven"
            >
            </v-checkbox>
          </v-col>
          <v-col cols="12" class="pl-2">
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
          </v-col>
          <v-col cols="12" class="pl-3">
            <span
              :class="{
                'text--disabled':
                  !testGenerationOption.testData.useDataDriven ||
                  testGenerationOption.testScript.isSimple,
              }"
              >{{
                $store.getters.message("history-view.generate-only-template")
              }}</span
            >
          </v-col>
        </v-row>
      </v-container>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import NumberField from "@/components/molecules/NumberField.vue";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { RootState } from "@/store";
import { TestScriptOption } from "latteart-client";

type ButtonDefinition = {
  tagname: string;
  attribute?: {
    name: string;
    value: string;
  };
};

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
    "number-field": NumberField,
  },
})
export default class ScriptGenerationOptionDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened?: boolean;

  private search = "";
  private testGenerationOption = this.createNewOption();
  private get customButtonCandidateTags() {
    const tags = [
      ...(this.$store.state as RootState).projectSettings.defaultTagList,
      "INPUT:type=submit",
      "INPUT:type=button",
      "INPUT:type=text",
      "INPUT:type=search",
      "INPUT:type=tel",
      "INPUT:type=url",
      "INPUT:type=email",
      "INPUT:type=password",
      "INPUT:type=datetime",
      "INPUT:type=date",
      "INPUT:type=month",
      "INPUT:type=week",
      "INPUT:type=time",
      "INPUT:type=datetime-local",
      "INPUT:type=number",
      "INPUT:type=range",
      "INPUT:type=color",
      "INPUT:type=checkbox",
      "INPUT:type=radio",
      "INPUT:type=file",
      "INPUT:type=image",
      "INPUT:type=reset",
    ];

    return tags.sort();
  }
  private get defaultCustomButtonTags() {
    return ["SPAN", "IMG"];
  }
  private get standardButtontags() {
    return ["INPUT:type=submit", "INPUT:type=button", "BUTTON", "A"];
  }

  @Watch("opened")
  private initialize() {
    if (this.opened) {
      this.testGenerationOption = this.createNewOption();

      (async () => {
        const option: Pick<TestScriptOption, "buttonDefinitions"> =
          await this.$store.dispatch("readTestScriptOption");
        if (option.buttonDefinitions) {
          this.testGenerationOption.customButtonTags =
            option.buttonDefinitions.map(this.convertButtonDefinitionToTag);
        }
      })();
    }
  }

  private createNewOption() {
    return {
      testScript: {
        isSimple: false,
        useMultiLocator: false,
      },
      testData: {
        useDataDriven: false,
        maxGeneration: 0,
      },
      customButtonTags: this.defaultCustomButtonTags,
    };
  }

  private clearSearchText() {
    this.search = "";
  }

  private resetCustomButtonTags() {
    this.testGenerationOption.customButtonTags = this.defaultCustomButtonTags;
  }

  private updateMaxGeneration(data: { value: number }) {
    this.testGenerationOption.testData.maxGeneration = data.value;
  }

  private execute(): void {
    const customButtonTagsDefinition =
      this.testGenerationOption.customButtonTags.map(
        this.convertTagToButtonDefinition
      );
    const standardButtongTagsDefinition = this.standardButtontags.map(
      this.convertTagToButtonDefinition
    );
    const option = {
      testScript: { ...this.testGenerationOption.testScript },
      testData: this.testGenerationOption.testData,
      buttonDefinitions: [
        ...customButtonTagsDefinition,
        ...standardButtongTagsDefinition,
      ],
    };

    this.$emit("execute", option);

    (async () => {
      await this.$store.dispatch("writeTestScriptOption", {
        option: { buttonDefinitions: customButtonTagsDefinition },
      });

      this.close();
    })();
  }

  private close(): void {
    this.$emit("close");
  }

  private convertButtonDefinitionToTag(
    buttonDefinition: ButtonDefinition
  ): string {
    const attributeText = buttonDefinition.attribute
      ? `${buttonDefinition.attribute.name}=${buttonDefinition.attribute.value}`
      : "";

    if (!attributeText) {
      return buttonDefinition.tagname;
    }

    return [buttonDefinition.tagname, attributeText].join(":");
  }

  private convertTagToButtonDefinition(tag: string) {
    const items = tag.split(":");

    const tagname = items.at(0) ?? "";
    const attributeText = items.at(1);

    if (!attributeText) {
      return { tagname };
    }

    const [name, value] = attributeText?.split("=");

    return { tagname, attribute: { name, value } };
  }

  private errorCaptured(error: Error) {
    if (
      error.message === "Cannot read properties of undefined (reading 'click')"
    ) {
      console.warn(error);
      return false;
    }
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
