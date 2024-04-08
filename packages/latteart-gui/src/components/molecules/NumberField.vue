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
  <v-row align="center" justify="center">
    <v-col cols="12">
      <div class="wrap">
        <div class="text-wrap">
          <v-text-field
            :mask="mask"
            :label="label"
            :suffix="suffix"
            :id="`numberField${id}_text`"
            :model-value="internalValue"
            @update:model-value="(value) => update(value)"
            @blur="onBlur"
            :readonly="arrowOnly"
            :disabled="disabled"
            ref="textField"
          ></v-text-field>
        </div>
        <div class="button-wrap">
          <button
            :id="`numberField${id}_increaseButton`"
            class="py-0 my-0 px-0 mx-0"
            @click="increase"
            @blur="onBlur"
            @mousedown="onMouseDown"
            :disabled="disabled"
          >
            <v-icon size="small">keyboard_arrow_up</v-icon>
          </button>
          <button
            :id="`numberField${id}_decreaseButton`"
            icon
            class="py-0 my-0 px-0 mx-0"
            @click="decrease"
            @blur="onBlur"
            @mousedown="onMouseDown"
            :disabled="disabled"
          >
            <v-icon size="small">keyboard_arrow_down</v-icon>
          </button>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { computed, defineComponent, ref, toRefs, watch } from "vue";

export default defineComponent({
  props: {
    id: { type: String, default: "" },
    value: { type: Number },
    maxValue: { type: Number, default: 9999 },
    minValue: { type: Number, default: 0 },
    label: { type: String },
    suffix: { type: String },
    arrowOnly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    allowBlank: { type: Boolean, default: false }
  },
  setup(props, context) {
    const internalValue = ref<number | string>(0);
    const clicking = ref(false);

    const textField = ref<any>();

    const setValue = () => {
      internalValue.value = props.value ?? "";
    };

    const mask = computed(() => {
      return Array(String(props.maxValue).length).fill("#").join("");
    });

    const onBlur = () => {
      if (!clicking.value) {
        const num = internalValue.value;
        if (num === "" && !props.allowBlank) {
          internalValue.value = props.minValue;
        } else if (props.maxValue !== undefined && parseInt(num.toString(), 10) > props.maxValue) {
          internalValue.value = props.maxValue;
        } else if (props.minValue !== undefined && parseInt(num.toString(), 10) < props.minValue) {
          internalValue.value = props.minValue;
        }
        send();
      }
    };

    const onMouseDown = () => {
      clicking.value = true;
    };

    const disabledInternalValue = (): boolean => {
      return (
        internalValue.value === "" ||
        internalValue.value === undefined ||
        internalValue.value === null
      );
    };

    const increase = (): void => {
      if (parseInt(internalValue.value.toString(), 10) < props.maxValue) {
        !internalValue.value ? update("1") : update(`${Number(internalValue.value) + 1}`);
      } else if (disabledInternalValue()) {
        update("1");
      }
      clicking.value = false;
    };

    const decrease = (): void => {
      if (parseInt(internalValue.value.toString(), 10) > props.minValue) {
        !internalValue.value ? update("-1") : update(`${Number(internalValue.value) - 1}`);
      } else if (disabledInternalValue()) {
        update("0");
      }
      clicking.value = false;
    };

    const update = (value: string): void => {
      if (value === "") {
        internalValue.value = "";
        return;
      }
      const num = Number(value);
      if (num !== num) {
        textField.value.internalValue = internalValue.value;
        return;
      }
      internalValue.value = num;
    };

    const send = (): void => {
      if (internalValue.value === props.value) {
        return;
      }
      context.emit("updateNumberFieldValue", {
        id: props.id,
        value: internalValue.value
      });
    };

    const realtimeSend = (): void => {
      context.emit("input", {
        id: props.id,
        value: internalValue.value
      });
    };

    const { value } = toRefs(props);
    watch(value, setValue);
    watch(internalValue, realtimeSend);

    setValue();

    return {
      internalValue,
      textField,
      mask,
      onBlur,
      onMouseDown,
      increase,
      decrease,
      update
    };
  }
});
</script>

<style lang="sass" scoped>
button
  height: 18px !important
  border-radius: 10% !important
  display: block

button:focus
  background-color: #DDD

.wrap
  display: table
  minWidth: 100px

.text-wrap
  width: 100%
  min-width: 50px
  display: table-cell

.button-wrap
  width: 25px
</style>
