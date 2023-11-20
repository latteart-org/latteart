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
  <v-container fluid fill-height pa-8 style="overflow-y: scroll">
    <v-container class="align-self-start">
      <v-card class="pa-2">
        <capture-option @update="updateOption" />

        <v-card-actions>
          <record-start-trigger initial>
            <template v-slot:activator="{ on }">
              <v-btn
                :disabled="isExecuteButtonDisabled"
                :dark="!isExecuteButtonDisabled"
                color="primary"
                @click="execute(on)"
                >{{
                  store.getters.message("start-capture-page.execute-button")
                }}</v-btn
              >
            </template>
          </record-start-trigger>
        </v-card-actions>
      </v-card>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import RecordStartTrigger from "@/components/organisms/common/RecordStartTrigger.vue";
import CaptureOption from "@/components/organisms/common/CaptureOption.vue";
import { CaptureOptionParams } from "@/lib/common/captureOptionParams";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";
import { useRoute } from "vue-router/composables";

export default defineComponent({
  components: {
    "record-start-trigger": RecordStartTrigger,
    "capture-option": CaptureOption,
  },
  setup() {
    const store = useStore();
    const route = useRoute();

    const captureOption = ref<CaptureOptionParams>({
      url: "",
      testResultName: "",
      platform: "PC",
      device: { deviceName: "", modelNumber: "", osVersion: "" },
      waitTimeForStartupReload: 0,
      browser: "Chrome",
      mediaType: "image",
      shouldRecordTestPurpose: false,
      firstTestPurpose: "",
      firstTestPurposeDetails: "",
    });

    const updateOption = (option: CaptureOptionParams) => {
      captureOption.value = option;
    };

    const isExecuteButtonDisabled = computed(() => {
      return !captureOption.value.url || !urlIsValid.value;
    });

    const urlIsValid = computed((): boolean => {
      try {
        new URL(captureOption.value.url);
        return true;
      } catch (error) {
        return false;
      }
    });

    const config = computed(() => {
      return store.state.projectSettings.config;
    });

    const execute = async (onStart: () => Promise<void>) => {
      store.commit("captureControl/setUrl", {
        url: captureOption.value.url,
      });
      store.commit("captureControl/setTestResultName", {
        name: captureOption.value.testResultName,
      });
      await store.dispatch("writeDeviceSettings", {
        config: {
          platformName: captureOption.value.platform,
          device: captureOption.value.device,
          browser: captureOption.value.browser,
          waitTimeForStartupReload:
            captureOption.value.waitTimeForStartupReload,
        },
      });
      await store.dispatch("writeConfig", {
        config: {
          ...config.value,
          captureMediaSetting: {
            ...config.value.captureMediaSetting,
            mediaType: captureOption.value.mediaType,
          },
        },
      });
      store.commit("captureControl/setTestOption", {
        testOption: {
          firstTestPurpose: captureOption.value.firstTestPurpose,
          firstTestPurposeDetails: captureOption.value.firstTestPurposeDetails,
          shouldRecordTestPurpose: captureOption.value.shouldRecordTestPurpose,
        },
      });

      await onStart();
    };

    store.dispatch("changeWindowTitle", {
      title: store.getters.message(route.meta?.title ?? ""),
    });

    return {
      store,
      updateOption,
      isExecuteButtonDisabled,
      execute,
    };
  },
});
</script>
