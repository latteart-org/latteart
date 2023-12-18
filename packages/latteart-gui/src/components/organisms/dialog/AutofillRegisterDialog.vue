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
    :title="store.getters.message('autofill-register-dialog.title')"
    @accept="
      accept();
      close();
    "
    @cancel="close()"
  >
    <template>
      <div class="pre-wrap break-word">
        {{ message }}
      </div>
      <v-text-field
        v-model="settingName"
        :label="store.getters.message('autofill-register-dialog.form-label')"
      ></v-text-field>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { AutofillConditionGroup } from "@/lib/operationHistory/types";
import { CaptureControlState } from "@/store/captureControl";
import { computed, defineComponent, ref, nextTick } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  components: {
    "execute-dialog": ExecuteDialog,
  },
  setup() {
    const store = useStore();

    const settingName = ref("");
    const opened = ref(false);

    const autofillRegisterDialogData = computed(
      (): {
        title: string;
        url: string;
        message: string;
        inputElements: {
          xpath: string;
          attributes: { [key: string]: string };
          inputValue: string;
          iframeIndex?: number;
        }[];
        callback: () => void;
      } | null => {
        settingName.value =
          ((store.state as any).captureControl as CaptureControlState)
            ?.autofillRegisterDialogData?.title ?? "";
        opened.value = !!(
          (store.state as any).captureControl as CaptureControlState
        )?.autofillRegisterDialogData;
        return (
          ((store.state as any).captureControl as CaptureControlState)
            ?.autofillRegisterDialogData ?? null
        );
      }
    );

    const message = computed((): string => {
      return autofillRegisterDialogData.value?.message ?? "";
    });

    const accept = async (): Promise<void> => {
      const autofillConditionGroup: AutofillConditionGroup = {
        isEnabled: true,
        settingName: settingName.value,
        url: autofillRegisterDialogData.value?.url ?? "",
        title: autofillRegisterDialogData.value?.title ?? "",
        inputValueConditions: (
          autofillRegisterDialogData.value?.inputElements ?? []
        )
          .filter((element) => {
            return element.attributes.type !== "hidden";
          })
          .map((element) => {
            return {
              isEnabled: true,
              locator: element.attributes.id ?? element.xpath,
              locatorType: element.attributes.id ? "id" : "xpath",
              locatorMatchType: "equals",
              inputValue: element.inputValue,
              iframeIndex: element.iframeIndex,
            };
          }),
      };
      store.dispatch("operationHistory/updateAutofillConditionGroup", {
        conditionGroup: autofillConditionGroup,
        index: -1,
      });
      await close();
    };

    const close = async (): Promise<void> => {
      opened.value = false;
      await new Promise((s) => setTimeout(s, 300));
      const callback = autofillRegisterDialogData.value?.callback;
      store.commit("captureControl/setAutofillRegisterDialog", null);
      if (callback) {
        nextTick(() => {
          callback();
        });
      }
    };

    return {
      store,
      settingName,
      opened,
      message,
      accept,
      close,
    };
  },
});
</script>
