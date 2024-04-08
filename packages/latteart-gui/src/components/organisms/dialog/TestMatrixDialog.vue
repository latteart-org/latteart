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
  <execute-dialog
    :opened="opened"
    :title="dialogTitle"
    @accept="update"
    @cancel="closeDialog"
    :acceptButtonDisabled="testMatrix.name === ''"
  >
    <template>
      <v-container>
        <v-row class="mt-2">
          <v-text-field
            :label="store.getters.message('test-matrix-dialog.test-matrix-name')"
            v-model="testMatrix.name"
            class="pt-0"
          ></v-text-field>
        </v-row>
        <v-row>
          <v-card>
            <v-card-title>
              {{ store.getters.message("test-matrix-dialog.setting-viewPoint") }}
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row v-if="isCreate">
                  <v-select
                    v-model="selectedViewPointsPresetId"
                    @update:model-value="changeSelectedViewPoints"
                    :label="store.getters.message('test-matrix-dialog.preset')"
                    :items="viewPointsPresetsWithUnselected"
                    item-title="name"
                    item-value="id"
                  ></v-select>
                </v-row>
                <v-row>
                  <v-expansion-panels>
                    <v-expansion-panel
                      v-for="(tempViewPoint, index) in tempViewPoints"
                      :key="tempViewPoint.key + index"
                    >
                      <v-expansion-panel-title>
                        <v-row>
                          <v-col cols="9">
                            <v-text-field
                              :placeholder="
                                store.getters.message('test-matrix-dialog.viewPoint-name')
                              "
                              v-model="tempViewPoint.name"
                              @click="(e) => e.stopPropagation()"
                              class="view-point-name"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="1">
                            <up-down-arrows
                              :index="index"
                              :upDisabled="index <= 0"
                              :downDisabled="tempViewPoints.length - 1 <= index"
                              @up="upViewPoint"
                              @down="downViewPoint"
                            />
                          </v-col>
                          <v-col cols="2" align-self="center">
                            <v-btn
                              variant="text"
                              icon
                              color="error"
                              @click="deleteTempViewPoint(index)"
                              ><v-icon>delete</v-icon></v-btn
                            >
                          </v-col>
                        </v-row>
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <div class="view-point-description">
                          <v-textarea
                            variant="outlined"
                            rows="3"
                            v-model="tempViewPoint.description"
                            :placeholder="
                              store.getters.message('test-matrix-dialog.view-point-description')
                            "
                          ></v-textarea>
                        </div>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-row>
                <v-row>
                  <v-btn size="small" @click="createTempViewPoint" class="mt-4">{{
                    store.getters.message("test-matrix-dialog.new-viewPoint")
                  }}</v-btn>
                </v-row>
              </v-container>
            </v-card-text>
          </v-card>
        </v-row>
      </v-container>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { ViewPointsPreset, TestMatrix } from "@/lib/testManagement/types";
