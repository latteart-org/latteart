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
    <v-checkbox
      :label="$t('test-result-page.generate-simple-testscript')"
      v-model="testGenerationOption.testScript.isSimple"
    >
    </v-checkbox>
    <v-checkbox v-model="testGenerationOption.testScript.useMultiLocator" class="mt-0">
      <template v-slot:label>
        <div>
          {{ $t("test-result-page.use-multi-locator1") }}
          <a href="https://github.com/latteart-org/multi-locator" target="_blank" @click.stop
            >multi-locator</a
          >{{ $t("test-result-page.use-multi-locator2") }}
        </div>
      </template>
    </v-checkbox>
    <v-container fluid class="pa-1" fill-height id="simple-test-script-generation">
      <v-row>
        <v-col cols="12" class="pb-2">
          <p
            :class="{
              'mb-0': true,
              'text--disabled': testGenerationOption.testScript.isSimple
            }"
          >
            {{ $t("test-result-page.custom-button-definition") }}
          </p>
        </v-col>
        <v-col cols="12" class="pl-2">
          <span
            :class="{
              caption: true,
              'theme--light': true,
              'v-label': true,
              'text--disabled': testGenerationOption.testScript.isSimple
            }"
          >
            {{ $t("test-result-page.custom-button-tags") }}
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-icon size="15" v-bind="props" class="icon-info">info</v-icon>
              </template>
              <span>{{
                $t("test-result-page.default-button-tags", {
                  value: standardButtontags.join(", ")
                })
              }}</span>
            </v-tooltip>
          </span>

          <v-combobox
            :items="customButtonCandidateTags"
            v-model:search-input="search"
            v-model="testGenerationOption.customButtonTags"
            :class="{ 'pt-0': true, 'mt-0': true }"
            multiple
            hide-selected
            closable-chips
            append-icon="refresh"
            @click:append="resetCustomButtonTags"
            @update:model-value="clearSearchText"
            :disabled="testGenerationOption.testScript.isSimple"
          >
            <template v-slot:no-data>
              <v-list-item v-if="search">
                <v-list-item-title>
                  No results matching "<strong>{{ search }}</strong
                  >". Press <kbd>enter</kbd> to create a new one
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-combobox>
        </v-col>
      </v-row>
    </v-container>
    <v-container fluid class="pa-1" fill-height id="max-test-data-generation">
      <v-row>
        <v-col cols="12" class="pb-2">
          <p
            :class="{
              'mb-0': true,
              'text--disabled': testGenerationOption.testScript.isSimple
            }"
          >
            {{ $t("test-result-page.testdata") }}
          </p>
        </v-col>
        <v-col cols="12" class="pl-2">
          <v-checkbox
            :label="$t('test-result-page.method-data-driven')"
            :disabled="testGenerationOption.testScript.isSimple"
            v-model="testGenerationOption.testData.useDataDriven"
          >
          </v-checkbox>
        </v-col>
        <v-col cols="12" class="pl-2">
          <number-field
            :value="testGenerationOption.testData.maxGeneration"
            @updateNumberFieldValue="updateMaxGeneration"
            :label="$t('test-result-page.max-generation')"
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
                testGenerationOption.testScript.isSimple
            }"
            >{{ $t("test-result-page.generate-only-template") }}</span
          >
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import NumberField from "@/components/molecules/NumberField.vue";
import { useRootStore } from "@/stores/root";
import { type TestScriptOption } from "latteart-client";
import { computed, defineComponent, ref, watch } from "vue";

type ButtonDefinition = {
  tagname: string;
  attribute?: { name: string; value: string };
};

export default defineComponent({
  components: {
    "number-field": NumberField
  },
  setup(_, context) {
    const rootStore = useRootStore();

    const search = ref("");

    const customButtonCandidateTags = computed(() => {
      const tags = [
        ...rootStore.projectSettings.defaultTagList,
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
        "INPUT:type=reset"
      ];

      return tags.sort();
    });

    const defaultCustomButtonTags = computed(() => {
      return ["SPAN", "IMG"];
    });

    const standardButtontags = computed(() => {
      return ["INPUT:type=submit", "INPUT:type=button", "BUTTON", "A"];
    });

    const createNewOption = () => {
      return {
        testScript: {
          isSimple: false,
          useMultiLocator: false
        },
        testData: {
          useDataDriven: false,
          maxGeneration: 0
        },
        customButtonTags: defaultCustomButtonTags.value
      };
    };

    const testGenerationOption = ref(createNewOption());

    const clearSearchText = () => {
      search.value = "";
    };

    const resetCustomButtonTags = () => {
      testGenerationOption.value.customButtonTags = defaultCustomButtonTags.value;
    };

    const updateMaxGeneration = (data: { value: number }) => {
      testGenerationOption.value.testData.maxGeneration = data.value;
    };

    const customButtonTagsDefinition = computed(() => {
      return testGenerationOption.value.customButtonTags.map(convertTagToButtonDefinition);
    });

    const update = (): void => {
      const standardButtongTagsDefinition = standardButtontags.value.map(
        convertTagToButtonDefinition
      );
      const option = {
        testScript: { ...testGenerationOption.value.testScript },
        testData: testGenerationOption.value.testData,
        buttonDefinitions: [...customButtonTagsDefinition.value, ...standardButtongTagsDefinition]
      };

      context.emit("update", option);
    };

    const saveCustomButtontagsDefinition = () => {
      rootStore.writeTestScriptOption({
        option: { buttonDefinitions: customButtonTagsDefinition.value }
      });
    };

    const convertButtonDefinitionToTag = (buttonDefinition: ButtonDefinition): string => {
      const attributeText = buttonDefinition.attribute
        ? `${buttonDefinition.attribute.name}=${buttonDefinition.attribute.value}`
        : "";

      if (!attributeText) {
        return buttonDefinition.tagname;
      }

      return [buttonDefinition.tagname, attributeText].join(":");
    };

    const convertTagToButtonDefinition = (tag: string) => {
      const items = tag.split(":");

      const tagname = items.at(0) ?? "";
      const attributeText = items.at(1);

      if (!attributeText) {
        return { tagname };
      }

      const [name, value] = attributeText.split("=");

      return { tagname, attribute: { name, value } };
    };

    watch(testGenerationOption, update, { deep: true });
    watch(() => testGenerationOption.value.customButtonTags, saveCustomButtontagsDefinition, {
      deep: true
    });
    (async () => {
      const option: Pick<TestScriptOption, "buttonDefinitions"> =
        await rootStore.readTestScriptOption();
      if (option.buttonDefinitions) {
        testGenerationOption.value.customButtonTags = option.buttonDefinitions.map(
          convertButtonDefinitionToTag
        );
      }
    })();

    return {
      t: rootStore.message,
      search,
      customButtonCandidateTags,
      standardButtontags,
      testGenerationOption,
      clearSearchText,
      resetCustomButtonTags,
      updateMaxGeneration
    };
  }
});
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
