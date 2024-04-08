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
  <execute-dialog
    :opened="opened"
    :title="$t('auto-operation-select-dialog.title')"
    @accept="
      ok();
      close();
    "
    @cancel="close()"
    :acceptButtonDisabled="okButtonIsDisabled"
  >
    <template>
      <div class="pre-wrap break-word">
        {{ $t("auto-operation-select-dialog.message") }}
      </div>
      <v-select
        :label="$t('auto-operation-select-dialog.name')"
        :items="selectList"
        v-model="selectedItem"
        item-title="settingName"
        item-value="value"
      ></v-select>
      <v-textarea
        :label="$t('auto-operation-select-dialog.details')"
        readonly
        no-resize
        :model-value="selectedItem ? selectedItem.details : ''"
      ></v-textarea>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { type AutoOperationConditionGroup } from "@/lib/operationHistory/types";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import type { PropType } from "vue";
import { useRootStore } from "@/stores/root";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true },
    autoOperationConditionGroups: {
      type: Array as PropType<AutoOperationConditionGroup[]>,
      default: () => [],
      required: true
    }
  },
  components: {
    "execute-dialog": ExecuteDialog
  },
  setup(props, context) {
    const rootStore = useRootStore();

    const selectedItem = ref<{
      index: number;
      setingName: string;
      details: string;
    } | null>(null);

    const selectList = computed(() => {
      return props.autoOperationConditionGroups.map((group, index) => {
        return {
          settingName: group.settingName,
          value: { index, details: group.details }
        };
      });
    });

    const okButtonIsDisabled = computed(() => {
      return selectedItem.value === null;
    });

    const initialize = () => {
      if (!props.opened) {
        return;
      }
      selectedItem.value = null;
    };

    const ok = async (): Promise<void> => {
      context.emit("ok", selectedItem.value?.index);
    };

    const close = async (): Promise<void> => {
      context.emit("close");
    };

    const { opened } = toRefs(props);
    watch(opened, initialize);

    return {
      t: rootStore.message,
      selectedItem,
      selectList,
      okButtonIsDisabled,
      ok,
      close
    };
  }
});
</script>
