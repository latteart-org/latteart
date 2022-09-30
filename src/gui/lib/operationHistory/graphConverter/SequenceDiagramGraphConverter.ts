/**
 * Copyright 2022 NTT Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import ScreenHistory from "@/lib/operationHistory/ScreenHistory";
import { Edge, WindowHandle } from "@/lib/operationHistory/types";
import MermaidGraph from "../mermaidGraph/MermaidGraph";
import SequenceDiagramGraphExtender from "../mermaidGraph/extender/SequenceDiagramGraphExtender";
import TextUtil from "./TextUtil";

interface NoteInfo {
  id: number;
  sequence: number;
  index?: number;
  type: string;
  details: string;
}

export interface SequenceDiagramGraphCallback {
  onClickEdge: (edge: Edge) => void;
  onClickScreenRect: (screenRectIndex: number) => void;
  onClickNote: (note: NoteInfo) => void;
  onRightClickNote: (
    note: NoteInfo,
    eventInfo: { clientX: number; clientY: number }
  ) => void;
  onRightClickLoopArea: (
    note: NoteInfo,
    eventInfo: { clientX: number; clientY: number }
  ) => void;
}

function buildParticipantText(screenIndex: number, screenDef: string) {
  return `participant s${screenIndex} as ${screenDef}`;
}

function buildDummyNoteText(
  position: "left of" | "right of",
  screenIndex: number
) {
  return `Note ${position} s${screenIndex}: DUMMY_COMMENT`;
}

function buildNoteText(
  position: "left of" | "right of",
  screenIndex: number,
  value: string
) {
  return `Note ${position} s${screenIndex}: ${value}`;
}

function buildScreenTransitionText(
  sourceScreenIndex: number,
  destScreenIndex: number,
  description: string
) {
  return `s${sourceScreenIndex} ->> s${destScreenIndex}: ${description}`;
}

function buildNoScreenTransitionText(
  sourceScreenIndex: number,
  destScreenIndex: number
) {
  return `s${sourceScreenIndex} --x s${destScreenIndex}: `;
}

function buildActivateText(screenIndex: number) {
  return `activate s${screenIndex}`;
}

function buildDeactivateText(screenIndex: number) {
  return `deactivate s${screenIndex}`;
}

/**
 * A class that performs conversions related to Mermaid's sequence diagram display.
 */
