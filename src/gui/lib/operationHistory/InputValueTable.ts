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

import { Operation } from "./Operation";
import { ElementInfo, OperationWithNotes } from "./types";
import { normalizeXPath } from "../common/util";
import { Note } from "./Note";

export interface InputValueTableHeaderColumn {
  intention: string;
  screenTransitions: Array<{
    index: number;
    sourceScreenDef: string;
    targetScreenDef: string;
    trigger: {
      elementText: string;
      eventType: string;
    };
    notes: Note[];
    operationHistory: OperationWithNotes[];
  }>;
}

export interface InputValueTableRow {
  elementId: string;
  elementName: string;
  elementType: string;
  sequence: number;
  inputs: Array<{
    value: string;
    isDefaultValue: boolean;
  }>;
}

/**
 * Class that handles input value table.
 */
export default class InputValueTable {
  /**
   * Get column size.
   */
  public get columnSize(): number {
    return Array.from(this.intentionToScreenTransitions.values()).flat().length;
  }

  /**
   * Get column header.
   */
  public get headerColumns(): InputValueTableHeaderColumn[] {
    return Array.from(this.intentionToScreenTransitions.entries())
      .map(([intention, transitions]) => {
        return {
          intention,
          screenTransitions: transitions.map((transition, index) => {
            const triggerOperation: Operation | undefined =
              transition.history[transition.history.length - 1]?.operation;
            const transitionNotes: Note[] = transition.history.flatMap(
              (item) => {
                return [...(item.notices ?? []), ...(item.bugs ?? [])];
              }
            );
            const transitionHistory: OperationWithNotes[] =
              transition.history.filter((history) => {
                return !!history.notices && history.notices.length > 0;
              });

            return {
              index,
              sourceScreenDef: transition.sourceScreenDef,
              targetScreenDef: transition.targetScreenDef,
              trigger: {
                elementText: triggerOperation?.elementInfo?.text ?? "",
                eventType: triggerOperation?.type ?? "",
              },
              notes: transitionNotes,
              operationHistory: transitionHistory,
            };
          }),
        };
      })
      .filter(({ screenTransitions }) => {
        return screenTransitions.length > 0;
      });
  }

  /**
   * Get all lines.
   */
  public get rows(): InputValueTableRow[] {
    const transitions = Array.from(
      this.intentionToScreenTransitions.values()
    ).flat();

    const inputElementsWithSequence =
      this.createInputElementsWithSequence(transitions);

    return inputElementsWithSequence
      .map(({ name, elementInfo, sequence }) => {
        const inputs = [];
        for (const { history, inputElements } of transitions) {
          const operationsOfTargetElement = history.filter(({ operation }) => {
            if (operation.elementInfo === null) {
              return false;
            }

            return (
              normalizeXPath(operation.elementInfo.xpath) ===
              normalizeXPath(elementInfo.xpath)
            );
          });

          const inputValues = operationsOfTargetElement.map(({ operation }) => {
            return {
              inputValue: operation.inputValue,
            };
          });
          const targetElement = inputElements.find((inputElement) => {
            return (
              normalizeXPath(inputElement.xpath) ===
              normalizeXPath(elementInfo.xpath)
            );
          });

          const defaultValue = targetElement
            ? InputValueTable.getDefaultValueOfElement(targetElement)
            : "";

          if (inputValues.length !== 0) {
            inputs.push({
              value: inputValues.slice(-1)[0]?.inputValue ?? "",
              isDefaultValue: false,
            });
          } else {
            inputs.push({
              value: defaultValue,
              isDefaultValue: true,
            });
          }
        }
        return {
          elementId: elementInfo.attributes.id ?? "",
          elementName: name,
          elementType: elementInfo.attributes.type ?? "",
          sequence,
          inputs,
        };
      })
      .reverse();
  }

  /**
   * Get screen transition with intention.
   * @param key Intention.
   * @returns Screen transition.
   */
  public getScreenTransitionWithIntention(key: string):
    | {
        sourceScreenDef: string;
        targetScreenDef: string;
        history: OperationWithNotes[];
        screenElements: ElementInfo[];
        inputElements: ElementInfo[];
      }[]
    | undefined {
    return this.intentionToScreenTransitions.get(key);
  }

