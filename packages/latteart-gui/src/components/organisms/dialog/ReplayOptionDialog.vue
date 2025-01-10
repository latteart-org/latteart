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
  <div>
    <scrollable-dialog :opened="opened">
      <template #title>{{ $t("common.replay") }}</template>
      <template #content>
        <v-checkbox
          v-model="isWaitTimeReproductionEnabled"
          density="comfortable"
          hide-details
          :label="$t('replay-option-dialog.wait-time')"
        />
        <v-checkbox
          v-model="isResultSavingEnabled"
          density="comfortable"
          hide-details
          :label="$t('replay-option-dialog.replay-capture')"
        />

        <v-card flat :disabled="!isResultSavingEnabled">
          <v-card-text>
            <v-text-field
              v-model="testResultName"
              variant="underlined"
              :label="$t('common.test-result-name')"
              hide-details
            />
            <v-checkbox
              v-model="isScreenshotSavingEnabled"
              class="ml-n2"
              density="comfortable"
              hide-details
              :label="$t('replay-option-dialog.take-screenshots')"
            />
            <p v-if="savingReplayResultsWarningMessage !== ''" class="alert-message">
              {{ savingReplayResultsWarningMessage }}
            </p>
          </v-card-text>
        </v-card>

        <v-checkbox
          v-model="isComparisonEnabled"
          density="comfortable"
          :disabled="!isResultSavingEnabled"
          :label="
            $t('replay-option-dialog.replay-compare', {
              sourceTestResultName
            })
          "
        />

        <p class="alert-message">{{ alertMessage }}</p>
      </template>
      <template #footer>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="okButtonIsDisabled"
          variant="elevated"
          color="blue"
          @click="
            ok();
            close();
          "
        >
          {{ $t("common.ok") }}
        </v-btn>
        <v-btn
          variant="elevated"
          @click="
            cancel();
            close();
          "
          >{{ $t("common.cancel") }}</v-btn
        >
      </template>
    </scrollable-dialog>
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import ScrollableDialog from "@/components/molecules/ScrollableDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";

export default defineComponent({
  components: {
    "scrollable-dialog": ScrollableDialog,
    "error-message-dialog": ErrorMessageDialog
  },
  props: {
    opened: { type: Boolean, default: false, required: true }
  },
  emits: ["ok", "cancel", "close"],
  setup(props, context) {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();

    const testResultName = ref("");
    const isWaitTimeReproductionEnabled = ref(false);
    const isResultSavingEnabled = ref(false);
    const isScreenshotSavingEnabled = ref(true);
    const isComparisonEnabled = ref(false);
    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");
    const alertMessage = ref("");

    const okButtonIsDisabled = computed(() => {
      if (isResultSavingEnabled.value) {
        return !testResultName.value ? true : false;
      }
      return false;
    });

    const operations = computed((): OperationForGUI[] => {
      return operationHistoryStore.getOperations();
    });

    const savingReplayResultsWarningMessage = computed((): string => {
      const operationsWithVideo = operations.value.filter((item) => {
        return item.videoFrame;
      });
      return operationsWithVideo.length > 0
        ? rootStore.message("replay-option-dialog.saving-replay-results-warning-message")
        : "";
    });

    const hasIgnoredOperations = computed((): boolean => {
      return operations.value.some(({ type }, index) => {
        if (index > 0 && type === "start_capturing") {
          return true;
        }

        if (type === "pause_capturing") {
          return true;
        }

        return false;
      });
    });

    const sourceTestResultName = computed(() => {
      return operationHistoryStore.testResultInfo.name;
    });

    const initialize = () => {
      if (!props.opened) {
        return;
      }

      testResultName.value = `${sourceTestResultName.value}_re`;
      isResultSavingEnabled.value = false;
      isScreenshotSavingEnabled.value = true;
      isComparisonEnabled.value = false;
      alertMessage.value = hasIgnoredOperations.value
        ? rootStore.message("replay-option-dialog.ignored-operations-alert")
        : "";
    };

    const ok = () => {
      try {
        captureControlStore.replayOption = {
          testResultName: isResultSavingEnabled.value ? testResultName.value : "",
          waitTimeReproductionEnabled: isWaitTimeReproductionEnabled.value,
          resultSavingEnabled: isResultSavingEnabled.value,
          screenshotSavingEnabled: isScreenshotSavingEnabled.value,
          comparisonEnabled: isResultSavingEnabled.value ? isComparisonEnabled.value : false
        };

        context.emit("ok");
      } catch (error) {
        if (error instanceof Error) {
          errorMessage.value = error.message;
          errorMessageDialogOpened.value = true;
        } else {
          throw error;
        }
      }
    };

    const cancel = (): void => {
      context.emit("cancel");
    };

    const close = (): void => {
      context.emit("close");
    };

    const { opened } = toRefs(props);
    watch(opened, initialize);

    return {
      testResultName,
      isWaitTimeReproductionEnabled,
      isResultSavingEnabled,
      isScreenshotSavingEnabled,
      isComparisonEnabled,
      errorMessageDialogOpened,
      errorMessage,
      alertMessage,
      okButtonIsDisabled,
      savingReplayResultsWarningMessage,
      sourceTestResultName,
      ok,
      cancel,
      close
    };
  }
});
</script>

<style lang="sass">
.alert-message
  color: red
  font-size: small
</style>
