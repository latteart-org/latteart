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
  <v-layout wrap px-4>
    <div class="head-label">
      {{ $store.getters.message("config-view.include-coverage") }}
    </div>
    <v-flex v-if="tagList.length <= 0">
      <v-card color="#EEE">
        <v-card-text>
          <v-layout align-center>
            <v-flex ma-3> NO DATA </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-flex>
    <v-flex style="width: 150px" v-for="tag in tagList" v-bind:key="tag" pa-1>
      <v-card class="ma-1 pa-1" color="#EEE">
        <v-card-text class="my-0 py-0">
          <v-layout align-center ma-0 pa-0>
            <v-flex xs10 ma-0 pa-0 class="tagName">
              {{ tag }}
            </v-flex>
            <v-flex xs2 ma-0 pa-0 align-right>
              <v-checkbox v-model="tags" :value="tag" />
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class CoverageSetting extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({ type: Array, default: () => [] })
  public readonly includeTags!: string[];
  @Prop({ type: Array, default: () => [] }) public defaultTagList!: string[];

  private inclusionTagMap = new Map();
  private tags: string[] = [];
  private displayInclusionList: string[] = [];
  private tagList: string[] = [];

  @Watch("includeTags")
  private changeIncludeTags() {
    this.tags = this.includeTags;
    this.displayInclusionList = Array.from(
      new Set(this.tags.concat(this.defaultTagList))
    );
    this.createInclusionTagMap();
  }

  @Watch("tags")
  private saveTags() {
    this.$emit("save-config", {
      coverage: { include: { tags: this.tags } },
    });
    this.createInclusionTagMap();
  }

  @Watch("opened")
  private updateTagList(opened: boolean) {
    if (!opened) {
      return;
    }

    this.tagList = this.displayInclusionList.sort((a: string, b: string) => {
      const aVal = this.inclusionTagMap.get(a);
      const bVal = this.inclusionTagMap.get(b);
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
    });
  }

  private createInclusionTagMap() {
    const tagMap = new Map();
    this.displayInclusionList.forEach((tag: string) => {
      tagMap.set(tag, false);
    });
    this.tags.forEach((tag) => {
      tagMap.set(tag, true);
    });
    this.inclusionTagMap = tagMap;
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
