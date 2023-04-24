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

export type InputValueTableHeaderColumn = {
  index: number;
  sourceScreenDef: string;
  targetScreenDef: string;
  trigger: {
    elementText: string;
    eventType: string;
  };
  notes: {
    sequence: number;
    id: string;
    imageFileUrl: string;
    tags: string[];
    value: string;
    details: string;
  }[];
  testPurposes: {
    id: string;
    value: string;
    details: string;
  }[];
};

export type InputValueTableRow = {
  elementId: string;
  elementName: string;
  elementType: string;
  sequence: number;
  inputs: Array<{
    value: string;
    isDefaultValue: boolean;
  }>;
};

export type ScreenTransition = {
  sourceScreen: { id: string; name: string };
  destScreen: { id: string; name: string };
  trigger?: {
    sequence: number;
    type: string;
    targetElementId?: string;
    input?: string;
    pageUrl: string;
    pageTitle: string;
  };
  inputElements: {
    id: string;
    xpath: string;
    tagname: string;
    text: string;
    attributes: {
      [key: string]: string;
    };
    defaultValue?: string;
    inputs: { sequence: number; value: string }[];
  }[];
  notes: {
    sequence: number;
    id: string;
    imageFileUrl: string;
    tags: string[];
    value: string;
    details: string;
  }[];
  testPurposes: {
    id: string;
    value: string;
    details: string;
  }[];
};

/**
 * Class that handles input value table.
 */
export default class InputValueTable {
  constructor(private screenTransitions: ScreenTransition[] = []) {}

  /**
   * Get column size.
   */
  public get columnSize(): number {
    return this.screenTransitions.length;
  }

  /**
   * Get column header.
   */
  public get headerColumns(): InputValueTableHeaderColumn[] {
    return this.screenTransitions.map((transition, index) => {
      return {
        index,
        sourceScreenDef: transition.sourceScreen.name,
        targetScreenDef: transition.destScreen.name,
        trigger: {
          elementText:
            transition.inputElements.find(
              ({ id }) => id === transition.trigger?.targetElementId
            )?.text ?? "",
          eventType: transition.trigger?.type ?? "",
        },
        notes: transition.notes,
        testPurposes: transition.testPurposes,
      };
    });
  }

  /**
   * Get all lines.
   */
  public get rows(): InputValueTableRow[] {
    const elements = this.screenTransitions
      .flatMap((screenTransition) => {
        return screenTransition.inputElements.map((inputElement) => {
          const { id, xpath, tagname, text, attributes } = inputElement;
          const sequence = inputElement.inputs.at(0)?.sequence ?? 0;
          const info = { xpath, tagname, text, attributes };
          return { id, info, sequence };
        });
      })
      .filter(({ id }, index, array) => {
        return array.findIndex((element) => element.id === id) === index;
      });

    const inputs = this.screenTransitions.flatMap((screenTransition) => {
      return screenTransition.inputElements.map((element) => {
        const input = element.inputs.at(-1);

        if (input === undefined) {
          return {
            elementId: element.id,
            value: element.defaultValue ?? "",
            isDefaultValue: true,
          };
        }

        return {
          elementId: element.id,
          value: input.value,
          isDefaultValue: false,
        };
      });
    });

    return elements.map((element) => {
      const attributes = element.info.attributes;
      return {
        elementId: attributes["id"] ?? "",
        elementName: attributes["name"] ?? "",
        elementType: attributes["type"] ?? "",
        sequence: element.sequence,
        inputs: inputs
          .filter(({ elementId }) => elementId === element.id)
          .map(({ value, isDefaultValue }) => {
            return { value, isDefaultValue };
          }),
      };
    });
  }

  /**
   * Get screen transition.
   * @returns Screen transitions.
   */
  public getScreenTransitions(): ScreenTransition[] {
    return this.screenTransitions;
  }
}
