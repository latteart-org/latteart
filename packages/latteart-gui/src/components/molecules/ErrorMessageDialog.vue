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
  <alert-dialog
    :opened="opened"
    :title="$store.getters.message('common.error-dialog-title')"
    :message="message"
    :iconOpts="{ text: 'cancel', color: 'red' }"
    @close="close()"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import AlertDialog from "@/components/molecules/AlertDialog.vue";

@Component({
  components: {
    "alert-dialog": AlertDialog,
  },
})
export default class ErrorMessageDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({ type: String, default: "" }) public readonly message!: string;

  private close(): void {
    this.$emit("close");
  }
}
</script>
