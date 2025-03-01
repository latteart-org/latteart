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
    :title="$t('auto-operation-register-dialog.title')"
    :accept-button-disabled="okButtonIsDisabled"
    @accept="
      ok();
      close();
    "
    @cancel="close()"
  >
    <div class="pre-wrap break-word">
      {{ $t("auto-operation-register-dialog.message") }}
    </div>
    <v-text-field
      v-model="settingName"
      variant="underlined"
      :label="$t('common.operation-set-name')"
    ></v-text-field>
    <v-textarea
      v-model="settingDetails"
      variant="underlined"
      :label="$t('common.non-required-details')"
    ></v-textarea>
  </execute-dialog>
</template>

<script lang="ts">
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import type { PropType } from "vue";
import { useOperationHistoryStore } from "@/stores/operationHistory";

export default defineComponent({
  components: {
    "execute-dialog": ExecuteDialog
  },
  props: {
    opened: { type: Boolean, default: false, required: true },
    targetOperations: {
      type: Array as PropType<OperationForGUI[]>,
      default: () => [],
      required: true
    }
  },
  emits: ["ok", "close"],
  setup(props, context) {
    const settingName = ref("");
    const settingDetails = ref("");

    const okButtonIsDisabled = computed(() => {
      return !settingName.value ? true : false;
    });

    const initialize = () => {
      if (!props.opened) {
        return;
      }
      settingName.value = "";
      settingDetails.value = "";
    };

    const ok = () => {
      const sortedOperations = [...props.targetOperations]
        .sort((a, b) => a.sequence - b.sequence)
        .map((operation) => {
          return {
            input: convertInput(operation),
            type: operation.type,
            elementInfo: operation.elementInfo,
            title: operation.title,
            url: operation.url,
            timestamp: operation.timestamp
          };
        });
      useOperationHistoryStore().registerAutoOperation({
        settingName: settingName.value,
        settingDetails: settingDetails.value,
        operations: sortedOperations
      });

      context.emit("ok");
    };

    const close = (): void => {
      context.emit("close");
    };

    const convertInput = (operation: OperationForGUI): string => {
      if (!operation.elementInfo) {
        return "";
      }

      if (
        operation.elementInfo.tagname.toLowerCase() === "input" &&
        !!operation.elementInfo.attributes.type &&
        (operation.elementInfo.attributes.type.toLowerCase() === "checkbox" ||
          operation.elementInfo.attributes.type.toLowerCase() === "radio")
      ) {
        return operation.inputValue;
      }

      return operation.input;
    };

    const { opened } = toRefs(props);
    watch(opened, initialize);

    return {
      settingName,
      settingDetails,
      okButtonIsDisabled,
      ok,
      close
    };
  }
});
</script>
