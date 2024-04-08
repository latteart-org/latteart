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
          @update:model-value="changeCaptureFormat"
          :disabled="captureArch === 'push'"
        >
          <v-radio :label="store.getters.message('config-page.png')" value="png"></v-radio>
          <v-radio :label="store.getters.message('config-page.webp')" value="webp"></v-radio>
        </v-radio-group>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { CaptureMediaSetting } from "@/lib/common/settings/Settings";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

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
  setup(props, context) {
    const store = useStore();

    const tempConfig = ref<CaptureMediaSetting>({
      ...props.captureMediaSetting
    });

    const captureArch = computed(() => {
      return store.state.projectSettings.config.experimentalFeatureSetting.captureArch ?? "polling";
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

    const changeCaptureFormat = (format: "png" | "webp") => {
      tempConfig.value = { ...tempConfig.value, imageCompression: { format } };
    };

    const { captureMediaSetting } = toRefs(props);
    watch(captureMediaSetting, updateTempConfig);
    watch(tempConfig, saveConfig);

    return {
      store,
      tempConfig,
      captureArch,
      changeCaptureFormat
    };
  }
});
</script>
