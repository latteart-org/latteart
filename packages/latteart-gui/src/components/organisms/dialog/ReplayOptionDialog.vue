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
    <scrollable-dialog :opened="opened">
      <template v-slot:title>{{
        store.getters.message("replay-option.start-replay")
      }}</template>
      <template v-slot:content>
        <v-checkbox
          :label="store.getters.message('replay-option.replay-capture')"
          v-model="isResultSavingEnabled"
          hide-details
        ></v-checkbox>

        <v-card flat>
          <v-card-text>
            <v-text-field
              :disabled="!isResultSavingEnabled"
              :label="store.getters.message('replay-option.test-result-name')"
              v-model="testResultName"
              hide-details
            ></v-text-field>
          </v-card-text>
        </v-card>

        <p
          v-if="savingReplayResultsWarningMessage !== ''"
          class="alert-message"
        >
          {{ savingReplayResultsWarningMessage }}
        </p>

        <v-checkbox
          :disabled="!isResultSavingEnabled"
          :label="
            store.getters.message('replay-option.replay-compare', {
              sourceTestResultName,
            })
          "
          v-model="isComparisonEnabled"
        ></v-checkbox>

        <p class="alert-message">{{ alertMessage }}</p>
      </template>
      <template v-slot:footer>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="okButtonIsDisabled"
          :dark="!okButtonIsDisabled"
          color="blue"
          @click="
            ok();
            close();
          "
        >
          {{ store.getters.message("common.ok") }}
        </v-btn>
        <v-btn
          @click="
            cancel();
            close();
          "
          >{{ store.getters.message("common.cancel") }}</v-btn
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
import { OperationHistoryState } from "@/store/operationHistory";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true },
  },
  components: {
    "scrollable-dialog": ScrollableDialog,
    "error-message-dialog": ErrorMessageDialog,
  },
  setup(props, context) {
    const store = useStore();

    const testResultName = ref("");
    const isResultSavingEnabled = ref(false);
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

    const savingReplayResultsWarningMessage = computed((): string => {
      return store.state.projectSettings.config.captureMediaSetting
        .mediaType === "video"
        ? store.getters.message(
            "replay-option.saving-replay-results-warning-message"
          )
        : "";
    });

    const hasIgnoredOperations = computed((): boolean => {
      const operations: OperationForGUI[] =
        store.getters["operationHistory/getOperations"]();

      return operations.some(({ type }, index) => {
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
      return ((store.state as any).operationHistory as OperationHistoryState)
        .testResultInfo.name;
    });

    const initialize = () => {
      if (!props.opened) {
        return;
      }

      testResultName.value = `${sourceTestResultName.value}_re`;
      isResultSavingEnabled.value = false;
      isComparisonEnabled.value = false;
      alertMessage.value = hasIgnoredOperations.value
        ? store.getters.message("replay-option.ignored-operations-alert")
        : "";
    };

    const ok = () => {
      try {
        store.commit("captureControl/setReplayOption", {
          replayOption: {
            testResultName: isResultSavingEnabled.value
              ? testResultName.value
              : "",
            resultSavingEnabled: isResultSavingEnabled.value,
            comparisonEnabled: isResultSavingEnabled.value
              ? isComparisonEnabled.value
              : false,
          },
        });

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
      store,
      testResultName,
      isResultSavingEnabled,
      isComparisonEnabled,
      errorMessageDialogOpened,
      errorMessage,
      alertMessage,
      okButtonIsDisabled,
      savingReplayResultsWarningMessage,
      sourceTestResultName,
      ok,
      cancel,
      close,
    };
  },
});
</script>

<style lang="sass">
.alert-message
  color: red
  font-size: small
</style>
