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
  <scrollable-dialog :opened="opened" :maxWidth="2000">
    <template v-slot:title>{{
      $store.getters.message("config-view.autoOperation.title")
    }}</template>
    <template v-slot:content>
      <v-data-table
        :headers="headers"
        :items="viewOperations"
        :options.sync="options"
      >
        <template v-slot:items="props">
          <tr>
            <td>{{ props.item.sequence }}</td>
            <td>{{ props.item.title }}</td>
            <td>{{ props.item.url }}</td>
            <td>{{ props.item.tag }}</td>
            <td>{{ props.item.tagname }}</td>
            <td>{{ props.item.text }}</td>
            <td>{{ props.item.type }}</td>
            <td>{{ props.item.input }}</td>
          </tr>
        </template>
      </v-data-table>
    </template>
    <template v-slot:footer>
      <v-spacer></v-spacer>
      <v-btn color="white" @click="close()">{{
        $store.getters.message("common.close")
      }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ScrollableDialog from "@/components/molecules/ScrollableDialog.vue";
import { convertInputValue } from "@/lib/common/util";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
  },
})
export default class AutoOperationDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({ type: Array, default: [] })
  public readonly autoOperations!: OperationForGUI[];
  @Prop({ type: Number, default: 1 })
  private readonly page!: number;
  @Prop({ type: Number, default: -1 })
  private readonly itemsPerPage!: number;

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }
  }

  private options: {
    page: number;
    itemsPerPage: number;
  } = {
    page: this.page,
    itemsPerPage: this.itemsPerPage,
  };

  private get headers() {
    return [
      {
        text: this.$store.getters.message(`operation.sequence`),
        sortable: false,
        value: "sequence",
      },
      {
        text: this.$store.getters.message(`operation.title`),
        sortable: false,
        value: "title",
      },
      {
        text: this.$store.getters.message(`operation.url`),
        sortable: false,
        value: "url",
      },
      {
        text: this.$store.getters.message(`operation.tagname`),
        sortable: false,
        value: "tag",
      },
      {
        text: this.$store.getters.message(`operation.name`),
        sortable: false,
        value: "tagname",
      },
      {
        text: this.$store.getters.message(`operation.text`),
        sortable: false,
        value: "text",
      },
      {
        text: this.$store.getters.message(`operation.type`),
        sortable: false,
        value: "type",
      },
      {
        text: this.$store.getters.message(`operation.input`),
        sortable: false,
        value: "input",
      },
    ];
  }

  private get viewOperations() {
    return this.autoOperations.map((operation, index) => {
      return {
        sequence: index + 1,
        title: operation.title.substring(0, 60),
        url: operation.url,
        tag: operation.elementInfo?.tagname ?? "",
        tagname: operation.elementInfo?.attributes.name ?? "",
        text: operation.elementInfo?.text
          ? operation.elementInfo.text.substring(0, 60)
          : "",
        type: operation.type,
        input: convertInputValue(
          operation.elementInfo,
          operation.input
        ).substring(0, 60),
        iframeIndex: operation.elementInfo?.iframeIndex,
      };
    });
  }

  private async close(): Promise<void> {
    this.$emit("close");
  }
}
</script>
