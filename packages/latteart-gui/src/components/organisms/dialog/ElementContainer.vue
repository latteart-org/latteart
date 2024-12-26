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
  <v-container class="elevation-1 wrapper">
    <v-row>
      <v-btn size="small" class="ma-1" @click="addElement">{{
        $t("element-container.add-element")
      }}</v-btn>
    </v-row>
    <v-row class="header">
      <v-col cols="1" class="px-1 py-0"></v-col>
      <v-col cols="3" class="px-1 py-0">tagname</v-col>
      <v-col cols="3" class="px-1 py-0">type</v-col>
      <v-col cols="5" class="px-1 py-0">text</v-col>
    </v-row>
    <v-row v-if="modelValue.length === 0" style="text-align: center">
      <v-col cols="12">no data</v-col>
    </v-row>
    <v-row v-for="(element, index) in modelValue" :key="index" class="body">
      <v-col cols="1" class="px-1 py-0"
        ><v-btn variant="text" size="small" icon color="red" @click="deleteElement(index)"
          ><v-icon>delete</v-icon></v-btn
        ></v-col
      >

      <v-col cols="3" class="px-1 py-0" style="align-content: center">
        <input
          type="text"
          :value="element.tagname"
          class="form"
          @input="(e) => updateElement('tagname', (e.target as HTMLInputElement).value, index)"
      /></v-col>
      <v-col cols="3" class="px-1 py-0" style="align-content: center"
        ><input
          type="text"
          :value="element.type"
          class="form"
          @input="(e) => updateElement('type', (e.target as HTMLInputElement).value, index)"
      /></v-col>
      <v-col cols="5" class="px-1 py-0" style="align-content: center"
        ><input
          type="text"
          :value="element.text"
          class="form"
          @input="(e) => updateElement('text', (e.target as HTMLInputElement).value, index)"
      /></v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  props: {
    modelValue: {
      type: Array as PropType<{ tagname: string; type: string; text: string }[]>,
      default: () => [],
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(props, context) {
    const addElement = () => {
      context.emit("update:modelValue", [...props.modelValue, { tagname: "", type: "", text: "" }]);
    };

    const updateElement = (property: "tagname" | "type" | "text", value: string, index: number) => {
      context.emit(
        "update:modelValue",
        props.modelValue.map((element, i) => {
          if (index === i) {
            element[property] = value;
          }
          return element;
        })
      );
    };

    const deleteElement = (index: number) => {
      context.emit(
        "update:modelValue",
        props.modelValue.filter((_, i) => i !== index)
      );
    };

    return {
      addElement,
      updateElement,
      deleteElement
    };
  }
});
</script>

<style lang="sass" scoped>
.wrapper
  border-radius: 4px

.form
  width: 100%
  border: 1px solid #DDD
  border-radius: 4px
  padding: 2px
</style>
