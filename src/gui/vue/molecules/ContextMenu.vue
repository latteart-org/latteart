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
  <v-menu
    v-model="show"
    :position-x="x"
    :position-y="y"
    :top="top"
    close-on-click
    close-on-content-click
  >
    <v-list>
      <v-list-tile
        v-for="item in items"
        :key="item.label"
        @click="item.onClick"
      >
        <v-list-tile-title>{{ item.label }}</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ContextMenu extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({ type: Number, default: 0 }) public readonly x!: number;
  @Prop({ type: Number, default: 0 }) public readonly y!: number;
  @Prop({ type: Boolean, default: false }) public readonly top!: boolean;
  @Prop({ type: Array, default: [] }) public readonly items!: [
    { label: string; onClick: () => void }
  ];

  private get show() {
    return this.opened;
  }

  private set show(opened) {
    if (!opened) {
      this.$emit("contextMenuClose");
    }
  }
}
</script>

<style lang="sass">
.v-list__tile
  font-size: 12px
  height: auto
  padding: 4px 16px

.v-list__tile__title
  height: auto
  line-height: normal
</style>