  private static getDefaultValueOfElement(targetElement: ElementInfo) {
    if (targetElement.tagname.toLowerCase() === "input") {
      if (
        targetElement.attributes.type &&
        targetElement.attributes.type.toLowerCase() === "checkbox"
      ) {
        return targetElement.checked ? "on" : "off";
      }

      if (
        targetElement.attributes.type &&
        targetElement.attributes.type.toLowerCase() === "radio"
      ) {
        return targetElement.checked ? "on" : "off";
      }
    }

    return targetElement.value ?? "";
  }

  private intentionToScreenTransitions: Map<
    string,
    Array<{
      sourceScreenDef: string;
      targetScreenDef: string;
      history: OperationWithNotes[];
      screenElements: ElementInfo[];
      inputElements: ElementInfo[];
    }>
  > = new Map();

  /**
   * Screen transition information is added to the grouped intentions.
   * @param destIntention
   * @param screenTransition
   */
  public registerScreenTransitionToIntentions(
    destIntention: string,
    ...screenTransition: Array<{
      sourceScreenDef: string;
      targetScreenDef: string;
      history: OperationWithNotes[];
      screenElements: ElementInfo[];
      inputElements: ElementInfo[];
    }>
  ): void {
    if (!this.intentionToScreenTransitions.has(destIntention)) {
      this.intentionToScreenTransitions.set(destIntention, []);
    }

    this.intentionToScreenTransitions
      .get(destIntention)
      ?.push(...screenTransition);
  }

  private collectInputOperations(operationHistory: OperationWithNotes[]) {
    return operationHistory
      .filter(({ operation }) => {
        // Excludes those without elementInfo.
        if (operation.elementInfo === null) {
          return false;
        }
        // Exclude click events without input.
        const hasNoInput =
          operation.input === undefined || operation.input === "";
        if (hasNoInput && operation.type === "click") {
          return false;
        }
        // Excluded if element type is submit.
        if (
          !!operation.elementInfo.attributes.type &&
          operation.elementInfo.attributes.type === "submit"
        ) {
          return false;
        }
        return true;
      })

      .filter((item, index, history) => {
        // Exclude duplicate input elements between OperationHistoryItems.
        return (
          history.findIndex(({ operation }) => {
            return (
              operation.elementInfo!.attributes.name ===
              item.operation.elementInfo!.attributes.name
            );
          }) === index
        );
      });
  }

  private createInputElementsWithSequence(
    transitions: Array<{
      sourceScreenDef: string;
      targetScreenDef: string;
      history: OperationWithNotes[];
      screenElements: ElementInfo[];
      inputElements: ElementInfo[];
    }>
  ): Array<{
    id: string;
    name: string;
    elementInfo: ElementInfo;
    sequence: number;
  }> {
    // The last input element that appeared and the sequence number at that time.
    const inputtedElements: Array<{
      sequence: number;
      element: ElementInfo;
    }> = [];
    const defaultElements: Array<{
      sequence: number;
      element: ElementInfo;
    }> = [];

    for (const transition of transitions) {
      inputtedElements.push(
        ...this.collectInputOperations(transition.history)
          .map(({ operation }) => {
            return {
              sequence: operation.sequence,
              element: operation.elementInfo,
            };
          })
          .filter(
            (
              elementWithSequence
            ): elementWithSequence is {
              sequence: number;
              element: ElementInfo;
            } => {
              return elementWithSequence.element !== null;
            }
          )
      );

      defaultElements.push(
        ...transition.inputElements.map((inputElement) => {
          return {
            sequence: transition.history[0]?.operation.sequence ?? 0,
            element: inputElement,
          };
        })
      );
    }

    return inputtedElements
      .concat(defaultElements)
      .filter(({ element }, index, array) => {
        return (
          array.findIndex((item) => {
            if (element.xpath) {
              return (
                normalizeXPath(item.element.xpath) ===
                normalizeXPath(element.xpath)
              );
            }

            return false;
          }) === index
        );
      })
      .reverse()
      .map(({ sequence, element }) => {
        return {
          id: element.attributes.id ?? "",
          name: element.attributes.name ?? "",
          elementInfo: element,
          sequence,
        };
      });
  }
}
