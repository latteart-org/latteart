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
  <scrollable-dialog :opened="opened">
    <template v-slot:title>
      <v-icon v-if="!!iconText" class="mr-2" large :color="iconColor">{{
        iconText
      }}</v-icon>
      <span>{{ title }}</span>
    </template>
    <template v-slot:content>
      <span class="pre-wrap break-word">{{ message }}</span>
      <a :href="linkUrl" class="px-2" download>{{
        $store.getters.message("common.download-link")
      }}</a>
      <p class="pre-wrap break-word alert-message">{{ alertMessage }}</p>
    </template>
    <template v-slot:footer>
      <v-spacer></v-spacer>
      <v-btn color="blue" dark @click="close()">{{
        $store.getters.message("common.ok")
      }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ScrollableDialog from "@/vue/molecules/ScrollableDialog.vue";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
  },
})
export default class DownloadLinkDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({ type: String, default: "" }) public readonly title!: string;
  @Prop({ type: String, default: "" }) public readonly message!: string;
  @Prop({ type: String, default: "" }) public readonly alertMessage?: string;
  @Prop({ type: String, default: "" }) public readonly linkUrl!: string;
  @Prop({ type: Object, default: null }) public readonly iconOpts!: {
    text: string;
    color?: string;
  } | null;

  private iconText = "";
  private iconColor = "";

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }

    if (this.iconOpts) {
      this.iconText = this.iconOpts.text;
      this.iconColor = this.iconOpts.color ?? "";
    } else {
      this.iconText = "";
      this.iconColor = "";
    }
  }

  private close(): void {
    this.$emit("close");
  }
}
</script>

<style lang="sass">
.alert-message
  color: red
  font-size: small
</style>
