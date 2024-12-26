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
  <v-container fluid class="pa-0">
    <v-radio-group
      v-if="imageFileUrl || videoUrl"
      v-model="mediaType"
      inline
      hide-details
      class="mt-0 mb-3"
    >
      <v-radio
        :label="message ? message('common.image') : $t('common.image')"
        value="image"
        :disabled="!imageFileUrl"
      ></v-radio>
      <v-radio
        :label="message ? message('common.video') : $t('common.video')"
        value="video"
        :disabled="!videoUrl"
      ></v-radio>
    </v-radio-group>

    <popup-image v-show="mediaType === 'image'" :image-file-url="imageFileUrl" />
    <video-display v-show="mediaType === 'video'" :video-url="videoUrl" />
  </v-container>
</template>

<script lang="ts">
import PopupImage from "@/components/molecules/PopupImage.vue";
import VideoDisplay from "@/components/molecules/VideoDisplay.vue";
import { type MessageProvider } from "@/lib/operationHistory/types";
import { defineComponent, ref, type PropType } from "vue";

export default defineComponent({
  components: {
    "popup-image": PopupImage,
    "video-display": VideoDisplay
  },
  props: {
    imageFileUrl: { type: String },
    videoUrl: { type: String },
    message: { type: Function as PropType<MessageProvider> }
  },
  setup(props) {
    const mediaType = ref<"image" | "video" | "video_and_image">("image");

    mediaType.value = props.imageFileUrl ? "image" : "video";

    return {
      mediaType
    };
  }
});
</script>