export default class SequenceDiagramGraphConverter {
  /**
   *
   * @param screenHistory  Screen transition history.
   * @param windowHandles
   * @param callback.onClickEdge  Callback function called when you click Edge.
   * @param callback.onClickScreenRect  Callback function called when Rect is clicked.
   * @param callback.onClickNote  Callback function called by clicking Note.
   * @param callback.onRightClickNote  Callback function called by right-clicking on Note.
   * @param callback.onRightClickLoopArea  Callback function called by right-clicking on LoopArea.
   * @returns Graph text and graph extension information.
   */
  public static async convert(
    screenHistory: ScreenHistory,
    windowHandles: WindowHandle[],
    callback: SequenceDiagramGraphCallback = {
      onClickEdge: () => {
        /* Do nothing */
      },
      onClickScreenRect: () => {
        /* Do nothing */
      },
      onClickNote: () => {
        /* Do nothing */
      },
      onRightClickNote: () => {
        /* Do nothing */
      },
      onRightClickLoopArea: () => {
        /* Do nothing */
      },
    }
  ): Promise<MermaidGraph> {
    const edges: Edge[] = [];
    let nameMap = new Map<number, string>();
    const newNameMap = new Map<number, string>();

    const appearedScreens = screenHistory.appearedScreens;

    // Text of the screen definition part in the mermaid graph.
    const screenDefinitionTexts = appearedScreens.map(
      (currentScreen, currentIndex) => {
        const screenDef = SequenceDiagramGraphConverter.displayScreenDefOptimal(
          currentIndex,
          newNameMap,
          currentScreen.screenDef,
          15
        );
        return `${buildParticipantText(currentIndex, screenDef)}`;
      }
    );

    // Build mermaid graph text.
    const notes: NoteInfo[] = [];
    const intentions: NoteInfo[] = [];

    let currentIntention = "";
    let currentWindowHandle = "";
    let hasBugOrNoticeInScopeOfWindowHandle = false;
    let startWindowHandleScope = true;

    const graphTextSource = screenHistory.body.map((currentScreen) => {
      return {
        operationHistory: currentScreen.operationHistory,
        screenDef: currentScreen.screenDef,
        title: currentScreen.title,
        url: currentScreen.url,
      };
    });

    const graphTextSteps: string[] = [];

    const addDummyComment = (preScreenId: number, currentScreenId: number) => {
      const dummyCommentPosition =
        currentScreenId > preScreenId ? "left of" : "right of";

      graphTextSteps.push(
        buildDummyNoteText(dummyCommentPosition, currentScreenId)
      );
    };

    for (const [currentIndex, currentScreen] of graphTextSource.entries()) {
      const currentScreenId = appearedScreens.findIndex((screen) => {
        return screen.screenDef === currentScreen.screenDef;
      });

      const preScreen = graphTextSource[currentIndex - 1];
      const preScreenId = preScreen
        ? appearedScreens.findIndex((screen) => {
            return screen.screenDef === preScreen.screenDef;
          })
        : 0;

      // Screen transition.
      if (currentIndex > 0) {
        const lastOperation =
          preScreen.operationHistory[preScreen.operationHistory.length - 1]
            .operation;
        const lastOperationElementValue =
          lastOperation.elementInfo === null
            ? ""
            : TextUtil.ellipsis(
                TextUtil.toSingleLine(lastOperation.textValue),
                20
              );
        const transitionText = `(${lastOperation.sequence})${
          lastOperation.type
        }: ${TextUtil.escapeSpecialCharacters(lastOperationElementValue)}`;

        if (
          lastOperation.windowHandle ===
          currentScreen.operationHistory[0]?.operation.windowHandle
        ) {
          graphTextSteps.push(
            buildScreenTransitionText(
              preScreenId,
              currentScreenId,
              transitionText
            )
          );

          graphTextSteps.push(buildDeactivateText(preScreenId));
          graphTextSteps.push(buildActivateText(currentScreenId));
        } else {
          graphTextSteps.push(
            buildNoScreenTransitionText(preScreenId, preScreenId)
          );

          graphTextSteps.push(buildDeactivateText(preScreenId));
        }

        edges.push({
          source: {
            title: preScreen.title,
            url: preScreen.url,
            screenDef: preScreen.screenDef,
          },
          target: {
            title: currentScreen.title,
            url: currentScreen.url,
            screenDef: currentScreen.screenDef,
          },
          operationHistory: preScreen.operationHistory,
        });
      }

      const summarizedOperations = currentScreen.operationHistory
        .filter((item, index) => {
          return (
            item.intention ||
            item.bugs ||
            item.notices ||
            index === currentScreen.operationHistory.length - 1
          );
        })
        .map((item) => {
          return {
            windowHandle: item.operation.windowHandle,
            sequence: item.operation.sequence,
            intention: item.intention
              ? {
                  value: item.intention.value,
                  details: item.intention.details,
                }
              : null,
            bugs:
              item.bugs?.map(({ value, details, tags }) => {
                return { value, details, tags };
              }) ?? [],
            notices:
              item.notices?.map(({ value, details, tags }) => {
                return { value, details, tags };
              }) ?? [],
          };
        });

      for (const [
        index,
        { windowHandle, sequence, intention, bugs, notices },
      ] of summarizedOperations.entries()) {
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            // Start of intention.
            if (intention !== null) {
              if (
                graphTextSteps.findIndex((stepText) =>
                  stepText.startsWith("opt")
                ) !== -1
              ) {
                if (!hasBugOrNoticeInScopeOfWindowHandle) {
                  addDummyComment(preScreenId, currentScreenId);
                }

                graphTextSteps.push("end");
                startWindowHandleScope = false;
              }

              if (
                graphTextSteps.findIndex((stepText) =>
                  stepText.startsWith("alt")
                ) !== -1
              ) {
                graphTextSteps.push("end");
              }
              const intentionPrefix = `(${sequence})`;
              currentIntention = `alt ${intentionPrefix}${TextUtil.escapeSpecialCharacters(
                intention.value
              )}`;
              graphTextSteps.push(currentIntention);

              intentions.push({
                id: currentScreenId,
                sequence: sequence,
                type: "intention",
                details: intention.details,
              });

              // Continue if the same windowHandle continues.
              if (windowHandle && windowHandle === currentWindowHandle) {
                const windowHandleName =
                  SequenceDiagramGraphConverter.getWindowHandleName(
                    windowHandles,
                    currentWindowHandle
                  );

                graphTextSteps.push(`opt (${sequence})${windowHandleName}`);
                startWindowHandleScope = true;
                hasBugOrNoticeInScopeOfWindowHandle = false;
              }
            }

            // When switching windowHandle.
            if (
              currentWindowHandle !== "" &&
              !!windowHandle &&
              currentWindowHandle !== windowHandle &&
              currentScreen.operationHistory.length > 0
            ) {
              currentWindowHandle = windowHandle;

              if (startWindowHandleScope) {
                graphTextSteps.push("end");
                startWindowHandleScope = false;
              }

              const windowHandleName =
                SequenceDiagramGraphConverter.getWindowHandleName(
                  windowHandles,
                  currentWindowHandle
                );

              graphTextSteps.push(`opt (${sequence})${windowHandleName}`);
              graphTextSteps.push(buildActivateText(currentScreenId));
              startWindowHandleScope = true;
              hasBugOrNoticeInScopeOfWindowHandle = false;
            }

            // At the start of windowHandle.
            if (currentWindowHandle === "" && !!windowHandle) {
              currentWindowHandle = windowHandle;
              const windowHandleName =
                SequenceDiagramGraphConverter.getWindowHandleName(
                  windowHandles,
                  currentWindowHandle
                );

              graphTextSteps.push(`opt (${sequence})${windowHandleName}`);

              const preWindowHandle =
                summarizedOperations[index - 1]?.windowHandle;
              if (currentWindowHandle !== preWindowHandle) {
                graphTextSteps.push(buildActivateText(currentScreenId));
              }

              hasBugOrNoticeInScopeOfWindowHandle = false;
            }

            const addNoteGraphText = (
              id: string,
              value: string,
              tags: string[]
            ) => {
              const tagsText = tags.map((tag) => `[${tag}]`).join("");
              const noteValue = `${TextUtil.lineBreak(
                `(${id})${tagsText}`,
                16
              )}<br/>${"-".repeat(1)}<br/>${TextUtil.escapeSpecialCharacters(
                TextUtil.lineBreak(value, 16)
              )}`;

              graphTextSteps.push(
                buildNoteText("right of", currentScreenId, noteValue)
              );
            };

            // Bug balloon.
            if (bugs !== null && Array.isArray(bugs)) {
              bugs.forEach((bug, index) => {
                const id = `${sequence}${bugs.length > 0 ? "-" + index : ""}`;

                addNoteGraphText(id, bug.value, ["bug"]);

                notes.push({
                  id: currentScreenId,
                  sequence,
                  index,
                  type: "bug",
                  details: bug.details,
                });
                hasBugOrNoticeInScopeOfWindowHandle = true;
              });
            }

            // Notice balloon.
            if (notices !== null && Array.isArray(notices)) {
              notices.forEach((notice, index) => {
                const id = `${sequence}${
                  notices.length > 0 ? "-" + index : ""
                }`;

                addNoteGraphText(id, notice.value, notice.tags);

                notes.push({
                  id: currentScreenId,
                  sequence,
                  index,
                  type: "notice",
                  details: notice.details,
                });
                hasBugOrNoticeInScopeOfWindowHandle = true;
              });
            }

            resolve();
          }, 1);
        });
      }

      if (currentIndex === graphTextSource.length - 1) {
        // If windowHandle is started, put the end process at the end.
        if (
          graphTextSteps.findIndex((stepText) => stepText.startsWith("opt")) !==
          -1
        ) {
          if (!hasBugOrNoticeInScopeOfWindowHandle) {
            addDummyComment(preScreenId, currentScreenId);
          }

          graphTextSteps.push(buildDeactivateText(currentScreenId));

          graphTextSteps.push("end");
        }

        // If intention is started, put end processing at the end.
        if (
          graphTextSteps.findIndex((stepText) => stepText.startsWith("alt")) !==
          -1
        ) {
          graphTextSteps.push("end");
        }

        edges.push({
          source: {
            title: currentScreen.title,
            url: currentScreen.url,
            screenDef: currentScreen.screenDef,
          },
          target: {
            title: currentScreen.title,
            url: currentScreen.url,
            screenDef: currentScreen.screenDef,
          },
          operationHistory: currentScreen.operationHistory,
        });
      }
      nameMap = newNameMap;
    }

    const graphText = `${[
      "sequenceDiagram",
      ...screenDefinitionTexts,
      ...graphTextSteps,
    ].join(";\n")};\n`;

    const graphExtender = new SequenceDiagramGraphExtender({
      callback: {
        onClickEdge: (index: number) => callback.onClickEdge(edges[index]),
        onClickScreenRect: (index: number) =>
          callback.onClickScreenRect(
            appearedScreens[index].operationHistory[0].operation.sequence
          ),
        onClickNote: (index: number) => callback.onClickNote(notes[index]),
        onRightClickNote: (
          index: number,
          eventInfo: { clientX: number; clientY: number }
        ) => {
          callback.onRightClickNote(notes[index], eventInfo);
        },
        onRightClickLoopArea: (
          index: number,
          eventInfo: { clientX: number; clientY: number }
        ) => {
          callback.onRightClickLoopArea(intentions[index], eventInfo);
        },
      },
      tooltipTextsOfNote: notes.map((noteInfo) => noteInfo.details),
      tooltipTextsOfLoopArea: intentions.map(
        (intentionInfo) => intentionInfo.details
      ),
      nameMap,
    });

    console.log(graphText);

    return {
      graphText,
      graphExtender,
    };
  }

  /**
   * Get windowHandle name.
   * @returns windowHandle name.
   */
  private static getWindowHandleName(
    windowHandles: WindowHandle[],
    value: string
  ) {
    const found = windowHandles.find((windowHandle: WindowHandle) => {
      return windowHandle.value === value;
    });
    if (found === undefined) {
      return "";
    }

    return found.text;
  }

  /**
   * Convert screen name for sequence diagram display and return.
   * @param index
   * @param map
   * @param screenDef
   * @param lineLength
   */
  private static displayScreenDefOptimal(
    index: number,
    map: Map<number, string>,
    screenDef: string,
    lineLength: number
  ): string {
    map.set(index, screenDef);
    const name = screenDef;
    const ellipsis = TextUtil.ellipsis(
      TextUtil.toSingleLine(name),
      lineLength * 3
    );

    return TextUtil.escapeSpecialCharacters(
      TextUtil.lineBreak(ellipsis, lineLength)
    );
  }
}
