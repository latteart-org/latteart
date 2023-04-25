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
  <v-row class="px-4">
    <div class="head-label">
      {{ $store.getters.message("config-view.include-coverage") }}
    </div>
    <v-col v-if="displayedTagList <= 0">
      <v-card color="#EEE">
        <v-card-text>
          <v-row align="center">
            <v-col class="ma-3"> NO DATA </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col
      cols="1"
      style="width: 150px"
      v-for="tag in displayedTagList"
      v-bind:key="tag"
      class="pa-1"
    >
      <v-card class="ma-1 pa-1" color="#EEE">
        <v-card-text class="my-0 py-0">
          <v-row align="center" class="ma-0 pa-0">
            <v-col cols="10" class="tagName ma-0 pa-0">
              {{ tag }}
            </v-col>
            <v-col cols="2" class="ma-0 pa-0">
              <v-checkbox
                v-model="tempIncludeTags"
                :value="tag"
                @click="changeValue(tag)"
                readonly
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class CoverageConfig extends Vue {
  @Prop({ type: Boolean, required: true }) public readonly opened!: boolean;
  @Prop({ type: Array, required: true })
  public readonly includeTags!: string[]; // 計算対象のタグ
  @Prop({ type: Array, required: true }) public defaultTagList!: string[]; // データ取得対象のタグ（固定）

  private tempIncludeTags = this.includeTags;

  get displayedTagList() {
    const sortFunc = (a: string, b: string) => {
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      }
      return 0;
    };

    return [
      ...this.tempIncludeTags.sort(sortFunc),
      ...this.defaultTagList
        .filter((defaultTag) => !this.tempIncludeTags.includes(defaultTag))
        .sort(sortFunc),
    ];
  }

  private changeValue(tag: string): void {
    if (this.opened) {
      const hasTag = this.tempIncludeTags.includes(tag);
      const tags = hasTag
        ? this.tempIncludeTags.filter((t) => t !== tag)
        : [...this.tempIncludeTags, tag];
      this.$emit("save-config", {
        coverage: { include: { tags } },
      });
      this.tempIncludeTags = tags;
    }
  }
}
</script>

<style lang="sass" scoped>
.tagName
  word-break: break-all

.head-label
  width: 100%
  padding-left: 5px
</style>
