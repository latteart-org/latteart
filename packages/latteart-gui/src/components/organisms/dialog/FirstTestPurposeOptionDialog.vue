<!--
 Copyright 2025 NTT Corporation.

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
    <execute-dialog
      :opened="opened"
      :title="$t('first-test-purpose-option-dialog.start-testing')"
      :accept-button-disabled="okButtonIsDisabled"
      @accept="
        ok();
        close();
      "
      @cancel="
        cancel();
        close();
      "
    >
      <v-checkbox
        v-model="shouldRecordTestPurpose"
        :label="$t('common.use-test-purpose')"
      ></v-checkbox>

      <v-card flat>
        <v-card-text>
          <h3
            :class="{
              title: true,
              'mb-0': true,
              'text--disabled': !shouldRecordTestPurpose
            }"
          >
            {{ $t("common.first-test-purpose") }}
          </h3>

          <v-text-field
            v-model="firstTestPurpose"
            variant="underlined"
            :disabled="!shouldRecordTestPurpose"
            :label="$t('common.summary')"
          ></v-text-field>
          <v-textarea
            v-model="firstTestPurposeDetails"
            variant="underlined"
            :disabled="!shouldRecordTestPurpose"
            :label="$t('common.non-required-details')"
          ></v-textarea>
        </v-card-text>
      </v-card>
    </execute-dialog>
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { useCaptureControlStore } from "@/stores/captureControl";
import { computed, defineComponent, ref, toRefs, watch } from "vue";

export default defineComponent({
  components: {
    "execute-dialog": ExecuteDialog,
    "error-message-dialog": ErrorMessageDialog
  },
  props: {
    opened: { type: Boolean, default: false, required: true }
  },
  setup(props, context) {
    const captureControlStore = useCaptureControlStore();

    const firstTestPurpose = ref("");
    const firstTestPurposeDetails = ref("");
    const shouldRecordTestPurpose = ref(true);

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const okButtonIsDisabled = computed(() => {
      return shouldRecordTestPurpose.value && !firstTestPurpose.value;
    });

    const initialize = () => {
      if (!props.opened) {
        return;
      }

      firstTestPurpose.value = "";
      firstTestPurposeDetails.value = "";
      shouldRecordTestPurpose.value = true;
    };

    const ok = () => {
      try {
        captureControlStore.testOption = {
          firstTestPurpose: shouldRecordTestPurpose.value ? firstTestPurpose.value : "",
          firstTestPurposeDetails: shouldRecordTestPurpose.value
            ? firstTestPurposeDetails.value
            : "",
          shouldRecordTestPurpose: shouldRecordTestPurpose.value
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
      firstTestPurpose,
      firstTestPurposeDetails,
      shouldRecordTestPurpose,
      errorMessageDialogOpened,
      errorMessage,
      okButtonIsDisabled,
      ok,
      cancel,
      close
    };
  }
});
</script>
