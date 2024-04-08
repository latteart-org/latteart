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
  <v-row class="pl-2" :style="{ height: '100%' }">
    <l-map
      ref="map"
      :crs="crs"
      :min-zoom="minZoom"
      :max-zoom="maxZoom"
      :max-bounds="state.maxBounds"
      :center="state.center"
      :zoom="state.zoom"
      style="z-index: 6; height: 100%; width: 100%"
    >
      <l-image-overlay ref="overlay" :url="state.imageUrl" :bounds="state.bounds">
      </l-image-overlay>
    </l-map>
  </v-row>
</template>

<script lang="ts">
import L from "leaflet";
import { LMap, LImageOverlay } from "vue2-leaflet";
import { computed, defineComponent, onMounted, nextTick, ref, toRefs, watch } from "vue";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    imageInfo: {
      type: Object as PropType<{ decode: string }>,
      default: () => ({ decode: "" })
    }
  },
  components: {
    "l-map": LMap,
    "l-image-overlay": LImageOverlay
  },
  setup(props) {
    const crs = ref(L.CRS.Simple);
    const minZoom = ref(-4);
    const maxZoom = ref(4);

    const map = ref<any>();

    const initialState = computed(() => {
      return {
        imageUrl: "",
        bounds: [
          [0, 0],
          [0, 0]
        ],
        maxBounds: [
          [0, 0],
          [0, 0]
        ],
        center: [0, 0],
        zoom: -1
      };
    });

    const state = ref({ ...initialState.value });

    const clear = () => {
      state.value = { ...initialState.value };
    };

    onMounted((): void => {
      nextTick(() => {
        updateImageOverlay();
      });
    });

    const onChangeImage = () => {
      updateImageOverlay();
    };

    const updateImageOverlay = () => {
      (async () => {
        if (props.imageInfo.decode !== "") {
          const img = await getImage(props.imageInfo.decode, 1);
          state.value.imageUrl = props.imageInfo.decode;

          if (img) {
            state.value.bounds = [
              [0, 0],
              [img.height, img.width]
            ];
            state.value.maxBounds = [
              [img.height, 0],
              [0, img.width]
            ];
            state.value.center = [img.height / 2, img.width / 2];
          }
        } else {
          clear();
        }

        if (map.value) {
          const mapObject = map.value.mapObject;
          mapObject.removeControl(mapObject.attributionControl);
        }
      })();
    };

    const getImage = async (src: string, limit: number): Promise<HTMLImageElement | null> => {
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

        return await getImage(src, limit - 1);
      }
    };

    const { imageInfo } = toRefs(props);
    watch(() => imageInfo.value.decode, onChangeImage);

    return { crs, minZoom, maxZoom, map, state };
  }
});
</script>

<style lang="sass" scoped>
:deep(.leaflet-bar) a
  color: black !important
</style>
