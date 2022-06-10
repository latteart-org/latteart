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
  <div>
    <v-tooltip bottom v-if="tooltip !== ''">
      <template v-slot:activator="{ on }">
        <v-icon size="16" v-on="on" class="icon-info">info</v-icon>
      </template>
      <span class="description-tooltip">{{ tooltip }}</span>
    </v-tooltip>
    <span :title="text">{{ text }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class LabelWithTooltip extends Vue {
  @Prop({ type: String, default: "" }) public readonly tooltip!: string;
  @Prop({ type: String, default: "" }) public readonly text!: string;
}
</script>

<style lang="sass">
.icon-info
  margin-right: 4px

.description-tooltip
  white-space: pre-wrap
  word-wrap:break-word
</style>
