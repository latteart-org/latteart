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
      'aspect-ratio': aspectRatio,
    }"
  >
    <video
      ref="video"
      controls
      :style="{ 'max-height': '100%', 'max-width': '100%' }"
    >
      <source type="video/webm" />
    </video>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component, Watch } from "vue-property-decorator";
@Component
export default class VideoDisplay extends Vue {
  @Prop({ type: String, default: "" })
  public readonly videoUrl!: string;
  @Prop({ type: Boolean, default: false })
  public readonly pictureInPicture!: boolean;
  private aspectRatio = 0;
  mounted() {
    const video = this.$refs.video as HTMLVideoElement;
    video.addEventListener("playing", this.notifyPlaying);
    video.addEventListener(
      "enterpictureinpicture",
      this.notifyEnterPictureInPicture
    );
    video.addEventListener(
      "leavepictureinpicture",
      this.notifyLeavePictureInPicture
    );
    video.addEventListener("loadedmetadata", this.updateAspectRatio);
    video.src = this.videoUrl;
  }
  beforeDestroy() {
    const video = this.$refs.video as HTMLVideoElement;
    video.removeEventListener("playing", this.notifyPlaying);
    video.removeEventListener(
      "enterpictureinpicture",
      this.notifyEnterPictureInPicture
    );
    video.removeEventListener(
      "leavepictureinpicture",
      this.notifyLeavePictureInPicture
    );
    video.removeEventListener("loadedmetadata", this.updateAspectRatio);
  }
  @Watch("videoUrl")
  private updateVideoUrl(): void {
    const videoElement = this.$refs.video as HTMLVideoElement;
    videoElement.pause();
    videoElement.src = this.videoUrl;
    videoElement.load();
  }
  @Watch("pictureInPicture")
  private switchPictureInPicture(): void {
    if (this.pictureInPicture) {
      this.enterPictureInPicture();
    } else {
      this.exitPictureInPicture();
    }
  }

  private updateAspectRatio() {
    const videoElement = this.$refs.video as HTMLVideoElement;
    console.log("w: " + videoElement.videoWidth);
    console.log("h: " + videoElement.videoHeight);
    this.aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
  }
  private async enterPictureInPicture(): Promise<void> {
    if (!document.pictureInPictureElement) {
      const video = this.$refs.video as HTMLVideoElement;
      await video.requestPictureInPicture();
    }
  }
  private async exitPictureInPicture(): Promise<void> {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    }
  }
  private notifyPlaying() {
    this.$emit("playing");
  }
  private notifyEnterPictureInPicture() {
    this.$emit("enterPictureInPicture");
  }
  private notifyLeavePictureInPicture() {
    this.$emit("leavePictureInPicture");
  }
}
</script>
