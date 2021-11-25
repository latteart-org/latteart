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
  <v-data-table
    :headers-length="headersLength"
    :items="items"
    :headers="addedPaddingCellheaders"
    :sort-icon="sortIcon"
    :hide-actions="hideActions"
    :pagination.sync="paginationSync"
  >
    <template v-for="(slot, name) of $scopedSlots" #[name]="props">
      <slot :name="name" v-bind="props"></slot>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class FixedDataTable extends Vue {
  @Prop({ type: Number, default: undefined })
  public readonly headersLength!: number;

  @Prop({ type: Array, default: [] })
  public readonly items!: [];

  @Prop({ type: Array, default: [] })
  public readonly headers!: {
    value?: string;
    align?: string;
    sortable?: boolean;
    class?: string[];
    text?: string;
    width?: string;
  }[];

  @Prop({ type: String, default: undefined })
  public readonly sortIcon!: undefined;

  @Prop({ type: Boolean, default: false })
  public readonly hideActions!: boolean;

  @Prop({ type: Object, default: undefined })
  public readonly pagination!: {
    descending: boolean;
    page: number;
    rowsPerPage: number;
    sortBy: string;
    totalItems: number;
  };

  @Prop({ type: Number, default: 7 })
  public readonly gridColumnNumber!: number;

  get paginationSync(): {
    descending: boolean;
    page: number;
    rowsPerPage: number;
    sortBy: string;
    totalItems: number;
  } {
    return this.pagination;
  }

  set paginationSync(value: {
    descending: boolean;
    page: number;
    rowsPerPage: number;
    sortBy: string;
    totalItems: number;
  }) {
    this.$emit("update:pagination", value);
  }

  get addedPaddingCellheaders(): {
    value?: string;
    align?: string;
    sortable?: boolean;
    class?: string[];
    text?: string;
    width?: string;
  }[] {
    const result = this.headers.map((header) => header);
    if (result.length < this.gridColumnNumber) {
      result.push({
        sortable: false,
      });
    }

    return result;
  }
}
</script>
