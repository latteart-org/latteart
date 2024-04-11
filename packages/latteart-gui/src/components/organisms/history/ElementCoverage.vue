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
  <v-container>
    <v-row v-for="(coverage, index) in coverages" :key="index" justify="end" class="py-2">
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-title class="py-4 fullwidth">
            <div class="fullwidth">
              <p class="text-subtitle-1 font-weight-bold mb-0">
                <span class="ellipsis-title" :title="coverage.screenTitle">{{
                  coverage.screenTitle
                }}</span>
              </p>
              coverage: {{ coverage.percentage }} %
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-data-table
              :headers="headers[index]"
              :items="coverage.elements"
              class="elevation-1"
              :items-per-page="-1"
            >
              <template #item="props">
                <tr
                  :key="props.item.id"
                  :class="{
                    covered: props.item.operated,
                    missed: !props.item.operated
                  }"
                  @click="selectElement(props.item)"
                >
                  <td>{{ props.item.tagname }}</td>
                  <td>{{ props.item.type }}</td>
                  <td>{{ props.item.id }}</td>
                  <td>{{ props.item.name }}</td>
                  <td :title="props.item.text" class="w-75">
                    <div class="text-truncate" style="width: inherit">{{ props.item.text }}</div>
                  </td>
                  <td>
                    <v-icon v-if="props.item.operated" size="small" class="mr-2">done</v-icon>
                  </td>
                </tr>
              </template>
              <template #bottom />
            </v-data-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { type MessageProvider } from "@/lib/operationHistory/types";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { type VideoFrame } from "latteart-client";
import { computed, defineComponent, type PropType } from "vue";

export default defineComponent({
  props: {
    message: {
      type: Function as PropType<MessageProvider>,
      required: true
    }
  },
  setup(props) {
    const operationHistoryStore = useOperationHistoryStore();

    const coverages = computed(() => {
      return operationHistoryStore.elementCoverages;
    });

    const headers = computed(() => {
      const headers: Array<Array<{ title: string; value: string; sortable: boolean }>> = [];
      coverages.value.forEach(() => {
        headers.push([
          {
            title: props.message("coverage.tagname"),
            value: "tagname",
            sortable: true
          },
          {
            title: props.message("coverage.type"),
            value: "type",
            sortable: true
          },
          { title: props.message("coverage.id"), value: "id", sortable: true },
          {
            title: props.message("coverage.name"),
            value: "name",
            sortable: true
          },
          {
            title: props.message("coverage.text"),
            value: "text",
            sortable: true
          },
          {
            title: props.message("coverage.operated"),
            value: "operated",
            sortable: true
          }
        ]);
      });
      return headers;
    });

    const selectElement = (element: {
      imageFileUrl?: string;
      videoFrame?: VideoFrame;
      boundingRect?: {
        top: number;
        left: number;
        width: number;
        height: number;
      };
      innerHeight?: number;
      innerWidth?: number;
      outerHeight?: number;
      outerWidth?: number;
    }) => {
      if (element.imageFileUrl || element.videoFrame) {
        operationHistoryStore.changeScreenImage({
          image: {
            imageFileUrl: element.imageFileUrl,
            videoFrame: element.videoFrame
          },
          elementInfo: {
            boundingRect: element.boundingRect,
            innerHeight: element.innerHeight,
            innerWidth: element.innerWidth,
            outerHeight: element.outerHeight,
            outerWidth: element.outerWidth
          }
        });
      } else {
        operationHistoryStore.screenImage == null;
      }
    };

    return {
      coverages,
      headers,
      selectElement
    };
  }
});
</script>

<style lang="sass" scoped>
.fullwidth
  width: 100%
.ellipsis
  overflow: hidden
  white-space: nowrap
  text-overflow: ellipsis
  max-width: 150px
  display: inline-block
.ellipsis-title
  width: 90%
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  display: block
tr
  &.covered
    background-color: #ddffdd
  &.missed
    background-color: #ffdddd !important
</style>
