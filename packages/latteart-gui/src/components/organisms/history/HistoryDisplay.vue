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
  <v-container fluid fill-height class="pa-0">
    <splitpanes horizontal @resized="resize('vertical', $event)" class="default-theme">
      <pane
        :size="verticalPaneSize"
        :class="{
          'disp-coverage': dispCoverage,
          'hidden-coverage': !dispCoverage
        }"
      >
        <div style="position: relative" class="pt-2">
          <v-btn
            color="blue"
            :loading="updating"
            :dark="canUpdateModels"
            :disabled="!canUpdateModels"
            @click="updateTestResultViewModel"
            >{{ message("test-result-page.update-model-and-coverage") }}</v-btn
          >
          <span v-if="canUpdateModels" :style="{ color: 'red' }">{{
            message("test-result-page.there-are-updates-on-history")
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
                  <v-radio-group v-model="diagramType" inline class="py-0" hide-details>
                    <v-radio
                      :label="message('test-result-page.sequence')"
                      :value="DIAGRAM_TYPE_SEQUENCE"
                    ></v-radio>
                    <v-radio
                      :label="message('test-result-page.screen-transition')"
                      :value="DIAGRAM_TYPE_SCREEN_TRANSITION"
                    ></v-radio>
                    <v-radio
                      :label="message('test-result-page.element-coverage')"
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
            <v-container fluid class="pa-0" fill-height style="position: relative">
              <template>
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-radio-group
                      v-model="displayedMediaType"
                      inline
                      class="py-0 pl-2"
                      hide-details
                      v-if="hasStillImage || hasVideo"
                    >
                      <v-radio
                        :label="message('test-result-page.image')"
                        value="image"
                        :disabled="!hasStillImage"
                      ></v-radio>
                      <v-radio
                        :label="message('test-result-page.video')"
                        value="video"
                        :disabled="!hasVideo"
                      ></v-radio>
                    </v-radio-group>
                  </v-col>
                </v-row>
                <v-row no-gutters :style="{ height: 'calc(100% - 70px)' }">
                  <v-col cols="12" class="fill-height pl-2">
                    <screencapture-display v-if="displayedMediaType === 'image'" />
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
          :selectedOperationInfo="selectedOperationInfo"
          :message="message"
          :operationContextEnabled="operationContextEnabled"
        ></operation-list>

        <decision-table
          v-if="diagramType === DIAGRAM_TYPE_SCREEN_TRANSITION"
          :message="message"
        ></decision-table>
      </pane>
    </splitpanes>
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :onAccept="confirmDialogAccept"
      @close="confirmDialogOpened = false"
    />

    <test-purpose-edit-dialog
      :opened="testPurposeEditDialogOpened"
      @close="testPurposeEditDialogOpened = false"
    />
    <note-register-dialog
      :opened="noteRegisterDialogOpened"
      @close="noteRegisterDialogOpened = false"
    />

    <note-update-dialog :opened="noteUpdateDialogOpened" @close="noteUpdateDialogOpened = false" />

    <context-menu
      :opened="contextMenuOpened"
      :x="contextMenuX"
      :y="contextMenuY"
      :items="contextMenuItems"
      @contextMenuClose="contextMenuOpened = false"
    />
  </v-container>
</template>

<script lang="ts">
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import {
  OperationHistory,
  ScreenDef,
  MessageProvider,
  OperationWithNotes
} from "@/lib/operationHistory/types";
import HistorySummaryDiagram from "@/components/organisms/history/HistorySummaryDiagram.vue";
import OperationList from "@/components/organisms/history/OperationList.vue";
import ElementCoverage from "@/components/organisms/history/ElementCoverage.vue";
import DecisionTable from "@/components/organisms/history/DecisionTable.vue";
import { OperationHistoryState } from "@/store/operationHistory";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import ConfirmDialog from "@/components/molecules/ConfirmDialog.vue";
import ScreencastDisplay from "@/components/organisms/history/ScreencastDisplay.vue";
import ScreencaptureDisplay from "@/components/organisms/history/ScreencaptureDisplay.vue";
import TestPurposeEditDialog from "@/components/organisms/dialog/TestPurposeEditDialog.vue";
import ContextMenu from "@/components/molecules/ContextMenu.vue";
import NoteRegisterDialog from "@/components/organisms/dialog/NoteRegisterDialog.vue";
import NoteUpdateDialog from "@/components/organisms/dialog/NoteUpdateDialog.vue";
import { computed, defineComponent, onMounted, ref, nextTick, watch, inject } from "vue";
import { useStore } from "@/store";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    scriptGenerationEnabled: { type: Boolean, default: false },
    locale: { type: String, default: "ja" },
    rawHistory: {
      type: Array as PropType<OperationHistory>,
      default: []
    },
    message: {
      type: Function as PropType<MessageProvider>,
      required: true
    },
    operationContextEnabled: { type: Boolean, default: false },
    screenDefinitionConfig: {
      type: Object as PropType<{
        screenDefType: string;
        isRegex: boolean;
        screenDefList: ScreenDef[];
      }>,
      default: () => {
        return {
          screenDefType: "title",
          isRegex: false,
          screenDefList: []
        };
      }
    },
    changeWindowTitle: {
      type: Function as PropType<(windowTitle: string) => void>,
      default: (windowTitle: string) => {
        document.title = `operation viewer [${windowTitle}]`;
      }
    },
    testResultId: { type: String, default: "" }
  },
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
    "test-purpose-edit-dialog": TestPurposeEditDialog,
    "confirm-dialog": ConfirmDialog,
    "context-menu": ContextMenu,
    "note-register-dialog": NoteRegisterDialog,
    "note-update-dialog": NoteUpdateDialog
  },
  setup(props) {
    const store = useStore();

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const mediaType = ref<"image" | "video">("image");

    const DIAGRAM_TYPE_SEQUENCE = ref<string>("sequence");
    const DIAGRAM_TYPE_SCREEN_TRANSITION = ref<string>("screenTransition");
    const DIAGRAM_TYPE_ELEMENT_COVERAGE = ref<string>("coverage");

    const diagramType = ref<string>(DIAGRAM_TYPE_SEQUENCE.value);

    const verticalPaneSize = ref<number>(0);
    const horizontalPaneSize = ref<number>(0);

    const testPurposeEditDialogOpened = ref(false);
    const noteUpdateDialogOpened = ref(false);
    const noteRegisterDialogOpened = ref(false);

    const contextMenuOpened = ref(false);
    const contextMenuX = ref(-1);
    const contextMenuY = ref(-1);
    const contextMenuItems = ref<{ label: string; onClick: () => void }[]>([]);

    const confirmDialogOpened = ref(false);
    const confirmDialogTitle = ref("");
    const confirmDialogMessage = ref("");
    const confirmDialogAccept = ref(() => {
      /* Do nothing */
    });

    const mermaidGraphDisplay = ref(null);
    const isViewerMode = inject("isViewerMode") ?? false;

    const openNoteMenu = (
      note: {
        id: number;
        sequence: number;
        index: number;
        type: string;
        value: string;
      },
      eventInfo: { clientX: number; clientY: number }
    ) => {
      if (isViewerMode) {
        console.log("isViewerMode");
        return;
      }

      contextMenuX.value = eventInfo.clientX;
      contextMenuY.value = eventInfo.clientY;
      contextMenuItems.value = [];

      contextMenuItems.value.push({
        label: store.getters.message("test-result-page.edit-notice", {
          value: note.value
        }),
        onClick: () => {
          if ((store.state as any).operationHistory.tmpNoteInfoForEdit) {
            (store.state as any).operationHistory.openNoteEditDialog(
              note.type,
              note.sequence,
              note.index
            );
          }

          contextMenuOpened.value = false;
          store.commit("operationHistory/setTmpNoteInfoForEdit", {
            tmpNoteInfoForEdit: null
          });
        }
      });
      contextMenuItems.value.push({
        label: store.getters.message("test-result-page.delete-notice", {
          value: note.value
        }),
        onClick: () => {
          if ((store.state as any).operationHistory.tmpNoteInfoForEdit) {
            (store.state as any).operationHistory.deleteNote(note.type, note.sequence, note.index);
          }

          contextMenuOpened.value = false;
          store.commit("operationHistory/setTmpNoteInfoForEdit", {
            tmpNoteInfoForEdit: null
          });
        }
      });

      store.commit("operationHistory/setTmpNoteInfoForEdit", {
        tmpNoteInfoForEdit: {
          noteType: note.type,
          sequence: note.sequence,
          index: note.index
        }
      });
      contextMenuOpened.value = true;
    };

    const openNoteEditDialog = (noteType: string, sequence: number, index?: number) => {
      const historyItem: OperationWithNotes =
        store.getters["operationHistory/findHistoryItem"](sequence);
      if (historyItem === undefined) {
        return;
      }
      switch (noteType) {
        case "intention":
          store.commit("operationHistory/selectOperationNote", {
            selectedOperationNote: {
              sequence: sequence ?? null,
              index: index ?? null
            }
          });
          testPurposeEditDialogOpened.value = true;
          return;
        case "bug":
        case "notice":
          store.commit("operationHistory/selectOperationNote", {
            selectedOperationNote: {
              sequence: sequence ?? null,
              index: index ?? null
            }
          });

          if (index !== undefined) {
            noteUpdateDialogOpened.value = true;
          } else {
            noteRegisterDialogOpened.value = true;
          }

          return;
        default:
          return;
      }
    };

    const openNoteDeleteConfirmDialog = (
      noteType: string,
      title: string,
      sequence: number,
      index?: number
    ) => {
      if (noteType === "intention") {
        confirmDialogTitle.value = store.getters.message("test-result-page.delete-intention");
        confirmDialogMessage.value = store.getters.message(
          "test-result-page.delete-intention-message",
          { value: title }
        );
      } else {
        confirmDialogTitle.value = store.getters.message("test-result-page.delete-notice-title");
        confirmDialogMessage.value = store.getters.message(
          "test-result-page.delete-notice-message",
          { value: title }
        );
      }

      confirmDialogAccept.value = () => {
        deleteNote(noteType, sequence, index ?? 0);
      };
      confirmDialogOpened.value = true;
    };

    const deleteNote = (noteType: string, sequence: number, index: number) => {
      (async () => {
        try {
          switch (noteType) {
            case "intention":
              store.dispatch("operationHistory/deleteTestPurpose", {
                sequence
              });
              return;
            case "bug":
            case "notice":
              store.dispatch("operationHistory/deleteNotice", {
                sequence,
                index
              });
              return;
            default:
              return;
          }
        } catch (error) {
          if (error instanceof Error) {
            errorMessageDialogOpened.value = true;
            errorMessage.value = error.message;
          } else {
            throw error;
          }
        }
      })();
    };

    const verticalPaneSizeKey = computed((): string => {
      return "latteart-management-verticalPaneSizeKey";
    });

    const horizontalPaneSizeKey = computed((): string => {
      return "latteart-management-horizontalPaneSizeKey";
    });

    const setPaneSize = (key: "vertical" | "horizontal", value: number) => {
      localStorage.setItem(
        key === "vertical" ? verticalPaneSizeKey.value : horizontalPaneSizeKey.value,
        value.toString()
      );
    };

    const getPaneSize = (key: "vertical" | "horizontal"): string | null => {
      return localStorage.getItem(
        key === "vertical" ? verticalPaneSizeKey.value : horizontalPaneSizeKey.value
      );
    };

    const dispCoverage = computed(() => {
      return diagramType.value === DIAGRAM_TYPE_ELEMENT_COVERAGE.value;
    });

    const operationHistoryState = computed(() => {
      return (store.state as any).operationHistory as OperationHistoryState;
    });

    const history = computed((): OperationHistory => {
      return [...props.rawHistory];
    });

    const selectedOperationInfo = computed((): { sequence: number; doScroll: boolean } => {
      return operationHistoryState.value.selectedOperationInfo;
    });

    const displayedMediaType = computed({
      get: (): "image" | "video" => mediaType.value,
      set: (type: "image" | "video") => {
        mediaType.value = type;
      }
    });

    const updateMediaType = () => {
      displayedMediaType.value = hasStillImage.value ? "image" : "video";
    };

    const hasStillImage = computed((): boolean => {
      const screenImage = operationHistoryState.value.screenImage;

      return (screenImage?.background.image.url ?? "") !== "";
    });

    const hasVideo = computed((): boolean => {
      const screenImage = operationHistoryState.value.screenImage;

      return screenImage?.background.video != null;
    });

    const displayedOperations = computed((): number[] => {
      return operationHistoryState.value.displayedOperations;
    });

    const updating = computed((): boolean => {
      return operationHistoryState.value.isTestResultViewModelUpdating;
    });

    const onChangeDialogType = () => {
      updateWindowTitle();
    };

    const canUpdateModels = computed((): boolean => {
      return operationHistoryState.value.canUpdateModels;
    });

    const updateTestResultViewModel = async () => {
      try {
        const testResultId = operationHistoryState.value.testResultInfo.id;

        if (!testResultId) {
          return;
        }

        await store.dispatch("operationHistory/updateModelsFromSequenceView", {
          testResultId
        });

        const testResultIds = operationHistoryState.value.storingTestResultInfos.map(
          ({ id }) => id
        );
        await store.dispatch("operationHistory/updateModelsFromGraphView", {
          testResultIds: testResultIds.length === 0 ? [testResultId] : testResultIds
        });

        store.commit("operationHistory/setCanUpdateModels", {
          setCanUpdateModels: false
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(error);
          errorMessageDialogOpened.value = true;
          errorMessage.value = error.message;
        } else {
          throw error;
        }
      }
    };

    const updateWindowTitle = () => {
      switch (diagramType.value) {
        case DIAGRAM_TYPE_SEQUENCE.value:
          props.changeWindowTitle(props.message("sequence.window-title"));
          return;
        case DIAGRAM_TYPE_SCREEN_TRANSITION.value:
          props.changeWindowTitle(props.message("screen-transition.window-title"));
          return;
        case DIAGRAM_TYPE_ELEMENT_COVERAGE.value:
          props.changeWindowTitle(props.message("coverage.window-title"));
          return;
        default:
          return;
      }
    };

    const onChangeHistory = (newValue: OperationHistory, oldValue: OperationHistory) => {
      if (oldValue.length === 0) {
        selectFirstOperation();
      } else if (newValue.length !== oldValue.length) {
        selectLastOperation();
      }
      scrollGraphArea();
    };

    const selectLastOperation = () => {
      const lastOperation = history.value[history.value.length - 1];
      if (!lastOperation) {
        return;
      }
      selectOperation(lastOperation.operation.sequence, false);
    };

    const selectFirstOperation = () => {
      const firstOperation = history.value[0];
      if (!firstOperation) {
        return;
      }
      selectOperation(firstOperation.operation.sequence, false);
    };

    const selectOperation = (sequence: number, doScroll: boolean) => {
      store.dispatch("operationHistory/selectOperation", {
        sequence,
        doScroll
      });
    };

    const scrollGraphArea = () => {
      if (diagramType.value === DIAGRAM_TYPE_SEQUENCE.value) {
        nextTick(() => {
          (mermaidGraphDisplay.value as any).scrollTop = (
            mermaidGraphDisplay.value as any
          ).scrollHeight;
        });
      }
    };

    const resize = (type: "vertical" | "horizontal", event: any) => {
      setPaneSize(type, event[0].size);
    };

    onMounted(async () => {
      store.commit("operationHistory/setOpenNoteEditDialogFunction", {
        openNoteEditDialog: openNoteEditDialog
      });
      store.commit("operationHistory/setOpenNoteDeleteConfirmDialogFunction", {
        openNoteDeleteConfirmDialog: openNoteDeleteConfirmDialog
      });
      store.commit("operationHistory/setOpenNoteMenu", {
        menu: openNoteMenu
      });

      store.commit("operationHistory/setDeleteNoteFunction", {
        deleteNote: deleteNote
      });
      await updateTestResultViewModel();
    });

    watch(hasStillImage, updateMediaType);
    watch(hasVideo, updateMediaType);
    watch(diagramType, onChangeDialogType);
    watch(history, onChangeHistory);

    verticalPaneSize.value = Number(getPaneSize("vertical") ?? "50");
    horizontalPaneSize.value = Number(getPaneSize("horizontal") ?? "50");

    selectFirstOperation();
    updateWindowTitle();

    return {
      errorMessageDialogOpened,
      errorMessage,
      DIAGRAM_TYPE_SEQUENCE,
      DIAGRAM_TYPE_SCREEN_TRANSITION,
      DIAGRAM_TYPE_ELEMENT_COVERAGE,
      diagramType,
      verticalPaneSize,
      horizontalPaneSize,
      testPurposeEditDialogOpened,
      noteUpdateDialogOpened,
      noteRegisterDialogOpened,
      contextMenuOpened,
      contextMenuX,
      contextMenuY,
      contextMenuItems,
      confirmDialogOpened,
      confirmDialogTitle,
      confirmDialogMessage,
      confirmDialogAccept,
      mermaidGraphDisplay,
      dispCoverage,
      history,
      selectedOperationInfo,
      displayedMediaType,
      hasStillImage,
      hasVideo,
      displayedOperations,
      updating,
      canUpdateModels,
      updateTestResultViewModel,
      selectOperation,
      resize
    };
  }
});
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
