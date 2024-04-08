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
  <v-card flat class="pa-0">
    <v-card-text>
      <v-text-field :label="$t('app.url')" v-model="captureOption.url" />
      <v-text-field
        :label="$t('app.test-result-name')"
        v-model="captureOption.testResultName"
      ></v-text-field>
    </v-card-text>

    <v-card-subtitle>
      {{ $t("config-page.device") }}
    </v-card-subtitle>

    <v-card-text>
      <v-select
        :label="$t('config-page.platform')"
        :items="platforms"
        v-model="captureOption.platform"
      ></v-select>

      <v-card class="pa-2 mb-4" variant="outlined" v-show="isMobileSelected">
        <v-card-text>
          <v-btn @click="updateDevices">{{ $t("config-page.update-device") }}</v-btn>
          <v-select
            :label="$t('config-page.select-device')"
            v-model="captureOption.device"
            :items="devices"
            item-title="modelNumber"
            item-value="deviceName"
            :no-data-text="$t('config-page.no-device')"
            return-object
          ></v-select>
          <v-text-field
            :label="$t('config-page.os-version')"
            v-model="captureOption.device.osVersion"
            readonly
          ></v-text-field>
        </v-card-text>
      </v-card>

      <v-select
        :label="$t('config-page.browser')"
        :items="browsers"
        v-model="captureOption.browser"
      ></v-select>

      <number-field
        v-show="isMobileSelected"
        arrowOnly
        @updateNumberFieldValue="
          ({ value }) => {
            captureOption.waitTimeForStartupReload = value;
          }
        "
        :value="captureOption.waitTimeForStartupReload"
        :maxValue="60"
        :minValue="0"
        :label="$t('config-page.reload-setting')"
        :suffix="$t('config-page.reload-suffix')"
      ></number-field>
    </v-card-text>

    <v-card-subtitle>
      {{ $t("config-page.media-type") }}
    </v-card-subtitle>

    <v-card-text class="mb-3">
      <v-radio-group
        v-model="captureOption.mediaType"
        :disabled="isMediaTypeDisabled"
        class="py-0 my-0"
        inline
        :hint="$t('config-page.capture-media-config-hint')"
        persistent-hint
      >
        <v-radio :label="$t('config-page.still-image')" value="image" />
        <v-radio :label="$t('config-page.video')" value="video" />
      </v-radio-group>
    </v-card-text>

    <v-card-subtitle>
      {{ $t("test-option.title") }}
    </v-card-subtitle>

    <v-card-text>
      <v-checkbox
        class="mt-0"
        :label="$t('test-option.use-test-purpose')"
        v-model="captureOption.shouldRecordTestPurpose"
      ></v-checkbox>

      <v-card class="pa-2 mb-4" variant="outlined" v-show="captureOption.shouldRecordTestPurpose">
        <v-card-subtitle>
          {{ $t("test-option.first-test-purpose") }}
        </v-card-subtitle>

        <v-card-text>
          <v-text-field
            :label="$t('note-edit.summary')"
            v-model="captureOption.firstTestPurpose"
          ></v-text-field>
          <v-textarea
            :label="$t('note-edit.details')"
            v-model="captureOption.firstTestPurposeDetails"
          ></v-textarea>
        </v-card-text>
      </v-card>
    </v-card-text>

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </v-card>
</template>

<script lang="ts">
import NumberField from "@/components/molecules/NumberField.vue";
import { type SettingsForRepository } from "latteart-client";
import { type DeviceSettings } from "@/lib/common/settings/Settings";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { type CaptureOptionParams } from "@/lib/common/captureOptionParams";
import { computed, defineComponent, ref, watch } from "vue";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";

export default defineComponent({
  components: {
    "number-field": NumberField,
    "error-message-dialog": ErrorMessageDialog
  },
  setup(_, context) {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const platforms = ref<DeviceSettings["platformName"][]>(["PC", "Android", "iOS"]);

    const devices = ref<{ deviceName: string; modelNumber: string; osVersion: string }[]>([]);

    const projectSettings = computed((): SettingsForRepository | undefined => {
      return rootStore.projectSettings;
    });

    const deviceSettings = computed((): DeviceSettings | undefined => {
      return rootStore.deviceSettings;
    });

    const captureOption = ref<CaptureOptionParams>({
      url: "",
      testResultName: "",
      platform: deviceSettings.value?.platformName ?? "PC",
      device: deviceSettings.value?.device ?? {
        deviceName: "",
        modelNumber: "",
        osVersion: ""
      },
      waitTimeForStartupReload: 0,
      browser: deviceSettings.value?.browser ?? "Chrome",
      mediaType: projectSettings.value?.config.captureMediaSetting.mediaType ?? "image",
      shouldRecordTestPurpose: false,
      firstTestPurpose: "",
      firstTestPurposeDetails: ""
    });

    const browsers = computed((): DeviceSettings["browser"][] => {
      if (captureOption.value.platform === "Android") return ["Chrome"];
      if (captureOption.value.platform === "iOS") return ["Safari"];

      return ["Chrome", "Edge"];
    });

    const isCapturing = computed((): boolean => {
      return captureControlStore.isCapturing;
    });

    const captureArch = computed(() => {
      return projectSettings.value?.config.experimentalFeatureSetting.captureArch ?? "polling";
    });

    const isMediaTypeDisabled = computed(() => {
      return (
        isCapturing.value || captureArch.value === "push" || captureOption.value.platform !== "PC"
      );
    });

    const isMobileSelected = computed(() => {
      return captureOption.value.platform !== "PC";
    });

    const update = (): void => {
      context.emit("update", {
        ...captureOption.value,
        waitTimeForStartupReload: isMobileSelected.value
          ? captureOption.value.waitTimeForStartupReload
          : 0,
        firstTestPurpose: captureOption.value.shouldRecordTestPurpose
          ? captureOption.value.firstTestPurpose
          : "",
        firstTestPurposeDetails: captureOption.value.shouldRecordTestPurpose
          ? captureOption.value.firstTestPurposeDetails
          : ""
      });
    };

    const initializeBrowserSelection = () => {
      captureOption.value.browser = browsers.value[0];
    };

    const updateDevices = async () => {
      try {
        devices.value = [...(await recognizeDevices(captureOption.value.platform))];
        captureOption.value.device = getDefaultDevice(devices.value);
      } catch (error) {
        if (error instanceof Error) {
          errorMessageDialogOpened.value = true;
          errorMessage.value = error.message;

          return;
        }

        throw error;
      }
    };

    const getDefaultDevice = (
      devices: { deviceName: string; modelNumber: string; osVersion: string }[]
    ) => {
      return devices.length > 0 ? devices[0] : { deviceName: "", modelNumber: "", osVersion: "" };
    };

    const recognizeDevices = async (
      platformName: string
    ): Promise<{ deviceName: string; modelNumber: string; osVersion: string }[]> => {
      return captureControlStore.recognizeDevices({
        platformName
      });
    };

    watch(captureOption, update, { deep: true });
    watch(browsers, initializeBrowserSelection);
    watch(() => captureOption.value.platform, updateDevices);

    return {
      t: rootStore.message,
      errorMessageDialogOpened,
      errorMessage,
      platforms,
      devices,
      captureOption,
      browsers,
      isMediaTypeDisabled,
      isMobileSelected,
      updateDevices
    };
  }
});
</script>
