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
  <execute-dialog
    :opened="opened"
    :title="$t('auto-operation-select-dialog.title')"
    :accept-button-disabled="okButtonIsDisabled"
    @accept="
      ok();
      close();
    "
    @cancel="close()"
  >
    <div class="pre-wrap break-word">
      {{ $t("auto-operation-select-dialog.message") }}
    </div>
    <v-select
      v-model="selectedItem"
      variant="underlined"
      :label="$t('common.operation-set-name')"
      :items="selectList"
      item-title="settingName"
      item-value="value"
    ></v-select>
    <v-textarea
      variant="underlined"
      :label="$t('common.operation-set-details')"
      readonly
      no-resize
      :model-value="selectedItem ? selectedItem.details : ''"
    ></v-textarea>
  </execute-dialog>
</template>

<script lang="ts">
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import type { AutoOperationConditionGroup } from "@/lib/common/settings/Settings";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import type { PropType } from "vue";

export default defineComponent({
  components: {
    "execute-dialog": ExecuteDialog
  },
  props: {
    opened: { type: Boolean, default: false, required: true },
    autoOperationConditionGroups: {
      type: Array as PropType<AutoOperationConditionGroup[]>,
      default: () => [],
      required: true
    }
  },
  setup(props, context) {
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
      selectedItem,
      selectList,
      okButtonIsDisabled,
      ok,
      close
    };
  }
});
</script>
