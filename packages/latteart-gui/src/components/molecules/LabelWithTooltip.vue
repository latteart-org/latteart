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
  <div>
    <div class="container">
      <p :title="title" class="label pt-0">{{ title }}</p>
      <v-tooltip location="end" v-if="tooltip !== ''">
        <template v-slot:activator="{ props }">
          <v-icon size="16" v-bind="props" class="icon-info">info</v-icon>
        </template>
        <span class="description-tooltip">{{ tooltip }}</span>
      </v-tooltip>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    tooltip: { type: String, default: "", required: true },
    title: { type: String, default: "", required: true }
  }
});
</script>

<style lang="sass" scoped>
.container
  display: flex
  flex-direction: row
  flex-wrap: nowrap
  justify-content: center

.label
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  padding-top: 16px
  size: 12px
  font-weight: normal

.icon-info
  margin-right: 4px

.description-tooltip
  white-space: pre-wrap
  word-wrap: break-word
</style>
