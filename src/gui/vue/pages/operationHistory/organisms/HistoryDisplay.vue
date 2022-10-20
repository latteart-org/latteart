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
  <splitpanes horizontal class="default-theme">
    <pane
      :class="{
        'disp-coverage': dispCoverage,
        'hidden-coverage': !dispCoverage,
      }"
    >
      <div style="position: relative">
        <v-btn
          color="blue"
          :loading="updating"
          :dark="canUpdateModels"
          :disabled="!canUpdateModels"
          @click="updateScreenHistory"
          >{{ message("history-view.update-model-and-coverage") }}</v-btn
        >
        <span v-if="canUpdateModels" :style="{ color: 'red' }">{{
          message("history-view.there-are-updates-on-history")
        }}</span>
      </div>
      <splitpanes style="height: calc(100% - 46px)">
        <pane>
          <v-flex xs12 wrap mb-0 pb-0 px-2>
            <v-radio-group v-model="diagramType" row class="py-0">
              <v-radio
                :label="message('history-view.sequence')"
                :value="DIAGRAM_TYPE_SEQUENCE"
              ></v-radio>
              <v-radio
                :label="message('history-view.screen-transition')"
                :value="DIAGRAM_TYPE_SCREEN_TRANSITION"
              ></v-radio>
              <v-radio
                :label="message('history-view.element-coverage')"
                :value="DIAGRAM_TYPE_ELEMENT_COVERAGE"
              ></v-radio>
            </v-radio-group>
          </v-flex>
          <v-flex
            xs12
            :style="{ 'overflow-y': 'auto', height: 'calc(100% - 70px)' }"
            column
            justify-center
            fill-height
            ref="mermaidGraphDisplay"
          >
            <element-coverage
              v-if="diagramType === DIAGRAM_TYPE_ELEMENT_COVERAGE"
              :onSelectElement="selectOperation"
              :message="message"
            ></element-coverage>
            <history-summary-diagram
              v-if="diagramType !== DIAGRAM_TYPE_ELEMENT_COVERAGE"
              :diagramType="diagramType"
              :screenHistory="screenHistory"
              :windowHandles="windowHandles"
              :message="message"
            ></history-summary-diagram>
          </v-flex>
        </pane>
        <pane>
          <v-container fluid pa-0 fill-height style="position: relative">
            <screen-shot-display :imageInfo="imageInfo"></screen-shot-display>

            <a
              :href="screenshotUrl"
              :download="screenshotName"
              target="_blank"
              rel="noopener noreferrer"
              class="screenshot-button screenshot-button-single"
              ref="dllink"
            >
              <v-btn
                v-show="screenshotUrl !== ''"
                color="white"
                class="screenshot-button screenshot-button-single"
                fab
                small
              >
                <v-icon>image</v-icon>
              </v-btn></a
            >
          </v-container>
        </pane>
      </splitpanes>
    </pane>
    <pane v-if="!dispCoverage">
      <operation-list
        v-if="diagramType === DIAGRAM_TYPE_SEQUENCE"
        :onResetFilter="resetOperationFilter"
        :displayedOperations="displayedOperations"
        :onSelectOperation="selectOperation"
        :history="history"
        :selectedOperationSequence="selectedOperationSequence"
        :message="message"
        :operationContextEnabled="operationContextEnabled"
      ></operation-list>

      <decision-table
        v-if="diagramType === DIAGRAM_TYPE_SCREEN_TRANSITION"
        :onSelectValueSet="selectOperation"
        :message="message"
      ></decision-table>
    </pane>
  </splitpanes>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import {
  ScreenTransition,
  OperationHistory,
  WindowHandle,
  ScreenDef,
  MessageProvider,
} from "@/lib/operationHistory/types";
import HistorySummaryDiagram from "@/vue/pages/operationHistory/organisms/HistorySummaryDiagram.vue";
import OperationList from "@/vue/pages/operationHistory/organisms/OperationList.vue";
import ScreenShotDisplay from "@/vue/molecules/ScreenShotDisplay.vue";
import ScreenHistory from "@/lib/operationHistory/ScreenHistory";
import ElementCoverage from "@/vue/pages/operationHistory/organisms/ElementCoverage.vue";
import DecisionTable from "./DecisionTable.vue";

@Component({
  components: {
    "history-summary-diagram": HistorySummaryDiagram,
    "operation-list": OperationList,
    "screen-shot-display": ScreenShotDisplay,
    "element-coverage": ElementCoverage,
    "decision-table": DecisionTable,
    Splitpanes,
    Pane,
  },
})
export default class HistoryDisplay extends Vue {
  private get dispCoverage() {
    return this.diagramType === this.DIAGRAM_TYPE_ELEMENT_COVERAGE;
  }

  private get history(): OperationHistory {
    return this.rawHistory;
  }

  private get screenHistory(): ScreenHistory {
    return this.$store.state.operationHistory.screenHistory;
  }

  private get imageInfo(): { decode: string } {
    const history = this.history.find((val) => {
      return val.operation.sequence === Number(this.selectedOperationSequence);
    });
    if (history) {
      this.callSetRecentImageInfo(history.operation.sequence);
      return {
        decode: this.recentImageInfo,
      };
    }
    return { decode: "" };
  }

