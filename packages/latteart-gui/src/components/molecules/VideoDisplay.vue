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
  <div
    :style="{
      position: 'relative',
      display: 'flex',
      'max-height': '100%',
      'aspect-ratio': aspectRatio
    }"
  >
    <video ref="videoRef" controls :style="{ 'max-height': '100%', 'max-width': '100%' }">
      <source type="video/webm" />
    </video>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref, toRefs, watch } from "vue";

export default defineComponent({
  props: {
    videoUrl: { type: String, default: "" },
    pictureInPicture: { type: Boolean, default: false }
  },
  setup(props, context) {
    const aspectRatio = ref(0);
    const videoRef = ref<any>();

    onMounted(() => {
      const video = videoRef.value as HTMLVideoElement;
      video.addEventListener("playing", notifyPlaying);
      video.addEventListener("enterpictureinpicture", notifyEnterPictureInPicture);
      video.addEventListener("leavepictureinpicture", notifyLeavePictureInPicture);
      video.addEventListener("loadedmetadata", updateAspectRatio);
      video.src = props.videoUrl;
    });

    onBeforeUnmount((): void => {
      const video = videoRef.value as HTMLVideoElement;
      video.removeEventListener("playing", notifyPlaying);
      video.removeEventListener("enterpictureinpicture", notifyEnterPictureInPicture);
      video.removeEventListener("leavepictureinpicture", notifyLeavePictureInPicture);
      video.removeEventListener("loadedmetadata", updateAspectRatio);
    });

    const updateVideoUrl = (): void => {
      const videoElement = videoRef.value as HTMLVideoElement;
      videoElement.pause();
      videoElement.src = props.videoUrl;
      videoElement.load();
    };

    const switchPictureInPicture = (): void => {
      if (props.pictureInPicture) {
        enterPictureInPicture();
      } else {
        exitPictureInPicture();
      }
    };

    const updateAspectRatio = () => {
      const videoElement = videoRef.value as HTMLVideoElement;
      console.log("w: " + videoElement.videoWidth);
      console.log("h: " + videoElement.videoHeight);
      aspectRatio.value = videoElement.videoWidth / videoElement.videoHeight;
    };

    const enterPictureInPicture = async (): Promise<void> => {
      if (!document.pictureInPictureElement) {
        const video = videoRef.value as HTMLVideoElement;
        await video.requestPictureInPicture();
      }
    };

    const exitPictureInPicture = async (): Promise<void> => {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
    };

    const notifyPlaying = () => {
      context.emit("playing");
    };

    const notifyEnterPictureInPicture = () => {
      context.emit("enterPictureInPicture");
    };

    const notifyLeavePictureInPicture = () => {
      context.emit("leavePictureInPicture");
    };

    const { videoUrl, pictureInPicture } = toRefs(props);
    watch(videoUrl, updateVideoUrl);
    watch(pictureInPicture, switchPictureInPicture);

    return { aspectRatio, videoRef };
  }
});
</script>
