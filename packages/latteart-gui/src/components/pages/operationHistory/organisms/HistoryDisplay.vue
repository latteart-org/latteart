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
  <splitpanes
    horizontal
    @resized="resize('vertical', $event)"
    class="default-theme"
  >
    <pane
      :size="verticalPaneSize"
      :class="{
        'disp-coverage': dispCoverage,
        'hidden-coverage': !dispCoverage,
      }"
    >
      <div style="position: relative" class="pt-2">
        <v-btn
          color="blue"
          :loading="updating"
          :dark="canUpdateModels"
          :disabled="!canUpdateModels"
          @click="updateTestResultViewModel"
          >{{ message("history-view.update-model-and-coverage") }}</v-btn
        >
        <span v-if="canUpdateModels" :style="{ color: 'red' }">{{
          message("history-view.there-are-updates-on-history")
        }}</span>
      </div>
      <splitpanes
        @resized="resize('horizontal', $event)"
        :style="{ height: 'calc(100% - 44px)' }"
      >
        <pane :size="horizontalPaneSize">
          <v-container fluid fill-height class="pa-0 ma-0">
            <v-row no-gutters>
              <v-col cols="12">
                <v-radio-group
                  v-model="diagramType"
                  row
                  class="py-0"
                  hide-details
                >
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
              </v-col>
            </v-row>
            <v-row
              no-gutters
              :style="{ 'overflow-y': 'auto', height: 'calc(100% - 70px)' }"
              ref="mermaidGraphDisplay"
            >
              <v-col cols="12" class="pt-0 fill-height">
                <element-coverage
                  v-if="diagramType === DIAGRAM_TYPE_ELEMENT_COVERAGE"
                  :message="message"
                ></element-coverage>
                <history-summary-diagram
                  v-if="diagramType !== DIAGRAM_TYPE_ELEMENT_COVERAGE"
                  :diagramType="diagramType"
                  :message="message"
                ></history-summary-diagram>
              </v-col>
            </v-row>
          </v-container>
        </pane>
        <pane>
          <v-container fluid pa-0 fill-height style="position: relative">
            <template>
              <v-row no-gutters>
                <v-col cols="12">
                  <v-radio-group
                    v-model="displayedMediaType"
                    row
                    class="py-0 pl-2"
                    hide-details
                    v-if="hasStillImage || hasVideo"
                  >
                    <v-radio
                      :label="message('history-view.image')"
                      value="image"
                      :disabled="!hasStillImage"
                    ></v-radio>
                    <v-radio
                      :label="message('history-view.video')"
                      value="video"
                      :disabled="!hasVideo"
                    ></v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>
              <v-row no-gutters :style="{ height: 'calc(100% - 70px)' }">
                <v-col cols="12" class="fill-height pl-2">
                  <screencapture-display
                    v-if="displayedMediaType === 'image'"
                  />
                  <screencast-display v-else />
                </v-col>
              </v-row>
            </template>
          </v-container>
        </pane>
      </splitpanes>
    </pane>
    <pane v-if="!dispCoverage" style="z-index: 6">
      <operation-list
        v-if="diagramType === DIAGRAM_TYPE_SEQUENCE"
        :displayedOperations="displayedOperations"
        :onSelectOperation="selectOperation"
        :history="history"
        :selectedOperationSequence="selectedOperationSequence"
        :message="message"
        :operationContextEnabled="operationContextEnabled"
      ></operation-list>

      <decision-table
        v-if="diagramType === DIAGRAM_TYPE_SCREEN_TRANSITION"
        :message="message"
      ></decision-table>
    </pane>

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </splitpanes>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import {
  OperationHistory,
  ScreenDef,
  MessageProvider,
} from "@/lib/operationHistory/types";
import HistorySummaryDiagram from "@/components/pages/operationHistory/organisms/HistorySummaryDiagram.vue";
import OperationList from "@/components/pages/operationHistory/organisms/OperationList.vue";
import ElementCoverage from "@/components/pages/operationHistory/organisms/ElementCoverage.vue";
import DecisionTable from "./DecisionTable.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import ErrorMessageDialog from "../../common/ErrorMessageDialog.vue";
import ScreencastDisplay from "./ScreencastDisplay.vue";
import ScreencaptureDisplay from "./ScreencaptureDisplay.vue";

