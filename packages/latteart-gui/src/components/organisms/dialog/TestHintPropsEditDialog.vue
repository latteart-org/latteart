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
  <execute-dialog
    :opened="opened"
    :title="$t('test-hint.edit-props-dialog.title')"
    @accept="update"
    @cancel="close"
  >
    <v-container>
      <v-row>
        <v-expansion-panels>
          <v-expansion-panel v-for="(prop, index) in tempProps" :key="index">
            <v-expansion-panel-title>
              <v-row>
                <v-col cols="9">
                  <v-text-field
                    v-model="prop.name"
                    :placeholder="$t('test-hint.edit-props-dialog.name')"
                    @click="(e: any) => e.stopPropagation()"
                  ></v-text-field>
                </v-col>
                <v-col cols="1">
                  <up-down-arrows
                    :index="index"
                    :up-disabled="index <= 0"
                    :down-disabled="tempProps.length - 1 <= index"
                    @up="upIndex(index)"
                    @down="downIndex(index)"
                  />
                </v-col>
                <v-col cols="2" align-self="center">
                  <v-btn variant="text" icon color="red" @click.stop="deleteProp(index)"
                    ><v-icon>delete</v-icon></v-btn
                  >
                </v-col>
              </v-row>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div>
                <v-select v-model="prop.type" :items="['string', 'list', 'tag']"></v-select>
                <div v-if="prop.type === 'list'" class="pt-2">
                  <v-btn size="small" @click="addList(prop)">{{
                    $t("test-hint.edit-props-dialog.add-option")
                  }}</v-btn>
                  <div v-for="(keyValue, listIndex) in prop.listItems" :key="listIndex">
                    <v-container>
                      <v-row class="list-edit">
                        <v-col cols="1">
                          <v-btn
                            variant="text"
                            icon
                            color="error"
                            @click="deleteList(prop, listIndex)"
                            ><v-icon>delete</v-icon></v-btn
                          >
                        </v-col>
                        <v-col cols="11" class="py-0">
                          <v-text-field
                            label="value"
                            :model-value="keyValue.value"
                            @update:model-value="(value) => inputValue(value, listIndex, index)"
                          />
                        </v-col>
                      </v-row>
                    </v-container>
                  </div>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-row>
      <v-row>
        <v-btn size="small" class="mt-4" @click="addProp">
          {{ $t("test-hint.edit-props-dialog.add") }}
        </v-btn>
      </v-row>
    </v-container>
  </execute-dialog>
</template>

<script lang="ts">
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import UpDownArrows from "@/components/molecules/UpDownArrows.vue";
import type { TestHintProp } from "@/lib/operationHistory/types";
import { defineComponent, ref, toRefs, watch, type PropType } from "vue";
import { useRootStore } from "@/stores/root";

type TempTestHintProp = Omit<TestHintProp, "id"> & { id?: string };

export default defineComponent({
  components: {
    "execute-dialog": ExecuteDialog,
    "up-down-arrows": UpDownArrows
  },
  props: {
    props: { type: Array as PropType<TestHintProp[]>, required: true },
    opened: { type: Boolean, default: false }
  },
  emits: ["close", "update"],
  setup(props, context) {
    const rootStore = useRootStore();

    const tempProps = ref<TempTestHintProp[]>([]);

    const initialize = () => {
      if (!props.opened) {
        return;
      }

      tempProps.value = props.props.map((prop) => {
        if (prop.type === "list") {
          return { ...prop, list: prop.listItems };
        }
        return { id: prop.id, name: prop.name, type: prop.type };
      });
    };

    const addList = (prop: TempTestHintProp) => {
      tempProps.value = tempProps.value.map((p) => {
        const key = `${new Date().getTime()}`;
        if (p === prop) {
          if (p.listItems) {
            p.listItems.push({ key, value: "" });
          } else {
            p.listItems = [{ key, value: "" }];
          }
        }
        return p;
      });
    };

    const deleteList = (prop: TempTestHintProp, listIndex: number) => {
      tempProps.value = tempProps.value.map((p) => {
        if (p === prop) {
          p.listItems = p.listItems?.filter((_, i) => i !== listIndex);
        }
        return p;
      });
    };

    const inputValue = (value: string, listIndex: number, propIndex: number) => {
      tempProps.value = tempProps.value.map((prop, pIndex) => {
        if (pIndex === propIndex) {
          prop.listItems = prop.listItems?.map((keyValue, lIndex) => {
            if (lIndex === listIndex) {
              keyValue.value = value;
            }
            return keyValue;
          });
        }
        return prop;
      });
    };

    const convertProp = (prop: TempTestHintProp) => {
      if (prop.id) {
        return { id: prop.id, name: prop.name, type: prop.type };
      } else {
        return { name: prop.name, type: prop.type };
      }
    };

    const update = () => {
      const updateProps = tempProps.value.map((prop) => {
        if (prop.type === "list") {
          return {
            ...convertProp(prop),
            list: prop.listItems ? prop.listItems.filter((l) => l.value !== "") : ""
          };
        }
        return { ...convertProp(prop) };
      });
      context.emit("update", updateProps);
    };

    const close = () => {
      context.emit("close");
    };

    const upIndex = (index: number) => {
      tempProps.value.splice(index - 1, 2, tempProps.value[index], tempProps.value[index - 1]);
    };

    const downIndex = (index: number) => {
      tempProps.value.splice(index, 2, tempProps.value[index + 1], tempProps.value[index]);
    };

    const deleteProp = (index: number) => {
      tempProps.value = tempProps.value.filter((_, i) => index !== i);
    };

    const addProp = () => {
      tempProps.value = [
        ...tempProps.value,
        {
          name: `${rootStore.message("test-hint.edit-props-dialog.name")}`,
          type: "string"
        }
      ];
    };

    const { opened } = toRefs(props);
    watch(opened, initialize);

    return {
      tempProps,
      addList,
      deleteList,
      inputValue,
      update,
      close,
      upIndex,
      downIndex,
      deleteProp,
      addProp
    };
  }
});
</script>

<style lang="sass" scoped>
:deep(.v-messages)
  display: none

:deep(.v-text-field__details)
  display: none
</style>