  @Prop({ type: Boolean, default: false })
  public readonly scriptGenerationEnabled!: boolean;
  @Prop({ type: String, default: "ja" }) public readonly locale!: string;
  @Prop({ type: Array, default: [] })
  public readonly rawHistory!: OperationHistory;
  @Prop({ type: Array, default: () => [] })
  public readonly windowHandles!: WindowHandle[];
  @Prop({ type: Function }) public readonly message!: MessageProvider;
  @Prop({ type: Boolean, default: false })
  public readonly operationContextEnabled!: boolean;
  @Prop({
    type: Object,
    default: () => {
      return {
        screenDefType: "title",
        isRegex: false,
        screenDefList: [],
      };
    },
  })
  public readonly screenDefinitionConfig!: {
    screenDefType: string;
    isRegex: boolean;
    screenDefList: ScreenDef[];
  };
  @Prop({
    type: Function,
    default: (windowTitle: string) => {
      document.title = `operation viewer [${windowTitle}]`;
    },
  })
  public readonly changeWindowTitle!: (windowTitle: string) => void;
  @Prop({ type: String, default: "" }) public readonly testResultId!: string;

  private readonly DIAGRAM_TYPE_SEQUENCE: string = "sequence";
  private readonly DIAGRAM_TYPE_SCREEN_TRANSITION: string = "screenTransition";
  private readonly DIAGRAM_TYPE_ELEMENT_COVERAGE: string = "coverage";

  private diagramType: string = this.DIAGRAM_TYPE_SEQUENCE;

  private get selectedOperationSequence(): number {
    return this.$store.state.operationHistory.selectedOperationSequence;
  }

  private get selectedScreenTransition(): ScreenTransition {
    return (
      this.$store.state.operationHistory.selectedScreenTransition ?? {
        source: { title: "", url: "", screenDef: "" },
        target: { title: "", url: "", screenDef: "" },
      }
    );
  }

  private get displayedOperations(): number[] {
    return this.$store.state.operationHistory.displayedOperations;
  }

  private inputValueSetDialogIsOpened = false;
  private screenshotDialogIsOpened = false;

  private recentImageInfo = "";

  private get updating(): boolean {
    return this.$store.state.operationHistory.screenHistoryIsUpdating;
  }

  private get screenshotUrl(): string {
    return this.imageInfo.decode ?? "";
  }

  private get screenshotName(): string {
    const url = this.imageInfo.decode;
    const ar = url.split(".");
    const ext = ar[ar.length - 1];
    const sequence = this.selectedOperationSequence;
    return `${sequence}.${ext}`;
  }

  @Watch("diagramType")
  private onChangeDialogType() {
    this.updateWindowTitle();
  }

  @Watch("locale")
  private onChangeLocale() {
    this.updateWindowTitle();
  }

  private get canUpdateModels(): boolean {
    return this.$store.state.operationHistory.canUpdateModels;
  }

  private updateScreenHistory() {
    (async () => {
      await this.$store.dispatch("operationHistory/updateScreenHistory");
    })();
  }

  private updateWindowTitle() {
    switch (this.diagramType) {
      case this.DIAGRAM_TYPE_SEQUENCE:
        this.changeWindowTitle(this.message("sequence.window-title"));
        return;
      case this.DIAGRAM_TYPE_SCREEN_TRANSITION:
        this.changeWindowTitle(this.message("screen-transition.window-title"));
        return;
      case this.DIAGRAM_TYPE_ELEMENT_COVERAGE:
        this.changeWindowTitle(this.message("coverage.window-title"));
        return;
      default:
        return;
    }
  }

  private created() {
    this.selectLastOperation();
    this.updateWindowTitle();
  }

  @Watch("history")
  private onChangeHistory(newValue: [], oldValue: []) {
    if (newValue.length !== oldValue.length) {
      this.selectLastOperation();
      this.scrollGraphArea();
    }
  }

  private selectLastOperation() {
    const lastOperation = this.history[this.history.length - 1];
    if (!lastOperation) {
      return;
    }
    this.selectOperation(lastOperation.operation.sequence);
  }

  private selectFirstOperation() {
    const firstOperation = this.history[0];
    if (!firstOperation) {
      return;
    }
    this.selectOperation(firstOperation.operation.sequence);
  }

  private selectOperation(selectedOperationSequence: number) {
    this.$store.commit("operationHistory/selectOperation", {
      sequence: selectedOperationSequence,
    });
  }

  private resetOperationFilter() {
    this.$store.commit("operationHistory/setDisplayedOperations", {
      sequences: [],
    });
  }

  private callSetRecentImageInfo(sequence: number) {
    let cnt = 0;
    const id = setInterval(() => {
      const decodeImageData = this.searchRecentImageInfo(sequence);
      if (decodeImageData !== "") {
        this.recentImageInfo = decodeImageData;
        clearInterval(id);
      }
      if (cnt > 10) {
        this.recentImageInfo = "";
        clearInterval(id);
      }
      cnt++;
    }, 100);
  }

  /**
   * Find the most recent image file from the specified sequence number and return the file path.
   */
  private searchRecentImageInfo(sequence: number): string {
    // Some history of image data in the most recent sequence.
    const recentHistory = this.history
      .slice()
      .reverse()
      .filter((val) => {
        return !!val.operation.imageFilePath;
      })
      .find((val) => {
        return sequence >= val.operation.sequence;
      });
    if (recentHistory) {
      const imageFilePath = recentHistory.operation.compressedImageFilePath
        ? recentHistory.operation.compressedImageFilePath
        : recentHistory.operation.imageFilePath;
      return imageFilePath;
    }
    return "";
  }

  private scrollGraphArea() {
    if (this.diagramType === this.DIAGRAM_TYPE_SEQUENCE) {
      this.$nextTick(() => {
        (this.$refs.mermaidGraphDisplay as Element).scrollTop = (
          this.$refs.mermaidGraphDisplay as Element
        ).scrollHeight;
      });
    }
  }
}
</script>

<style lang="sass" scoped>
.disp-coverage
  height: 100%

.default-theme
  padding-left: 16px
  padding-right: 16px
  background-color: #f2f2f2

.screenshot-button
  position: absolute
  z-index: 10

  &-multi
    bottom: 45px
  &-single
    bottom: 0px
</style>