import UpDownArrows from "@/components/molecules/UpDownArrows.vue";
import { UpdateTestMatrixObject } from "@/components/organisms/testMatrixEdit/ManageEditTypes";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { computed, defineComponent, ref, toRefs, watch } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    testMatrixBeingEdited: {
      type: Object as PropType<TestMatrix>,
      default: { name: "", id: "", viewPoints: [] }
    }
  },
  components: {
    "execute-dialog": ExecuteDialog,
    "up-down-arrows": UpDownArrows
  },
  setup(props, context) {
    const store = useStore();

    const selectedViewPointsPresetId = ref("");
    const tempViewPoints = ref<
      {
        key: string;
        name: string;
        description: string;
        index: number;
        id: string | null;
      }[]
    >([]);
    const key = ref(0);
    const testMatrix = ref<{ name: string; id: string }>({ name: "", id: "" });

    const viewPointsPresets = computed((): ViewPointsPreset[] => {
      return store.state.projectSettings.viewPointsPreset;
    });

    const viewPointsPresetsWithUnselected = computed((): ViewPointsPreset[] => {
      const presets: ViewPointsPreset[] = [];
      presets.push({
        id: "",
        name: store.getters.message("test-matrix-dialog.unselected"),
        viewPoints: []
      });
      selectedViewPointsPresetId.value = viewPointsPresets.value[0]?.id ?? "";

      for (const pre of viewPointsPresets.value) {
        presets.push(pre);
      }
      return presets;
    });

    const opened = computed((): boolean => {
      return props.testMatrixBeingEdited !== null;
    });

    const isCreate = computed((): boolean => {
      return testMatrix.value.id === "";
    });

    const dialogTitle = computed((): string => {
      const key = `test-matrix-dialog.${isCreate.value ? "create-test-matrix" : "edit-test-matrix"}`;
      return store.getters.message(key);
    });

    const init = (initTestMatrix: TestMatrix): void => {
      if (!initTestMatrix) {
        return;
      }
      testMatrix.value = {
        name: initTestMatrix.name,
        id: initTestMatrix.id
      };
      if (isCreate.value) {
        selectedViewPointsPresetId.value = viewPointsPresets.value[0]?.id ?? "";
        changeSelectedViewPoints();
      } else {
        tempViewPoints.value = initTestMatrix.viewPoints
          .map((viewPoint, index) => {
            return {
              key: tempViewPointKey(),
              name: viewPoint.name,
              index: index,
              id: viewPoint.id,
              description: viewPoint.description
            };
          })
          .sort((v1, v2) => {
            return v1.index - v2.index;
          });
      }
    };

    const tempViewPointKey = (): string => {
      return `${key.value++}`;
    };

    const createTempViewPoint = (): void => {
      tempViewPoints.value.push({
        key: tempViewPointKey(),
        name: "",
        description: "",
        index: tempViewPoints.value.length,
        id: null
      });
    };

    const changeSelectedViewPoints = (): void => {
      if (selectedViewPointsPresetId.value === "") {
        tempViewPoints.value = [];
      }
      const addPreset = viewPointsPresets.value.find((preset) => {
        return selectedViewPointsPresetId.value === preset.id;
      });
      if (!addPreset) {
        return;
      }
      tempViewPoints.value = addPreset.viewPoints.map((viewPoint, index) => {
        return {
          key: tempViewPointKey(),
          name: viewPoint.name,
          description: viewPoint.description,
          index,
          id: null
        };
      });
    };

    const deleteTempViewPoint = (index: number): void => {
      tempViewPoints.value = tempViewPoints.value
        .filter((_, vIndex) => {
          return vIndex !== index;
        })
        .map((viewPoint, index) => {
          return {
            ...viewPoint,
            index
          };
        });
    };

    const closeDialog = (): void => {
      context.emit("closeDialog");
    };

    const update = (): void => {
      const updateTestMatrixObject: UpdateTestMatrixObject = {
        isCreate: isCreate.value,
        testMatrix: {
          name: testMatrix.value.name,
          id: testMatrix.value.id
        },
        viewPoints: tempViewPoints.value
          .filter((tempViewPoint) => {
            return !!tempViewPoint.name;
          })
          .map((tempViewPoint) => {
            return {
              name: tempViewPoint.name,
              id: tempViewPoint.id,
              description: tempViewPoint.description,
              index: tempViewPoint.index
            };
          })
      };
      context.emit("updateTestMatrix", updateTestMatrixObject);

      closeDialog();
    };

    const upViewPoint = (index: number): void => {
      const temp = [...tempViewPoints.value];
      temp[index].index = index - 1;
      temp[index - 1].index = index;
      tempViewPoints.value = [...temp].sort((v1, v2) => {
        return v1.index - v2.index;
      });
    };

    const downViewPoint = (index: number): void => {
      const temp = [...tempViewPoints.value];
      temp[index].index = index + 1;
      temp[index + 1].index = index;
      tempViewPoints.value = [...temp].sort((v1, v2) => {
        return v1.index - v2.index;
      });
    };

    const { testMatrixBeingEdited } = toRefs(props);
    watch(testMatrixBeingEdited, init);

    key.value = 0;

    return {
      store,
      selectedViewPointsPresetId,
      tempViewPoints,
      testMatrix,
      viewPointsPresetsWithUnselected,
      opened,
      isCreate,
      dialogTitle,
      createTempViewPoint,
      changeSelectedViewPoints,
      deleteTempViewPoint,
      closeDialog,
      update,
      upViewPoint,
      downViewPoint
    };
  }
});
</script>

<style lang="sass" scoped>
.view-point-name ::v-deep
  padding-top: 0px
  margin-top: 0px
  .v-messages
    display: none
.view-point-description  ::v-deep
  padding: 0px 24px
  textarea
    margin: 4px
  .v-messages
    display: none
  .v-text-field__details
    display: none
  .v-input__slot
    border: 1px solid rgba(0,0,0,0.54) !important
</style>
