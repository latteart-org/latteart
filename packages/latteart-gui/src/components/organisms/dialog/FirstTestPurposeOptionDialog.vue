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
    <execute-dialog
      :opened="opened"
      :title="$t('test-option.start-testing')"
      @accept="
        ok();
        close();
      "
      @cancel="
        cancel();
        close();
      "
      :acceptButtonDisabled="okButtonIsDisabled"
    >
      <v-checkbox
        :label="$t('test-option.use-test-purpose')"
        v-model="shouldRecordTestPurpose"
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
            {{ $t("test-option.first-test-purpose") }}
          </h3>

          <v-text-field
            :disabled="!shouldRecordTestPurpose"
            :label="$t('note-edit.summary')"
            v-model="firstTestPurpose"
          ></v-text-field>
          <v-textarea
            :disabled="!shouldRecordTestPurpose"
            :label="$t('note-edit.details')"
            v-model="firstTestPurposeDetails"
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
import { useRootStore } from "@/stores/root";
import { computed, defineComponent, ref, toRefs, watch } from "vue";

export default defineComponent({
  props: {
    opened: { type: Boolean, default: false, required: true }
  },
  components: {
    "execute-dialog": ExecuteDialog,
    "error-message-dialog": ErrorMessageDialog
  },
  setup(props, context) {
    const rootStore = useRootStore();
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
      t: rootStore.message,
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