@Component({
  components: {
    "history-summary-diagram": HistorySummaryDiagram,
    "operation-list": OperationList,
    "element-coverage": ElementCoverage,
    "decision-table": DecisionTable,
    "screencast-display": ScreencastDisplay,
    "screencapture-display": ScreencaptureDisplay,
    Splitpanes,
    Pane,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class HistoryDisplay extends Vue {
  @Prop({ type: Boolean, default: false })
  public readonly scriptGenerationEnabled!: boolean;
  @Prop({ type: String, default: "ja" }) public readonly locale!: string;
  @Prop({ type: Array, default: [] })
  public readonly rawHistory!: OperationHistory;
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

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private mediaType: "image" | "video" = "image";

  private readonly DIAGRAM_TYPE_SEQUENCE: string = "sequence";
  private readonly DIAGRAM_TYPE_SCREEN_TRANSITION: string = "screenTransition";
  private readonly DIAGRAM_TYPE_ELEMENT_COVERAGE: string = "coverage";

  private diagramType: string = this.DIAGRAM_TYPE_SEQUENCE;

  private verticalPaneSize: number = 0;
  private horizontalPaneSize: number = 0;

  private get verticalPaneSizeKey(): string {
    return "latteart-management-verticalPaneSizeKey";
  }

  private get horizontalPaneSizeKey(): string {
    return "latteart-management-horizontalPaneSizeKey";
  }

  private setPaneSize(key: "vertical" | "horizontal", value: number) {
    localStorage.setItem(
      key === "vertical"
        ? this.verticalPaneSizeKey
        : this.horizontalPaneSizeKey,
      value.toString()
    );
  }

  private getPaneSize(key: "vertical" | "horizontal"): string | null {
    return localStorage.getItem(
      key === "vertical" ? this.verticalPaneSizeKey : this.horizontalPaneSizeKey
    );
  }

  private get dispCoverage() {
    return this.diagramType === this.DIAGRAM_TYPE_ELEMENT_COVERAGE;
  }

  private get operationHistoryState() {
    return this.$store.state.operationHistory as OperationHistoryState;
  }

  private get history(): OperationHistory {
    return [...this.rawHistory];
  }

  private get selectedOperationSequence(): number {
    return this.operationHistoryState.selectedOperationSequence;
  }

  private get displayedMediaType(): "image" | "video" {
    return this.mediaType;
  }

  private set displayedMediaType(mediaType: "image" | "video") {
    this.mediaType = mediaType;
  }

  @Watch("hasStillImage")
  @Watch("hasVideo")
  private updateMediaType() {
    this.displayedMediaType = this.hasStillImage ? "image" : "video";
  }

  private get hasStillImage(): boolean {
    const screenImage = this.operationHistoryState.screenImage;

    return (screenImage?.background.image.url ?? "") !== "";
  }

  private get hasVideo(): boolean {
    const screenImage = this.operationHistoryState.screenImage;

    return screenImage?.background.video != null;
  }

  private get displayedOperations(): number[] {
    return this.operationHistoryState.displayedOperations;
  }

  private recentImageInfo = "";

  private get updating(): boolean {
    return this.operationHistoryState.isTestResultViewModelUpdating;
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
    return this.operationHistoryState.canUpdateModels;
  }

  private async updateTestResultViewModel() {
    try {
      const testResultId = this.operationHistoryState.testResultInfo.id;

      await this.$store.dispatch(
        "operationHistory/updateModelsFromSequenceView",
        { testResultId }
      );

      const testResultIds =
        this.operationHistoryState.storingTestResultInfos.map(({ id }) => id);
      await this.$store.dispatch("operationHistory/updateModelsFromGraphView", {
        testResultIds:
          testResultIds.length === 0 ? [testResultId] : testResultIds,
      });

      this.$store.commit("operationHistory/setCanUpdateModels", {
        setCanUpdateModels: false,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        this.errorMessageDialogOpened = true;
        this.errorMessage = error.message;
      } else {
        throw error;
      }
    }
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
    this.verticalPaneSize = Number(this.getPaneSize("vertical") ?? "50");
    this.horizontalPaneSize = Number(this.getPaneSize("horizontal") ?? "50");

    this.selectFirstOperation();
    this.updateWindowTitle();
  }

  @Watch("history")
  private onChangeHistory(newValue: [], oldValue: []) {
    if (oldValue.length === 0) {
      this.selectFirstOperation();
    } else if (newValue.length !== oldValue.length) {
      this.selectLastOperation();
    }
    this.scrollGraphArea();
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
    this.$store.dispatch("operationHistory/selectOperation", {
      sequence: selectedOperationSequence,
    });
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

  private resize(type: "vertical" | "horizontal", event: any) {
    this.setPaneSize(type, event[0].size);
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

  ::v-deep .splitpanes__splitter
    z-index: 5
</style>
