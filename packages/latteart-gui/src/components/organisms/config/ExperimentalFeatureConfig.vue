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
      <v-col class="pt-0">
        <span style="display: inline-flex; align-items: center"
          ><v-icon color="yellow-darken-3" start>warning</v-icon
          >{{ store.getters.message("config-page.experimental-warning") }}</span
        >
      </v-col>
    </v-row>

    <v-row>
      <v-col class="pt-0">
        <h4>
          {{ store.getters.message("config-page.recording-method") }}
        </h4>
        <v-checkbox
          v-model="captureArch"
          :label="store.getters.message('config-page.capture-arch')"
          :disabled="isCapturing || isReplaying"
          hide-details
          class="py-0 my-0"
          true-value="push"
          false-value="polling"
        >
        </v-checkbox>
        <span class="pl-8">{{ store.getters.message("config-page.attention") }}</span>
        <p class="pl-8">
          {{ store.getters.message("config-page.attention-video") }}
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ExperimentalFeatureSetting } from "@/lib/common/settings/Settings";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, required: true },
    experimentalFeatureSetting: {
      type: Object as PropType<ExperimentalFeatureSetting>,
      default: null,
      required: true
    },
    isCapturing: { type: Boolean, default: true, required: true },
    isReplaying: { type: Boolean, default: true, required: true }
  },
  setup(props, context) {
    const store = useStore();

    const tempConfig = ref<ExperimentalFeatureSetting>({
      ...props.experimentalFeatureSetting
    });

    const updateTempConfig = () => {
      if (!props.opened) {
        tempConfig.value = { ...props.experimentalFeatureSetting };
      }
    };

    const saveConfig = () => {
      if (props.opened) {
        context.emit("save-config", {
          experimentalFeatureSetting: tempConfig.value
        });
      }
    };

    const captureArch = computed({
      get: (): "polling" | "push" => tempConfig.value.captureArch,
      set: (captureArch: "polling" | "push") => {
        tempConfig.value = { ...tempConfig.value, captureArch };
      }
    });

    const { experimentalFeatureSetting } = toRefs(props);
    watch(experimentalFeatureSetting, updateTempConfig);
    watch(tempConfig, saveConfig);

    return {
      store,
      captureArch
    };
  }
});
</script>
