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
  <div>
    <record-start-trigger v-if="!isCapturing">
      <template v-slot:activator="{ on, isDisabled }">
        <v-btn
          :disabled="isDisabled"
          icon
          variant="text"
          size="large"
          color="grey-darken-3"
          @click="openOptionDialog"
          :title="$t('app.start')"
          id="startButton"
          class="mx-1"
        >
          <v-icon>fiber_manual_record</v-icon>
        </v-btn>

        <first-test-purpose-option-dialog
          :opened="optionDialogOpened"
          @close="optionDialogOpened = false"
          @ok="on"
        />
      </template>
    </record-start-trigger>

    <v-btn
      v-else
      icon
      variant="text"
      size="large"
      color="red"
      @click="endCapture"
      :title="$t('app.finish')"
      id="endButton"
      class="mx-2"
    >
      <v-icon>fiber_manual_record</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import RecordStartTrigger from "@/components/organisms/common/RecordStartTrigger.vue";
import FirstTestPurposeOptionDialog from "@/components/organisms/dialog/FirstTestPurposeOptionDialog.vue";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useRootStore } from "@/stores/root";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  components: {
    "first-test-purpose-option-dialog": FirstTestPurposeOptionDialog,
    "record-start-trigger": RecordStartTrigger
  },
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();

    const optionDialogOpened = ref(false);

    const isCapturing = computed((): boolean => {
      return captureControlStore.isCapturing;
    });

    const openOptionDialog = () => {
      optionDialogOpened.value = true;
    };

    const endCapture = (): void => {
      captureControlStore.endCapture();
    };

    return {
      t: rootStore.message,
      optionDialogOpened,
      isCapturing,
      openOptionDialog,
      endCapture
    };
  }
});
</script>
