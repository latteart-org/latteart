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
    :title="$t('import-export-dialog.test-result-import-title')"
    @accept="
      execute();
      close();
    "
    @cancel="close()"
    :acceptButtonDisabled="okButtonIsDisabled"
  >
    <v-container id="import-option-dialog">
      <v-row>
        <v-col cols="12">
          {{ $t("import-export-dialog.select-test-result-file-label") }}
        </v-col>

        <v-col cols="12" class="pl-2 pr-2 pt-2">
          <select-file-button
            accept=".zip"
            :details-message="targetFile ? targetFile.name : ''"
            @select="selectImportFile"
          >
            {{ $t("import-export-dialog.select-test-result-file-button") }}
          </select-file-button>
        </v-col>
      </v-row>
    </v-container>
  </execute-dialog>
</template>

<script lang="ts">
import { loadFileAsBase64 } from "@/lib/common/util";
import SelectFileButton from "@/components/molecules/SelectFileButton.vue";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import { useRootStore } from "@/stores/root";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true }
  },
  components: {
    "execute-dialog": ExecuteDialog,
    "select-file-button": SelectFileButton
  },
  setup(props, context) {
    const rootStore = useRootStore();

    const targetFile = ref<File | null>(null);

    const okButtonIsDisabled = computed(() => {
      return !targetFile.value;
    });

    const initialize = () => {
      if (props.opened) {
        targetFile.value = null;
      }
    };

    const selectImportFile = (selectFile: File): void => {
      targetFile.value = selectFile;
    };

    const execute = (): void => {
      if (!targetFile.value) {
        return;
      }

      (async (targetFile) => {
        const file = await loadFileAsBase64(targetFile);

        context.emit("execute", file);

        close();
      })(targetFile.value);
    };

    const close = (): void => {
      context.emit("close");
    };

    const { opened } = toRefs(props);
    watch(opened, initialize);

    return {
      t: rootStore.message,
      targetFile,
      okButtonIsDisabled,
      selectImportFile,
      execute,
      close
    };
  }
});
</script>

<style lang="sass">
#import-option-dialog
  .v-text-field__details
    display: none

  .v-input--selection-controls
    margin-top: 0px

  .v-messages
    display: none

  .v-text-field
    padding-top: 0px
</style>
