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
  <scrollable-dialog :opened="opened" :max-width="2000">
    <template #title>{{ $t("auto-operation-dialog.title") }}</template>
    <template #content>
      <v-data-table v-model:options="options" :headers="headers" :items="viewOperations">
        <template #item="props">
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
    <template #footer>
      <v-spacer></v-spacer>
      <v-btn variant="elevated" color="white" @click="close()">{{ $t("common.close") }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import ScrollableDialog from "@/components/molecules/ScrollableDialog.vue";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import type { PropType } from "vue";
import type { AutoOperation } from "@/lib/operationHistory/types";
import { useRootStore } from "@/stores/root";

export default defineComponent({
  components: {
    "scrollable-dialog": ScrollableDialog
  },
  props: {
    opened: { type: Boolean, default: false, required: true },
    autoOperations: {
      type: Array as PropType<AutoOperation[]>,
      default: () => [],
      required: true
    },
    page: { type: Number, default: 1 },
    itemsPerPage: { type: Number, default: -1 }
  },
  emits: ["close"],
  setup(props, context) {
    const t = useRootStore().message;

    const initialize = () => {
      if (!props.opened) {
        return;
      }
    };

    const options = ref<{ page: number; itemsPerPage: number }>({
      page: props.page,
      itemsPerPage: props.itemsPerPage
    });

    const headers = computed(() => {
      return [
        {
          title: t(`common.sequence`),
          sortable: false,
          value: "sequence"
        },
        {
          title: t(`common.page-title`),
          sortable: false,
          value: "title"
        },
        {
          title: t(`common.url`),
          sortable: false,
          value: "url"
        },
        {
          title: t(`common.tagname`),
          sortable: false,
          value: "tag"
        },
        {
          title: t(`common.element-name`),
          sortable: false,
          value: "tagname"
        },
        {
          title: t(`common.text`),
          sortable: false,
          value: "text"
        },
        {
          title: t(`common.type`),
          sortable: false,
          value: "type"
        },
        {
          title: t(`common.input-value`),
          sortable: false,
          value: "input"
        }
      ];
    });

    const viewOperations = computed(() => {
      return props.autoOperations.map((operation, index) => {
        return {
          sequence: index + 1,
          title: operation.title.substring(0, 60),
          url: operation.url,
          tag: operation.elementInfo?.tagname ?? "",
          tagname: operation.elementInfo?.attributes.name ?? "",
          text: operation.elementInfo?.text ? operation.elementInfo.text.substring(0, 60) : "",
          type: operation.type,
          input: operation.input.substring(0, 60),
          iframeIndex: operation.elementInfo?.iframe?.index
        };
      });
    });

    const close = async (): Promise<void> => {
      context.emit("close");
    };

    const { opened } = toRefs(props);
    watch(opened, initialize);

    return {
      options,
      headers,
      viewOperations,
      close
    };
  }
});
</script>
