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
    <v-row
      justify="end"
      v-for="(coverage, index) in coverages"
      :key="index"
      class="py-2"
    >
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-header class="py-4 fullwidth">
            <div class="fullwidth">
              <p class="subtitle-1 font-weight-bold mb-0">
                <span class="ellipsis-title" :title="coverage.screenTitle">{{
                  coverage.screenTitle
                }}</span>
              </p>
              coverage: {{ coverage.percentage }} %
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-data-table
              hide-default-footer
              :headers="headers[index]"
              :items="coverage.elements"
              class="elevation-1"
              :items-per-page="-1"
            >
              <template v-slot:item="props">
                <tr
                  :key="props.item.sequence"
                  :class="{
                    covered: props.item.operated,
                    missed: !props.item.operated,
                  }"
                  @click="selectElement(props.item)"
                >
                  <td>{{ props.item.tagname }}</td>
                  <td>{{ props.item.type }}</td>
                  <td>{{ props.item.id }}</td>
                  <td>{{ props.item.name }}</td>
                  <td :title="props.item.text">
                    <div class="ellipsis">{{ props.item.text }}</div>
                  </td>
                  <td>
                    <v-icon v-if="props.item.operated" small class="mr-2"
                      >done</v-icon
                    >
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { MessageProvider } from "@/lib/operationHistory/types";
import { OperationHistoryState } from "@/store/operationHistory";
import { VideoFrame } from "latteart-client";

@Component
export default class ElementCoverage extends Vue {
  @Prop({ type: Function }) public readonly message!: MessageProvider;

  private get coverages() {
    return (this.$store.state.operationHistory as OperationHistoryState)
      .elementCoverages;
  }

  private get headers() {
    const headers: Array<
      Array<{ text: string; value: string; sortable: boolean }>
    > = [];
    this.coverages.forEach(() => {
      headers.push([
        {
          text: this.message("coverage.tagname"),
          value: "tagname",
          sortable: true,
        },
        { text: this.message("coverage.type"), value: "type", sortable: true },
        { text: this.message("coverage.id"), value: "id", sortable: true },
        { text: this.message("coverage.name"), value: "name", sortable: true },
        { text: this.message("coverage.text"), value: "text", sortable: true },
        {
          text: this.message("coverage.operated"),
          value: "operated",
          sortable: true,
        },
      ]);
    });
    return headers;
  }

  private selectElement(element: {
    imageFileUrl?: string;
    videoFrame?: VideoFrame;
    boundingRect?: { top: number; left: number; width: number; height: number };
    innerHeight?: number;
    innerWidth?: number;
    outerHeight?: number;
    outerWidth?: number;
  }) {
    this.$store.dispatch("operationHistory/changeScreenImage", {
      image: {
        imageFileUrl: element.imageFileUrl,
        videoFrame: element.videoFrame,
      },
      elementInfo: {
        boundingRect: element.boundingRect,
        innerHeight: element.innerHeight,
        innerWidth: element.innerWidth,
        outerHeight: element.outerHeight,
        outerWidth: element.outerWidth,
      },
    });
  }
}
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
