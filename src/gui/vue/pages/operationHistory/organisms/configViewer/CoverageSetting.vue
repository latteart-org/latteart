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
              <v-checkbox v-model="checkBoxList" :value="tag" />
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

  private inclusionTagMap = new Map();
  private tagList = [];

  private get checkBoxList() {
    this.initInclusionTagMap();
    this.$store.state.operationHistory.config.coverage.include.tags.forEach(
      (tag: string) => {
        this.inclusionTagMap.set(tag, true);
      }
    );
    return this.$store.state.operationHistory.config.coverage.include.tags;
  }

  private set checkBoxList(list: string[]) {
    (async () => {
      await this.$store.dispatch("operationHistory/writeSettings", {
        config: {
          coverage: { include: { tags: list } },
        },
      });

      this.$store.commit("operationHistory/setCanUpdateModels", {
        canUpdateModels: true,
      });
    })();
  }

  @Watch("opened")
  private changeOpened(opened: boolean) {
    if (!opened) {
      return;
    }
    this.initInclusionTagMap();
    this.$store.state.operationHistory.config.coverage.include.tags.forEach(
      (tag: string) => {
        this.inclusionTagMap.set(tag, true);
      }
    );

    this.tagList = this.$store.state.operationHistory.displayInclusionList.sort(
      (a: string, b: string) => {
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
      }
    );
  }

  private initInclusionTagMap() {
    const tagMap = new Map();
    this.$store.state.operationHistory.displayInclusionList.forEach(
      (tag: string) => {
        tagMap.set(tag, false);
      }
    );
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
