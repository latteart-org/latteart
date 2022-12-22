<!--
 Copyright 2022 NTT Corporation.

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
      :title="$store.getters.message('test-option.start-testing')"
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
      <template>
        <v-checkbox
          :label="$store.getters.message('test-option.use-test-purpose')"
          v-model="shouldRecordTestPurpose"
        ></v-checkbox>

        <v-card flat>
          <v-card-text>
            <h3
              :class="{
                title: true,
                'mb-0': true,
                'text--disabled': !shouldRecordTestPurpose,
              }"
            >
              {{ $store.getters.message("test-option.first-test-purpose") }}
            </h3>

            <v-text-field
              :disabled="!shouldRecordTestPurpose"
              :label="$store.getters.message('note-edit.summary')"
              v-model="firstTestPurpose"
            ></v-text-field>
            <v-textarea
              :disabled="!shouldRecordTestPurpose"
              :label="$store.getters.message('note-edit.details')"
              v-model="firstTestPurposeDetails"
            ></v-textarea>
          </v-card-text>
        </v-card>
      </template>
    </execute-dialog>
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import NumberField from "@/components/molecules/NumberField.vue";
import ErrorMessageDialog from "@/components/pages/common/ErrorMessageDialog.vue";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";

@Component({
  components: {
    "number-field": NumberField,
    "execute-dialog": ExecuteDialog,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class TestOptionDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private firstTestPurpose = "";
  private firstTestPurposeDetails = "";
  private shouldRecordTestPurpose = true;

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private get okButtonIsDisabled() {
    return this.shouldRecordTestPurpose && !this.firstTestPurpose;
  }

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }

    this.firstTestPurpose = "";
    this.firstTestPurposeDetails = "";
    this.shouldRecordTestPurpose = true;
  }

  private ok() {
    try {
      this.$store.commit("captureControl/setTestOption", {
        testOption: {
          firstTestPurpose: this.shouldRecordTestPurpose
            ? this.firstTestPurpose
            : "",
          firstTestPurposeDetails: this.shouldRecordTestPurpose
            ? this.firstTestPurposeDetails
            : "",
          shouldRecordTestPurpose: this.shouldRecordTestPurpose,
        },
      });

      this.$emit("ok");
    } catch (error) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
        this.errorMessageDialogOpened = true;
      } else {
        throw error;
      }
    }
  }

  private cancel(): void {
    this.$emit("cancel");
  }

  private close(): void {
    this.$emit("close");
  }
}
</script>
