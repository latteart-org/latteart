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
            :label="
              $store.getters.message('test-matrix-dialog.test-matrix-name')
            "
            v-model="testMatrix.name"
            class="pt-0"
          ></v-text-field>
        </v-row>
        <v-row>
          <v-card>
            <v-card-title>
              {{
                $store.getters.message("test-matrix-dialog.setting-viewPoint")
              }}
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row v-if="isCreate">
                  <v-select
                    v-model="selectedViewPointsPresetId"
                    @change="changeSelectedViewPoints"
                    :label="$store.getters.message('test-matrix-dialog.preset')"
                    :items="viewPointsPresetsWithUnselected"
                    item-text="name"
                    item-value="id"
                  ></v-select>
                </v-row>
                <v-row>
                  <v-expansion-panels>
                    <v-expansion-panel
                      v-for="(tempViewPoint, index) in tempViewPoints"
                      :key="tempViewPoint.key + index"
                    >
                      <v-expansion-panel-header>
                        <v-row>
                          <v-col cols="9">
                            <v-text-field
                              :placeholder="
                                $store.getters.message(
                                  'test-matrix-dialog.viewPoint-name'
                                )
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
                              text
                              icon
                              color="error"
                              @click="deleteTempViewPoint(index)"
                              ><v-icon>delete</v-icon></v-btn
                            >
                          </v-col>
                        </v-row>
                      </v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <div class="view-point-description">
                          <v-textarea
                            outlined
                            rows="3"
                            v-model="tempViewPoint.description"
                            :placeholder="
                              $store.getters.message(
                                'test-matrix-dialog.view-point-description'
                              )
                            "
                          ></v-textarea>
                        </div>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-row>
                <v-row>
                  <v-btn small @click="createTempViewPoint" class="mt-4">{{
                    $store.getters.message("test-matrix-dialog.new-viewPoint")
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
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { ViewPointsPreset, TestMatrix } from "@/lib/testManagement/types";
import UpDownArrows from "@/components/molecules/UpDownArrows.vue";
import { UpdateTestMatrixObject } from "@/components/organisms/testMatrixEdit/ManageEditTypes";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { RootState } from "@/store";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
    "up-down-arrows": UpDownArrows,
  },
})
export default class TestMatrixDialog extends Vue {
  @Prop({ type: Object, default: { name: "", id: "", viewPoints: [] } })
  public readonly testMatrixBeingEdited!: TestMatrix;

  private selectedViewPointsPresetId = "";
  private tempViewPoints: Array<{
    key: string;
    name: string;
    description: string;
    index: number;
    id: string | null;
  }> = [];
  private key = 0;
  private testMatrix: { name: string; id: string } = { name: "", id: "" };

  private panel = [];

  private get viewPointsPresets(): ViewPointsPreset[] {
    return (this.$store.state as RootState).projectSettings.viewPointsPreset;
  }

  private get viewPointsPresetsWithUnselected(): ViewPointsPreset[] {
    const presets: ViewPointsPreset[] = [];
    presets.push({
      id: "",
      name: this.$store.getters.message("test-matrix-dialog.unselected"),
      viewPoints: [],
    });
    this.selectedViewPointsPresetId = this.viewPointsPresets[0]?.id ?? "";

    for (const pre of this.viewPointsPresets) {
      presets.push(pre);
    }
    return presets;
  }

  private get opened(): boolean {
    return this.testMatrixBeingEdited !== null;
  }

  private get isCreate(): boolean {
    return this.testMatrix.id === "";
  }

  private get dialogTitle(): string {
    const key = `test-matrix-dialog.${
      this.isCreate ? "create-test-matrix" : "edit-test-matrix"
    }`;
    return this.$store.getters.message(key);
  }

  private created() {
    this.key = 0;
  }

  @Watch("testMatrixBeingEdited")
  private init(testMatrix: TestMatrix): void {
    if (!testMatrix) {
      return;
    }
    this.testMatrix = {
      name: testMatrix.name,
      id: testMatrix.id,
    };
    if (this.isCreate) {
      this.selectedViewPointsPresetId = this.viewPointsPresets[0]?.id ?? "";
      this.changeSelectedViewPoints();
    } else {
      this.tempViewPoints = testMatrix.viewPoints
        .map((viewPoint, index) => {
          return {
            key: this.tempViewPointKey(),
            name: viewPoint.name,
            index: index,
            id: viewPoint.id,
            description: viewPoint.description,
          };
        })
        .sort((v1, v2) => {
          return v1.index - v2.index;
        });
    }
  }

  private tempViewPointKey(): string {
    return `${this.key++}`;
  }

  private createTempViewPoint(): void {
    this.tempViewPoints.push({
      key: this.tempViewPointKey(),
      name: "",
      description: "",
      index: this.tempViewPoints.length,
      id: null,
    });
  }

  private changeSelectedViewPoints(): void {
    if (this.selectedViewPointsPresetId === "") {
      this.tempViewPoints = [];
    }
    const addPreset = this.viewPointsPresets.find((preset) => {
      return this.selectedViewPointsPresetId === preset.id;
    });
    if (!addPreset) {
      return;
    }
    this.tempViewPoints = addPreset.viewPoints.map((viewPoint, index) => {
      return {
        key: this.tempViewPointKey(),
        name: viewPoint.name,
        description: viewPoint.description,
        index,
        id: null,
      };
    });
  }

  private deleteTempViewPoint(index: number): void {
    this.tempViewPoints = this.tempViewPoints
      .filter((_, vIndex) => {
        return vIndex !== index;
      })
      .map((viewPoint, index) => {
        return {
          ...viewPoint,
          index,
        };
      });
  }

  private closeDialog(): void {
    this.$emit("closeDialog");
  }

  private update(): void {
    const updateTestMatrixObject: UpdateTestMatrixObject = {
      isCreate: this.isCreate,
      testMatrix: {
        name: this.testMatrix.name,
        id: this.testMatrix.id,
      },
      viewPoints: this.tempViewPoints
        .filter((tempViewPoint) => {
          return !!tempViewPoint.name;
        })
        .map((tempViewPoint) => {
          return {
            name: tempViewPoint.name,
            id: tempViewPoint.id,
            description: tempViewPoint.description,
            index: tempViewPoint.index,
          };
        }),
    };
    this.$emit("updateTestMatrix", updateTestMatrixObject);

    this.closeDialog();
  }

  private upViewPoint(index: number): void {
    const temp = [...this.tempViewPoints];
    temp[index].index = index - 1;
    temp[index - 1].index = index;
    this.tempViewPoints = [...temp].sort((v1, v2) => {
      return v1.index - v2.index;
    });
  }

  private downViewPoint(index: number): void {
    const temp = [...this.tempViewPoints];
    temp[index].index = index + 1;
    temp[index + 1].index = index;
    this.tempViewPoints = [...temp].sort((v1, v2) => {
      return v1.index - v2.index;
    });
  }
}
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
