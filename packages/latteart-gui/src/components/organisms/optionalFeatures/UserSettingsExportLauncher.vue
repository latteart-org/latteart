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
    <v-card-title>{{ $t("user-settings-export-launcher.title") }}</v-card-title>

    <v-card-actions>
      <v-btn variant="elevated" color="primary" @click="exportFile">{{
        $t("common.export-button")
      }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { TimestampImpl } from "@/lib/common/Timestamp";
import { useRootStore } from "@/stores/root";
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    const rootStore = useRootStore();

    const exportFile = () => {
      const exportData = {
        ...rootStore.userSettings,
        locale: rootStore.getLocale()
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `user_settings_${new TimestampImpl().format("YYYYMMDD_HHmmss")}.json`;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    };

    return {
      exportFile
    };
  }
});
</script>
