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
    <v-col v-if="tempTagList.length <= 0">
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
      v-for="tag in tempTagList"
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
              <v-checkbox v-model="tempTags" :value="tag" />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class CoverageConfig extends Vue {
  @Prop({ type: Boolean, required: true }) public readonly opened!: boolean;
  @Prop({ type: Array, required: true })
  public readonly includeTags!: string[];
  @Prop({ type: Array, required: true }) public defaultTagList!: string[];

  private tempInclusionTagMap = new Map();
  private tempTags: string[] = [];
  private tempDisplayInclusionList: string[] = [];
  private tempTagList: string[] = [];

  created(): void {
    this.updateTempTagsAndTempDisplayInclusionList();
  }

  @Watch("includeTags")
  private updateTempConfig() {
    if (!this.opened) {
      this.updateTempTagsAndTempDisplayInclusionList();
    }
  }

  private updateTempTagsAndTempDisplayInclusionList() {
    this.tempTags = [...this.includeTags];
    this.tempDisplayInclusionList = Array.from(
      new Set(this.tempTags.concat(this.defaultTagList))
    );
    this.createInclusionTagMap();
  }

  @Watch("tempTags")
  private saveTags() {
    if (this.opened) {
      this.$emit("save-config", {
        coverage: { include: { tags: this.tempTags } },
      });
    }
    this.createInclusionTagMap();
  }

  @Watch("opened")
  private updateTagList(opened: boolean) {
    if (!opened) {
      return;
    }

    this.tempTagList = this.tempDisplayInclusionList.sort(
      (a: string, b: string) => {
        const aVal = this.tempInclusionTagMap.get(a);
        const bVal = this.tempInclusionTagMap.get(b);
        if (!!aVal > !!bVal) {
          return -1;
        } else if (!!aVal < !!bVal) {
          return 1;
        }
        if (a < b) {
          return -1;
        } else if (a > b) {
          return 1;
        }
        return 0;
      }
    );
  }

  private createInclusionTagMap() {
    const tagMap = new Map();
    this.tempDisplayInclusionList.forEach((tag: string) => {
      tagMap.set(tag, false);
    });
    this.tempTags.forEach((tag) => {
      tagMap.set(tag, true);
    });
    this.tempInclusionTagMap = tagMap;
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
