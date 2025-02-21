<!--
 Copyright 2025 NTT Corporation.

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
  <v-row class="d-flex justify-center" style="flex-wrap: nowrap">
    <div v-for="(legend, index) in legendInfos" :key="index" class="manage-show-legend">
      <v-card class="pt-0 my-3">
        <v-card-title primary-title class="py-2 my-0" :class="legend.class">
          <p class="card-center">{{ legend.status }}</p>
        </v-card-title>
      </v-card>
      <p>{{ legend.text }}</p>
    </div>

    <div class="manage-show-legend mt-4">
      {{ $t("legend-viewer.legend1") }}<br />
      {{ $t("legend-viewer.legend2") }}<br />
      {{ $t("legend-viewer.legend3") }}<br />
    </div>
  </v-row>
</template>

<script lang="ts">
import { useRootStore } from "@/stores/root";
import { computed, defineComponent } from "vue";

export default defineComponent({
  setup() {
    const rootStore = useRootStore();

    const legendInfos = computed(
      (): {
        status: string;
        text: string;
        class: string;
      }[] => {
        return [
          {
            status: rootStore.message("common.status-ok"),
            text: rootStore.message("legend-viewer.text-ok"),
            class: "status-fine"
          },
          {
            status: rootStore.message("common.status-out-of-scope"),
            text: rootStore.message("legend-viewer.text-out-of-scope"),
            class: "status-fine"
          },
          {
            status: rootStore.message("common.status-ng"),
            text: rootStore.message("legend-viewer.text-ng"),
            class: "status-ng"
          },
          {
            status: rootStore.message("common.status-ongoing"),
            text: rootStore.message("legend-viewer.text-ongoing"),
            class: "status-warn"
          },
          {
            status: rootStore.message("common.status-pending"),
            text: rootStore.message("legend-viewer.text-pending"),
            class: "status-warn"
          }
        ];
      }
    );

    return {
      legendInfos
    };
  }
});
</script>

<style lang="sass" scoped>
.card-center
  margin: auto
  text-align: center
  font-size: medium

.manage-show-legend
  margin: 0px 10px
  padding-top: 10px
  width: 150px
  color: #ffffff

.status-fine
  background-color: #DEF9CD,
  color: #690,
  font-weight: bold

.status-ng
  background-color: #FBE0E5
  color: #c00
  font-weight: bold

.status-warn
  background-color: #FBE9E0
  color: #EA5F1A
  font-weight: bold
</style>
