<!--
 Copyright 2022 NTT Corporation.

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
  <scrollable-dialog :opened="opened">
    <template v-slot:title>{{ dialogTitle }}</template>
    <template v-slot:content>
      <v-container class="ma-0 pa-0">
        <v-layout row wrap class="mt-0 pt-0">
          <v-flex xs12 class="py-0 my-0">
            <v-text-field
              :label="
                $store.getters.message('test-matrix-dialog.test-matrix-name')
              "
              v-model="testMatrix.name"
              class="pt-0"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 class="py-0 my-0">
            <v-card>
              <v-card-title>
                {{
                  $store.getters.message("test-matrix-dialog.setting-viewPoint")
                }}
              </v-card-title>
              <v-card-text class="pt-0">
                <v-container class="ma-0 pa-0">
                  <v-layout row wrap class="mt-0 pt-0">
                    <v-flex v-if="isCreate" xs12 class="py-0 my-0">
                      <v-select
                        class="pt-0 pm-0"
                        v-model="selectedViewPointsPresetId"
                        @change="changeSelectedViewPoints"
                        :label="
                          $store.getters.message('test-matrix-dialog.preset')
                        "
                        :items="viewPointsPresetsWithUnselected"
                        item-text="name"
                        item-value="id"
                      ></v-select>
                    </v-flex>
                    <v-flex
                      xs12
                      v-for="(tempViewPoint, index) in tempViewPoints"
                      :key="tempViewPoint.key"
                    >
                      <v-layout row wrap class="mt-0 pt-0">
                        <v-flex xs10>
                          <v-text-field
                            :label="
                              $store.getters.message(
                                'test-matrix-dialog.viewPoint-name'
                              )
                            "
                            v-model="tempViewPoint.name"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs2>
                          <v-btn
                            flat
                            icon
                            color="error"
                            @click="deleteTempViewPoint(index)"
                            ><v-icon>delete</v-icon></v-btn
                          >
                        </v-flex>
                      </v-layout>
                    </v-flex>
                    <v-flex xs12>
                      <v-btn small @click="createTempViewPoint">{{
                        $store.getters.message(
                          "test-matrix-dialog.new-viewPoint"
                        )
                      }}</v-btn>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </template>
    <template v-slot:footer>
      <v-spacer></v-spacer>
      <v-btn
        color="blue"
        :disabled="testMatrix.name === ''"
        :dark="testMatrix.name !== ''"
        @click="update"
        >{{ $store.getters.message("common.ok") }}</v-btn
      >
      <v-btn color="white" @click="closeDialog">{{
        $store.getters.message("common.cancel")
      }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { ViewPointsPreset, TestMatrix } from "@/lib/testManagement/types";
import ScrollableDialog from "@/vue/molecules/ScrollableDialog.vue";
import { UpdateTestMatrixObject } from "../ManageEditTypes";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
  },
})
export default class TestMatrixDialog extends Vue {
  @Prop({ type: Object, default: { name: "", id: "", viewPoints: [] } })
  public readonly testMatrixBeingEdited!: TestMatrix;

  private selectedViewPointsPresetId = "";
  private tempViewPoints: Array<{
    key: string;
    name: string;
    id: string | null;
  }> = [];
  private key = 0;
  private testMatrix: { name: string; id: string } = { name: "", id: "" };

  private get viewPointsPresets(): ViewPointsPreset[] {
    return this.$store.getters.getSetting("viewPointsPreset");
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
      this.tempViewPoints = testMatrix.viewPoints.map((viewPoint) => {
        return {
          key: this.tempViewPointKey(),
          name: viewPoint.name,
          id: viewPoint.id,
        };
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
    this.tempViewPoints = addPreset.viewPoints.map((viewPoint) => {
      return {
        key: this.tempViewPointKey(),
        name: viewPoint.name,
        id: null,
      };
    });
  }

  private deleteTempViewPoint(index: number): void {
    this.tempViewPoints.splice(index, 1);
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
          };
        }),
    };
    this.$emit("updateTestMatrix", updateTestMatrixObject);

    this.closeDialog();
  }
}
</script>
