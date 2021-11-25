/**
 * Copyright 2021 NTT Corporation.
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

import {
  OperationHistory,
  OperationWithNotes,
  ElementInfo,
  CoverageSource,
} from "./types";

export interface ScreenHistoryBody {
  url: string;
  title: string;
  screenDef: string;
  operationHistory: OperationHistory;
  screenElements: ElementInfo[];
  inputElements: ElementInfo[];
}

/**
 * Screen transition history.
 */
export default class ScreenHistory {
  /**
   * Generates a ScreenHistory based on the operation history.
   * @param operationHistory  Operation history.
   * @param coverageSources Element county for coverage calculation
   */
  public static createFromOperationHistory(
    operationHistory: OperationHistory,
    coverageSources: CoverageSource[]
  ): ScreenHistory {
    let prevScreenDef: string | undefined = undefined;
    const body = this.tagNameAndXPathToUpperCase(operationHistory).reduce(
      (acc, currentItem) => {
        if (
          prevScreenDef === undefined ||
          prevScreenDef !== currentItem.operation.screenDef ||
          currentItem.operation.isScreenTransition()
        ) {
          const coverageSource = coverageSources.find((source) => {
            return (
              source.url === currentItem.operation.url &&
              source.title === currentItem.operation.title
            );
          });
          acc.push({
            url: currentItem.operation.url,
            title: currentItem.operation.title,
            screenDef: currentItem.operation.screenDef,
            operationHistory: [currentItem],
            screenElements: coverageSource
              ? coverageSource.screenElements.map((screenElement) => {
                  this.tagNameAndXPathToUpperCaseForElementInfo(screenElement);
                  return screenElement;
                })
              : [],
            inputElements: currentItem.operation.inputElements ?? [],
          });
        } else {
          acc[acc.length - 1].operationHistory.push(currentItem);
          if (currentItem.operation.inputElements) {
            acc[
              acc.length - 1
            ].inputElements = currentItem.operation.inputElements.map((ele) => {
              this.tagNameAndXPathToUpperCaseForElementInfo(ele);
              return ele;
            });
          }
        }
        prevScreenDef = currentItem.operation.screenDef;
        return acc;
      },
      [] as ScreenHistoryBody[]
    );
    return new ScreenHistory(body);
  }

  /**
   * Convert tagname and xpath elements present in the operation history to uppercase.
   * @param operationHistory  Operation history
   */
  public static tagNameAndXPathToUpperCase(
    operationHistory: OperationHistory
  ): OperationHistory {
    operationHistory.forEach((operationWithNotes: OperationWithNotes) => {
      this.tagNameAndXPathToUpperCaseForElementInfo(
        operationWithNotes.operation.elementInfo
      );
    });
    return operationHistory;
  }

  /**
   * Convert tagname and xpath elements present in ElementInfo to uppercase.
   * @param elementInfo
   */
  public static tagNameAndXPathToUpperCaseForElementInfo(
    elementInfo: ElementInfo | undefined | null
  ): null | undefined {
    if (!elementInfo) {
      return elementInfo;
    }
    elementInfo.tagname = elementInfo.tagname.toUpperCase();
    elementInfo.xpath = elementInfo.xpath.toUpperCase();
  }

  private _body: ScreenHistoryBody[];

  /**
   * Constructor.
   * @param body  Internal object of screen transition history.
   */
  constructor(body?: ScreenHistoryBody[]) {
    this._body = body === undefined ? [] : body;
  }

  /**
   * Get an internal object.
   */
  get body(): ScreenHistoryBody[] {
    return this._body;
  }

  /**
   * Get an array of screen information that appears in the screen transition history.
   * The operationHistory keeps all operation history (screens reached multiple times are operations at all times).
   */
  get appearedScreens(): ScreenHistoryBody[] {
    return this.body.reduce((acc, current, index, screenHistoryBody) => {
      if (
        index === 0 ||
        screenHistoryBody.findIndex(
          (screen) => screen.screenDef === current.screenDef
        ) === index
      ) {
        acc.push({
          url: current.url,
          title: current.title,
          screenDef: current.screenDef,
          operationHistory: [...current.operationHistory],
          screenElements: current.screenElements,
          inputElements: current.inputElements,
        });
        return acc;
      }

      const foundScreen = acc.find((screen) => {
        return screen.screenDef === current.screenDef;
      })!;
      foundScreen.operationHistory.push(...current.operationHistory);
      foundScreen.screenElements.push(...current.screenElements);
      foundScreen.inputElements.push(...current.inputElements);

      return acc;
    }, [] as ScreenHistoryBody[]);
  }

  /**
   * Get operation history.
   * @returns Operation history.
   */
  get operationHistory(): OperationWithNotes[] {
    return this.body.flatMap((item) => {
      return item.operationHistory;
    });
  }

  public collectScreenTransitions(
    sourceScreenDef: string
  ): {
    source: {
      title: string;
      url: string;
      screenDef: string;
    };
    target: {
      title: string;
      url: string;
      screenDef: string;
    };
    history: OperationHistory;
    screenElements: ElementInfo[];
    inputElements: ElementInfo[];
  }[] {
    return this.body
      .reduce(
        (acc, current, index, array) => {
          if (index >= array.length - 1) {
            return acc;
          }

          const nextTitle = array[index + 1].title;
          const nextUrl = array[index + 1].url;
          const nextScreenDef = array[index + 1].screenDef;

          acc.push({
            source: {
              title: current.title,
              url: current.url,
              screenDef: current.screenDef,
            },
            target: {
              title: nextTitle,
              url: nextUrl,
              screenDef: nextScreenDef,
            },
            history: current.operationHistory,
            screenElements: current.screenElements,
            inputElements: current.inputElements,
          });

          return acc;
        },
        Array<{
          source: { title: string; url: string; screenDef: string };
          target: { title: string; url: string; screenDef: string };
          history: OperationHistory;
          screenElements: ElementInfo[];
          inputElements: ElementInfo[];
        }>()
      )
      .filter((transition) => {
        return transition.source.screenDef === sourceScreenDef;
      });
  }
}
