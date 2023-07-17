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
    {{ currentFrameLabel }}
  </div>
</template>

<script lang="ts">
import { CaptureControlState } from "@/store/captureControl";
import { Component, Vue } from "vue-property-decorator";

@Component
export default class CurrentFrameInfo extends Vue {
  private get currentFrameLabel(): string {
    const label = (this.$store.state.captureControl as CaptureControlState)
      .currentFrame.label;
    return label !== "" ? label : "default frame";
  }
}
</script>
