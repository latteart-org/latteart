<!--
 Copyright 2021 NTT Corporation.

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
  <v-layout>
    <l-map
      ref="map"
      :crs="crs"
      :min-zoom="minZoom"
      :max-zoom="maxZoom"
      :max-bounds="state.maxBounds"
      :center="state.center"
      :zoom="state.zoom"
      style="z-index: 7; height: 100%; width: 100%"
    >
      <l-image-overlay
        ref="overlay"
        :url="state.imageUrl"
        :bounds="state.bounds"
      >
      </l-image-overlay>
    </l-map>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import L from "leaflet";
import { LMap, LImageOverlay } from "vue2-leaflet";

@Component({
  components: {
    "l-map": LMap,
    "l-image-overlay": LImageOverlay,
  },
})
export default class ScreenShotDisplay extends Vue {
  @Prop({ type: Object, default: () => ({ decode: "" }) })
  public readonly imageInfo!: {
    decode: string;
  };

  private crs = L.CRS.Simple;
  private minZoom = -4;
  private maxZoom = 4;
  private state = { ...this.initialState };

  private get initialState() {
    return {
      imageUrl: "",
      bounds: [
        [0, 0],
        [0, 0],
      ],
      maxBounds: [
        [0, 0],
        [0, 0],
      ],
      center: [0, 0],
      zoom: -1,
    };
  }

  private clear() {
    this.state = { ...this.initialState };
  }

  private mounted(): void {
    this.$nextTick(() => {
      this.updateImageOverlay();
    });
  }

  @Watch("imageInfo.decode")
  private onChangeImage() {
    this.updateImageOverlay();
  }

  private updateImageOverlay() {
    (async () => {
      if (this.imageInfo.decode !== "") {
        const img = await this.getImage(this.imageInfo.decode, 1);
        this.state.imageUrl = this.imageInfo.decode;

        if (img) {
          this.state.bounds = [
            [0, 0],
            [img.height, img.width],
          ];
          this.state.maxBounds = [
            [img.height, 0],
            [0, img.width],
          ];
          this.state.center = [img.height / 2, img.width / 2];
        }
      } else {
        this.clear();
      }

      if (this.$refs.map) {
        const map = (this.$refs.map as any).mapObject;
        map.removeControl(map.attributionControl);
      }
    })();
  }

  private async getImage(
    src: string,
    limit: number
  ): Promise<HTMLImageElement | null> {
    try {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
      });

      return await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
      });
    } catch (e) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
      });

      if (limit === 1) {
        return null;
      }

      return await this.getImage(src, limit - 1);
    }
  }
}
</script>
