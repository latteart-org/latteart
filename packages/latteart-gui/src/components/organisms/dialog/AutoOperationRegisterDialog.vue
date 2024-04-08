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
    :title="store.getters.message('auto-operation-register-dialog.title')"
    @accept="
      ok();
      close();
    "
    @cancel="close()"
    :acceptButtonDisabled="okButtonIsDisabled"
  >
    <template>
      <div class="pre-wrap break-word">
        {{ store.getters.message("auto-operation-register-dialog.message") }}
      </div>
      <v-text-field
        v-model="settingName"
        :label="store.getters.message('auto-operation-register-dialog.name')"
      ></v-text-field>
      <v-textarea
        :label="store.getters.message('auto-operation-register-dialog.details')"
        v-model="settingDetails"
      ></v-textarea>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true },
    targetOperations: {
      type: Array as PropType<OperationForGUI[]>,
      default: () => [],
      required: true
    }
  },
  components: {
    "execute-dialog": ExecuteDialog
  },
  setup(props, context) {
    const store = useStore();

    const settingName = ref("");
    const settingDetails = ref("");
    const invalidTypes = ref(["switch_window"]);

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

    const invalidOperations = computed(() => {
      return props.targetOperations.filter((operation) => {
        return invalidTypes.value.includes(operation.type);
      });
    });

    const ok = () => {
      if (invalidOperations.value.length > 0) {
        context.emit("error", invalidTypes.value);
        return;
      }
      const sortedOperations = props.targetOperations
        .sort((a, b) => a.sequence - b.sequence)
        .map((operation) => {
          return {
            input: operation.input,
            type: operation.type,
            elementInfo: operation.elementInfo,
            title: operation.title,
            url: operation.url,
            timestamp: operation.timestamp
          };
        });
      store.dispatch("operationHistory/registerAutoOperation", {
        settingName: settingName.value,
        settingDetails: settingDetails.value,
        operations: sortedOperations
      });

      context.emit("ok");
    };

    const close = (): void => {
      context.emit("close");
    };

    const { opened } = toRefs(props);
    watch(opened, initialize);

    return {
      store,
      settingName,
      settingDetails,
      okButtonIsDisabled,
      ok,
      close
    };
  }
});
</script>
