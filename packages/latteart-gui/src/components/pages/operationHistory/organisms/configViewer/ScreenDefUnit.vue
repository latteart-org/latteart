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
  <div class="mt-4">
    <v-row align-content="space-between">
      <v-col cols="12">
        <v-card max-width="100%">
          <v-card-text>
            <v-container>
              <v-row>
                <v-checkbox
                  :input-value="conditionGroup.isEnabled"
                  @change="
                    (value) => updateConditionGroup({ isEnabled: value })
                  "
                  class="default-flex"
                >
                </v-checkbox>
                <v-text-field
                  :label="
                    $store.getters.message('config-view.screen-def.screen-name')
                  "
                  :value="conditionGroup.screenName"
                  @change="
                    (value) => updateConditionGroup({ screenName: value })
                  "
                ></v-text-field>
                <v-btn @click="deleteConditionGroup" color="error"
                  >{{
                    $store.getters.message(
                      "config-view.screen-def.delete-definition"
                    )
                  }}
                </v-btn>
              </v-row>

              <v-row class="mb-2">
                <v-btn small class="mt-3" @click="addCondition">{{
                  $store.getters.message("config-view.screen-def.add-condition")
                }}</v-btn
                ><span class="description">{{
                  $store.getters.message("config-view.screen-def.description")
                }}</span>
              </v-row>

              <v-row
                v-for="(item, index) in conditionGroup.conditions"
                :key="index"
                class="conditions-area conditions-row"
                align="center"
              >
                <v-col cols="1" style="text-align: right">
                  <span v-if="index > 0">{{
                    $store.getters.message("config-view.screen-def.and")
                  }}</span>
                  <span v-else>　　</span>
                </v-col>

                <v-col cols="1" style="text-align: center">
                  <v-checkbox
                    :input-value="item.isEnabled"
                    @change="
                      (value) => updateCondition(index, { isEnabled: value })
                    "
                    style="display: inline-block"
                  ></v-checkbox>
                </v-col>

                <template v-if="$store.getters.getLocale() === 'ja'">
                  <v-col cols="2">
                    <v-select
                      :value="item.definitionType"
                      @change="
                        (value) =>
                          updateCondition(index, { definitionType: value })
                      "
                      :items="definitionTypeList"
                      item-text="label"
                      item-value="value"
                      class="select-with-word"
                    ></v-select
                    ><span style="margin-left: 10px">に</span>
                  </v-col>

                  <v-col cols="4">
                    <v-text-field
                      :value="item.word"
                      @change="
                        (value) => updateCondition(index, { word: value })
                      "
                      class="select-with-word"
                    ></v-text-field>
                    <span style="margin-left: 10px">という</span>
                  </v-col>

                  <v-col cols="3">
                    <v-select
                      :value="item.matchType"
                      @change="
                        (value) => updateCondition(index, { matchType: value })
                      "
                      :items="matchType"
                      item-text="label"
                      item-value="value"
                    ></v-select>
                  </v-col>
                </template>

                <template v-if="$store.getters.getLocale() === 'en'">
                  <v-col cols="3">
                    <v-select
                      :value="item.definitionType"
                      @change="
                        (value) =>
                          updateCondition(index, { definitionType: value })
                      "
                      :items="definitionTypeList"
                      item-text="label"
                      item-value="value"
                      class="select-with-word"
                    ></v-select>
                  </v-col>

                  <v-col cols="3" class="pr-4">
                    <v-select
                      :value="item.matchType"
                      @change="
                        (value) => updateCondition(index, { matchType: value })
                      "
                      :items="matchType"
                      item-text="label"
                      item-value="value"
                    ></v-select>
                  </v-col>

                  <v-col cols="4" class="pl-4">
                    <v-text-field
                      :value="item.word"
                      @change="
                        (value) => updateCondition(index, { word: value })
                      "
                    ></v-text-field>
                  </v-col>
                </template>

                <v-col cols="1">
                  <v-btn
                    v-if="conditionGroup.conditions.length > 1"
                    text
                    icon
                    @click="deleteCondition(index)"
                    color="error"
                    ><v-icon>delete</v-icon></v-btn
                  >
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import {
  ScreenDefinitionConditionGroup,
  ScreenDefinitionType,
  ScreenMatchType,
} from "@/lib/operationHistory/types";

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

  private updateConditionGroup(group: Partial<ScreenDefinitionConditionGroup>) {
    const conditionGroup = {
      ...this.conditionGroup,
      ...group,
    };
    this.$emit("update-condition-group", {
      conditionGroup,
      index: this.index,
    });
  }

  private updateCondition(
    index: number,
    condition: {
      isEnabled?: boolean;
      definitionType?: ScreenDefinitionType;
      matchType?: ScreenMatchType;
      word?: string;
    }
  ): void {
    const conditionGroup = {
      ...this.conditionGroup,
      conditions: this.conditionGroup.conditions.map((c, i) => {
        return i !== index ? c : { ...c, ...condition };
      }),
    };
    this.updateConditionGroup(conditionGroup);
  }

  private addCondition(): void {
    const conditionGroup: ScreenDefinitionConditionGroup = {
      ...this.conditionGroup,
      conditions: [
        ...this.conditionGroup.conditions,
        {
          isEnabled: true,
          definitionType: "url",
          matchType: "contains",
          word: "",
        },
      ],
    };
    this.updateConditionGroup(conditionGroup);
  }

  private deleteCondition(conditionIndex: number): void {
    const conditionGroup = {
      ...this.conditionGroup,
      conditions: this.conditionGroup.conditions.filter(
        (c, i) => i !== conditionIndex
      ),
    };
    this.updateConditionGroup(conditionGroup);
  }

  private deleteConditionGroup(): void {
    this.$emit("delete-condition-group", this.index);
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
