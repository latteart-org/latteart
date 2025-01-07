<!--
 Copyright 2024 NTT Corporation.

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
  <v-card flat class="pa-2">
    <v-card-title>{{ $t("user-settings-import-launcher.title") }}</v-card-title>
    <v-card-text>
      <select-file-button
        accept=".json"
        :details-message="importTargetFile ? importTargetFile.name : ''"
        @select="selectImportFile"
      >
        {{ $t("user-settings-import-launcher.select-button") }}
      </select-file-button>
      <v-spacer />
    </v-card-text>
    <v-card-actions>
      <v-btn
        variant="elevated"
        :disabled="!importTargetFile"
        color="primary"
        class="d-flex align-center my-4"
        @click="importFile"
        >{{ $t("common.import-button") }}</v-btn
      >
    </v-card-actions>
    <information-message-dialog
      :opened="dialogOpened"
      :title="$t('user-settings-import-launcher.title')"
      :message="$t('user-settings-import-launcher.succeeded')"
      @close="dialogOpened = false"
    />
  </v-card>
</template>

<script lang="ts">
import SelectFileButton from "@/components/molecules/SelectFileButton.vue";
import { validateUserSettings } from "@/lib/common/settings/validateUserSettings";
import type { UserSettings } from "@/lib/common/settings/Settings";
import { useRootStore } from "@/stores/root";
import { defineComponent, ref } from "vue";
import InformationMessageDialog from "@/components/molecules/InformationMessageDialog.vue";

export default defineComponent({
  components: {
    "select-file-button": SelectFileButton,
    "information-message-dialog": InformationMessageDialog
  },
  setup() {
    const rootStore = useRootStore();
    const importTargetFile = ref<File | null>(null);

    const dialogOpened = ref(false);

    const selectImportFile = (targetFile: File): void => {
      importTargetFile.value = targetFile;
    };

    const loadFile = (targetFile: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result ? reader.result.toString() : "";

          resolve(result);
        };

        reader.readAsText(targetFile);
      });
    };

    const importFile = () => {
      if (!importTargetFile.value) {
        return;
      }

      const targetFile = importTargetFile.value;
      (async () => {
        try {
          const data = await loadFile(targetFile);
          const userSettings = JSON.parse(data) as UserSettings;
          if (!validateUserSettings(userSettings)) {
            throw new Error(rootStore.message("user-settings-import-launcher.invalid-file-format"));
          }
          rootStore.writeUserSettings({ userSettings });

          dialogOpened.value = true;
        } catch (error) {
          if (error instanceof Error) {
            console.error(error);
            throw new Error(rootStore.message("user-settings-import-launcher.invalid-file-format"));
          }
          throw error;
        }
      })();
    };

    return {
      dialogOpened,
      importTargetFile,
      importFile,
      selectImportFile
    };
  }
});
</script>
