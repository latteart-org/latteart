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
      <v-btn size="small" class="ma-1" @click="addIssue">{{ $t("common.add") }}</v-btn>
    </v-row>
    <v-row v-if="modelValue.length === 0" style="text-align: center">
      <v-col cols="12">no data</v-col>
    </v-row>
    <v-row v-for="(issueValue, index) in modelValue" :key="index" class="body">
      <v-col cols="1" class="px-1 py-0"
        ><v-btn variant="text" size="small" icon color="red" @click="deleteIssue(index)"
          ><v-icon>delete</v-icon></v-btn
        ></v-col
      >

      <v-col cols="11" class="px-1 py-0" style="align-content: center">
        <input
          type="text"
          :value="issueValue"
          class="form"
          @input="(e) => updateIssue((e.target as HTMLInputElement).value, index)"
      /></v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  props: {
    modelValue: {
      type: Array as PropType<string[]>,
      default: () => [],
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(props, context) {
    const addIssue = () => {
      context.emit("update:modelValue", [...props.modelValue, ""]);
    };

    const updateIssue = (newValue: string, index: number) => {
      context.emit(
        "update:modelValue",
        props.modelValue.map((oldValue, i) => {
          return index === i ? newValue : oldValue;
        })
      );
    };

    const deleteIssue = (index: number) => {
      context.emit(
        "update:modelValue",
        props.modelValue.filter((_, i) => i !== index)
      );
    };

    return {
      addIssue,
      updateIssue,
      deleteIssue
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
