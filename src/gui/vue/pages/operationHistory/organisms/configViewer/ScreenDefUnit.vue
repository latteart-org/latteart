<!--
 Copyright 2021 NTT Corporation.

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
  <div style="margin-bottom: 20px">
    <v-layout align-space-between column>
      <v-card max-width="100%">
        <v-card-text>
          <v-container class="pa-0 ma-0">
            <v-layout row>
              <v-checkbox
                :input-value="conditionGroup.isEnabled"
                @change="(value) => updateEnableScreenDefinitions(value)"
                class="default-flex"
              >
              </v-checkbox>
              <v-text-field
                :label="
                  $store.getters.message('config-view.screen-def.screen-name')
                "
                :value="conditionGroup.screenName"
                @change="(value) => updateScreenName(value)"
              ></v-text-field>
              <v-btn @click="deleteScreenDefinitionConditions" color="error"
                >{{
                  $store.getters.message(
                    "config-view.screen-def.delete-definition"
                  )
                }}
              </v-btn>
            </v-layout>

            <v-layout class="mb-2">
              <v-btn small class="mt-3" @click="addCondition">{{
                $store.getters.message("config-view.screen-def.add-condition")
              }}</v-btn
              ><span class="description">{{
                $store.getters.message("config-view.screen-def.description")
              }}</span>
            </v-layout>

            <v-layout
              v-for="(item, index) in conditionGroup.conditions"
              :key="index"
              row
              class="conditions-area conditions-row"
              align-center
            >
              <v-flex xs1 style="text-align: right">
                <span v-show="index > 0">{{
                  $store.getters.message("config-view.screen-def.and")
                }}</span>
              </v-flex>

              <v-flex xs1 style="text-align: center">
                <v-checkbox
                  :input-value="item.isEnabled"
                  @change="(value) => updateEnableCondition(index, value)"
                  style="display: inline-block"
                ></v-checkbox>
              </v-flex>

              <template v-if="$store.getters.getLocale() === 'ja'">
                <v-flex xs3>
                  <v-select
                    :value="item.definitionType"
                    @change="(value) => updateDefinitionType(index, value)"
                    :items="definitionTypeList"
                    item-text="label"
                    item-value="value"
                    class="select-with-word"
                  ></v-select
                  ><span style="margin-left: 10px">に</span>
                </v-flex>

                <v-flex xs4>
                  <v-text-field
                    :value="item.word"
                    @change="(value) => updateWord(index, value)"
                    class="select-with-word"
                  ></v-text-field>
                  <span style="margin-left: 10px">という</span>
                </v-flex>

                <v-flex xs3>
                  <v-select
                    :value="item.matchType"
                    @change="(value) => updateMatchType(index, value)"
                    :items="matchType"
                    item-text="label"
                    item-value="value"
                  ></v-select>
                </v-flex>
              </template>

              <template v-if="$store.getters.getLocale() === 'en'">
                <v-flex xs3>
                  <v-select
                    :value="item.definitionType"
                    @change="(value) => updateDefinitionType(index, value)"
                    :items="definitionTypeList"
                    item-text="label"
                    item-value="value"
                    class="select-with-word"
                  ></v-select>
                </v-flex>

                <v-flex xs3 class="pr-4">
                  <v-select
                    :value="item.matchType"
                    @change="(value) => updateMatchType(index, value)"
                    :items="matchType"
                    item-text="label"
                    item-value="value"
                  ></v-select>
                </v-flex>

                <v-flex xs4 class="pl-4">
                  <v-text-field
                    :value="item.word"
                    @change="(value) => updateWord(index, value)"
                  ></v-text-field>
                </v-flex>
              </template>

              <v-flex xs1>
                <v-btn
                  v-if="conditionGroup.conditions.length > 1"
                  flat
                  icon
                  @click="deleteCondition(index)"
                  color="error"
                  ><v-icon>delete</v-icon></v-btn
                >
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
      </v-card>
    </v-layout>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { ScreenDefinitionConditionGroup } from "@/lib/operationHistory/types";

