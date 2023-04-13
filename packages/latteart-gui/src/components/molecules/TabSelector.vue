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
  <v-tabs
    dark
    background-color="latteart-main"
    show-arrows
    :value="selectedItemIndex"
  >
    <v-tabs-slider color="yellow"></v-tabs-slider>
    <v-tab dark v-for="item in items" :key="item.id" @click="select(item.id)">
      {{ wordOmitted(item.name, 10) }}
    </v-tab>
  </v-tabs>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class TabSelector extends Vue {
  @Prop({ type: Array, default: [] })
  public readonly items!: { id: string; name: string }[];
  @Prop({ type: String, default: "" })
  public readonly selectedItemId!: string;

  private get selectedItemIndex() {
    const index = this.items.findIndex(
      (item) => item.id === this.selectedItemId
    );

    return index < 0 ? null : index;
  }

  private select(id: string): void {
    this.$emit("select", id);
  }

  private wordOmitted(word: string, length: number): string {
    if (word.length > length) {
      return `${word.substr(0, length)}...`;
    }

    return word;
  }
}
</script>
