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
  <div :style="style">
    <v-img :src="imageFileUrl" style="cursor: pointer" @click="openImageFile" />
    <v-dialog v-model="imageFileOpened">
      <v-card>
        <v-img :src="imageFileUrl" @click="closeImageFile" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  props: {
    imageFileUrl: { type: String, default: "" },
    width: { type: String, default: "100%" },
    height: { type: String, default: "100%" }
  },
  setup(props) {
    const imageFileOpened = ref(false);

    const openImageFile = () => {
      imageFileOpened.value = true;
    };

    const closeImageFile = () => {
      imageFileOpened.value = false;
    };

    const style = {
      width: props.width,
      height: props.height
    };

    return { imageFileOpened, openImageFile, closeImageFile, style };
  }
});
</script>