@Component
export default class ScreenDefUnit extends Vue {
  @Prop({
    type: Object,
    default: { isEnabled: false, screenName: "", conditions: [] },
  })
  public readonly conditionGroup!: ScreenDefinitionConditionGroup;

  @Prop({ type: Number, default: -1 })
  public readonly index!: number;

  private get definitionTypeList(): { value: string; label: string }[] {
    return [
      {
        value: "url",
        label: this.$store.getters.message("config-view.screen-def.url"),
      },
      {
        value: "title",
        label: this.$store.getters.message("config-view.screen-def.title"),
      },
      {
        value: "keyword",
        label: this.$store.getters.message("config-view.screen-def.keyword"),
      },
    ];
  }

  private get matchType(): { value: string; label: string }[] {
    return [
      {
        value: "contains",
        label: this.$store.getters.message("config-view.screen-def.contains"),
      },
      {
        value: "equals",
        label: this.$store.getters.message("config-view.screen-def.equals"),
      },
      {
        value: "regex",
        label: this.$store.getters.message("config-view.screen-def.regex"),
      },
    ];
  }

  private updateEnableScreenDefinitions(isEnabled: boolean): void {
    const conditionGroup = Object.assign({}, this.conditionGroup);
    conditionGroup.isEnabled = isEnabled;
    this.$emit("update-unit", {
      conditionGroup,
      index: this.index,
    });
  }

  private updateEnableCondition(
    index: number,
    isEnabled: boolean | null
  ): void {
    const conditionGroup = Object.assign({}, this.conditionGroup);
    conditionGroup.conditions[index].isEnabled = isEnabled ?? false;
    this.$emit("update-unit", {
      conditionGroup,
      index: this.index,
    });
  }

  private updateDefinitionType(
    index: number,
    definitionType: "url" | "title" | "keyword"
  ): void {
    const conditionGroup = Object.assign({}, this.conditionGroup);
    conditionGroup.conditions[index].definitionType = definitionType;
    this.$emit("update-unit", {
      conditionGroup,
      index: this.index,
    });
  }

  private updateMatchType(
    index: number,
    matchType: "contains" | "equals" | "regex"
  ): void {
    const conditionGroup = Object.assign({}, this.conditionGroup);
    conditionGroup.conditions[index].matchType = matchType;
    this.$emit("update-unit", {
      conditionGroup,
      index: this.index,
    });
  }

  private updateWord(index: number, word: string): void {
    const conditionGroup = Object.assign({}, this.conditionGroup);
    conditionGroup.conditions[index].word = word;
    this.$emit("update-unit", {
      conditionGroup,
      index: this.index,
    });
  }

  private updateScreenName(screenName: string): void {
    const conditionGroup = Object.assign({}, this.conditionGroup);
    conditionGroup.screenName = screenName;
    this.$emit("update-unit", {
      conditionGroup,
      index: this.index,
    });
  }

  private addCondition(): void {
    const conditionGroup = Object.assign({}, this.conditionGroup);
    conditionGroup.conditions.push({
      isEnabled: true,
      definitionType: "url",
      matchType: "contains",
      word: "",
    });
    this.$emit("update-unit", {
      conditionGroup,
      index: this.index,
    });
  }

  private deleteCondition(conditionIndex: number): void {
    const conditionGroup = Object.assign({}, this.conditionGroup);
    conditionGroup.conditions = conditionGroup.conditions.filter(
      (def, defIndex) => {
        if (defIndex === conditionIndex) {
          return false;
        }
        return true;
      }
    );
    this.$emit("update-unit", {
      conditionGroup,
      index: this.index,
    });
  }

  private deleteScreenDefinitionConditions(): void {
    this.$emit("update-unit", {
      index: this.index,
    });
  }
}
</script>

<style lang="sass" scoped>
.center
  text-align: center

.select-with-word
  display: inline-block
  width: 80%

.conditions-row
  margin: 0 20px 0 40px

.conditions-area-top
  margin-top: 10px
  padding-top: 10px

.conditions-area
  background-color: #FAFAFA

.condition-area-main
  margin-bottom: 20px

.default-flex
  flex: 0 1 auto

.description
  margin-top: 20px
  margin-left: 15px
</style>
