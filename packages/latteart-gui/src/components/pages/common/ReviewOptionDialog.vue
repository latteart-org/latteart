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
    :title="this.$store.getters.message('review-option-dialog.title')"
    @accept="
      execute();
      close();
    "
    @cancel="close()"
    :acceptButtonDisabled="okButtonIsDisabled"
  >
    <template>
      <v-container class="px-0" fluid>
        <v-radio-group v-model="reviewType" row hide-details>
          <v-radio
            :label="
              this.$store.getters.message('review-option-dialog.test-matrix')
            "
            value="matrix"
          ></v-radio>
          <v-radio
            :label="this.$store.getters.message('review-option-dialog.group')"
            value="group"
          ></v-radio>
          <v-radio
            :label="
              this.$store.getters.message('review-option-dialog.test-target')
            "
            value="target"
          ></v-radio>
        </v-radio-group>
        <v-select
          v-model="reviewItems"
          :items="tempReviewItems"
          item-text="text"
          item-value="value"
          :label="
            this.$store.getters.message('review-option-dialog.review-target')
          "
          multiple
        ></v-select>
      </v-container>
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import { TestMatrix } from "@/lib/testManagement/types";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
  },
})
export default class ReviewOptionDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private reviewType: "matrix" | "group" | "target" = "matrix";

  private reviewItems: { value: string }[] = [];
  private tempReviewItems: {
    text: string;
    value: string;
  }[] = [];

  private get okButtonIsDisabled() {
    return this.reviewItems.length === 0;
  }

  @Watch("opened")
  private initialize() {
    if (this.opened) {
      this.reviewItems = [];
      this.reviewType = "matrix";
      this.changeTargetList();
    }
  }

  @Watch("reviewType")
  private changeTargetList() {
    const testMatrices: TestMatrix[] =
      this.$store.getters["testManagement/getTestMatrices"]();

    if (this.reviewType === "matrix") {
      this.tempReviewItems = testMatrices.map((matrix) => {
        return {
          text: matrix.name,
          value: matrix.id,
        };
      });
    }
    if (this.reviewType === "group") {
      this.tempReviewItems = testMatrices.flatMap((matrix) => {
        return matrix.groups.map((group) => {
          return {
            text: `${matrix.name}:${group.name}`,
            value: group.id,
          };
        });
      });
    }
    if (this.reviewType === "target") {
      this.tempReviewItems = testMatrices.flatMap((matrix) => {
        return matrix.groups.flatMap((group) => {
          return group.testTargets.map((target) => {
            return {
              text: `${matrix.name}:${group.name}:${target.name}`,
              value: target.id,
            };
          });
        });
      });
    }
  }

  private execute(): void {
    this.$emit("execute", this.reviewType, this.reviewItems);
    this.close();
  }

  private close(): void {
    this.$emit("close");
  }
}
</script>
