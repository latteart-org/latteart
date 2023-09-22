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
  <v-container fluid pa-0>
    <v-radio-group
      v-model="mediaType"
      row
      hide-details
      class="mt-0 mb-3"
      v-if="imageFileUrl || videoUrl"
    >
      <v-radio
        :label="$store.getters.message('media-display-group.image')"
        value="image"
        :disabled="!imageFileUrl"
      ></v-radio>
      <v-radio
        :label="$store.getters.message('media-display-group.video')"
        value="video"
        :disabled="!videoUrl"
      ></v-radio>
    </v-radio-group>

    <popup-image v-show="mediaType === 'image'" :imageFileUrl="imageFileUrl" />
    <video-display v-show="mediaType === 'video'" :videoUrl="videoUrl" />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import PopupImage from "@/components/molecules/PopupImage.vue";
import VideoDisplay from "@/components/molecules/VideoDisplay.vue";

@Component({
  components: {
    "popup-image": PopupImage,
    "video-display": VideoDisplay,
  },
})
export default class MediaDisplayGroup extends Vue {
  @Prop({ type: String }) imageFileUrl?: string;
  @Prop({ type: String }) videoUrl?: string;

  private mediaType: "image" | "video" = "image";

  created() {
    this.mediaType = this.imageFileUrl ? "image" : "video";
  }
}
</script>
