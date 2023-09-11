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
    <v-chip
      v-for="(tag, index) in tags"
      :key="index"
      :color="getTagsColor(tag)"
      small
      >{{ tag }}</v-chip
    >
  </div>
</template>

<script lang="ts">
import { noteTagPreset } from "@/lib/operationHistory/NoteTagPreset";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class NoteTagChipGroup extends Vue {
  @Prop({ type: Array, default: [] }) public readonly tags!: [];

  private bugColor = "";
  private tagsColor = noteTagPreset.items.map((item) => {
    if (item.text === "bug") {
      this.bugColor = item.color;
    }
  });

  private getTagsColor(tag: string) {
    return tag === "bug" ? this.bugColor : "";
  }
}
</script>
