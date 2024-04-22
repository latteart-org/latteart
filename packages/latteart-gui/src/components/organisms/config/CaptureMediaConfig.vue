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
  <v-container class="mt-0 pt-0">
    <v-row>
      <v-col cols="12">
        <v-radio-group
          :model-value="tempConfig.imageCompression.format"
          class="py-0 my-0"
          :disabled="captureArch === 'push'"
          @update:model-value="changeCaptureFormat"
        >
          <v-radio :label="$t('config-page.png')" value="png"></v-radio>
          <v-radio :label="$t('config-page.webp')" value="webp"></v-radio>
        </v-radio-group>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { type CaptureMediaSetting } from "@/lib/common/settings/Settings";
import { useRootStore } from "@/stores/root";
import { computed, defineComponent, ref, toRefs, watch, type PropType } from "vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, required: true },
    captureMediaSetting: {
      type: Object as PropType<CaptureMediaSetting>,
      default: null,
      required: true
    },
    isCapturing: { type: Boolean, required: true }
  },
  emits: ["save-config"],
  setup(props, context) {
    const rootStore = useRootStore();
    const tempConfig = ref<CaptureMediaSetting>({
      ...props.captureMediaSetting
    });

    const captureArch = computed(() => {
      return rootStore.projectSettings.config.experimentalFeatureSetting.captureArch ?? "polling";
    });

    const updateTempConfig = () => {
      if (!props.opened) {
        tempConfig.value = { ...props.captureMediaSetting };
      }
    };

    const saveConfig = () => {
      if (props.opened) {
        context.emit("save-config", { captureMediaSetting: tempConfig.value });
      }
    };

    const changeCaptureFormat = (format: "png" | "webp" | null) => {
      if (format === null) {
        return;
      }
      tempConfig.value = { ...tempConfig.value, imageCompression: { format } };
    };

    const { captureMediaSetting } = toRefs(props);
    watch(captureMediaSetting, updateTempConfig);
    watch(tempConfig, saveConfig);

    return {
      tempConfig,
      captureArch,
      changeCaptureFormat
    };
  }
});
</script>
