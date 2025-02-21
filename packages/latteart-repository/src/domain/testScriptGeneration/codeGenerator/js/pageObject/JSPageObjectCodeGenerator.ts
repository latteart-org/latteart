/**
 * Copyright 2025 NTT Corporation.
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
  PageObject,
  PageObjectElement,
  PageObjectMethod,
  FormalArgumentCollector,
} from "../../../model";
import { JSRadioButtonAccessorCodeGenerator } from "./JSRadioButtonAccessorCodeGenerator";
import { CodeFormatter } from "../../CodeFormatter";
import { PageObjectCodeGenerator, NameGenerator } from "../../types";
import { Locator } from "@/domain/elementLocator";
import {
  generateAccessorString,
  generateFindElementMultiAccessorString,
} from "./util";

export class JSPageObjectCodeGenerator implements PageObjectCodeGenerator {
  constructor(
    private nameGenerator: {
      pageObject: NameGenerator;
      method: NameGenerator;
    }
  ) {}
  public generateFrom(
    pageObject: PageObject,
    useMultiLocator: boolean
  ): string {
    const pageObjectImportString =
      JSPageObjectCodeGenerator.generatePageObjectImportString(
        ...pageObject.methods
          .filter((method) => {
            return method.pageObjectId !== method.returnPageObjectId;
          })
          .map((method) => {
            return this.nameGenerator.pageObject.generate(
              method.returnPageObjectId
            );
          })
          .filter((pageObjectName, index, array) => {
            return array.indexOf(pageObjectName) === index;
          })
      );

    const prefixString = pageObjectImportString
      ? `${pageObjectImportString}\n\n`
      : "";

    const classComment = pageObject.comment
      ? `\
/**
${CodeFormatter.prependTextToAllLines(pageObject.comment, " * ")}
 */\n`
      : "";

    const fieldAccessorStrings =
      JSPageObjectCodeGenerator.generateFieldAccessorStrings(
        pageObject.methods,
        useMultiLocator
      );

    const methodStrings = this.generateMethodStrings(pageObject.methods);

    const pageObjectName = this.nameGenerator.pageObject.generate(
      pageObject.id
    );

    return `\
${prefixString}${classComment}class ${pageObjectName} {
${CodeFormatter.indentToAllLines(
  [...fieldAccessorStrings, ...methodStrings].join("\n\n"),
  2
)}
}
export default ${pageObjectName};
`;
  }

  private static generateFieldAccessorStrings(
    methods: PageObjectMethod[],
    useMultiLocator: boolean
  ) {
    const elements = methods.flatMap(({ operations }) =>
      operations
        .map((operation) => {
          return operation.target;
        })
        .filter((target) => {
          return target.identifier !== "";
        })
    );

    const identifierToElement = new Map(
      elements.map((element) => {
        return [element.identifier, element];
      })
    );

    const radioButtonGenerator = new JSRadioButtonAccessorCodeGenerator(
      elements.reduce((radioNameToValues, element) => {
        if (element.type === "RadioButton" && element.value) {
          const identifier = element.identifier;

          if (!radioNameToValues.has(identifier)) {
            radioNameToValues.set(identifier, new Set());
          }

          radioNameToValues.get(identifier)?.add(element.value);
        }

        return radioNameToValues;
      }, new Map<string, Set<string>>())
    );

    const radioButtonNames = new Set<string>();

    return Array.from(identifierToElement).map(
      ([identifier, elem]: [string, PageObjectElement]) => {
        if (elem.type === "RadioButton" && elem.name) {
          const identifier = elem.identifier;

          if (radioButtonNames.has(identifier)) {
            return "";
          }

          radioButtonNames.add(identifier);

          return radioButtonGenerator.generateRadioButtonString(
            identifier,
            elem.name,
            useMultiLocator
          );
        }

        if (elem.type === "CheckBox") {
          return JSPageObjectCodeGenerator.generateCheckBoxAccessorString(
            identifier,
            elem.locators,
            useMultiLocator
          );
        }

        return useMultiLocator
          ? generateFindElementMultiAccessorString(
              identifier,
              elem.locators,
              elem.iframe?.index
            )
          : generateAccessorString(
              identifier,
              elem.locators,
              elem.iframe?.index
            );
      }
    );
  }

  private static generateCheckBoxAccessorString(
    identifier: string,
    locators: Locator[],
    useMultiLocator: boolean,
    iframeIndex?: number
  ): string {
    return `\
${
  useMultiLocator
    ? generateFindElementMultiAccessorString(identifier, locators, iframeIndex)
    : generateAccessorString(identifier, locators, iframeIndex)
}

async set_${identifier}(isClick) {
  const locator = ${useMultiLocator ? "await " : ""}this.${identifier};
  if (await locator.isSelected() !== (isClick === "true")) {
    await locator.click();
  }
}`;
  }

  private static generatePageObjectImportString(...pageObjectNames: string[]) {
    return pageObjectNames
      .map((pageObjectName) => {
        return `import ${pageObjectName} from './${pageObjectName}.page';`;
      })
      .join("\n");
  }

  private generateMethodStrings(methods: PageObjectMethod[]) {
    return methods.map((method) => {
      const argsString = JSPageObjectCodeGenerator.generateArgsString(method);

      const radioButtons = new Set<string>();

      const operationsString = method.operations
        .flatMap((operation) => {
          if (operation.type === "click") {
            const clickEventOperationString =
              JSPageObjectCodeGenerator.generateClickEventOperationString(
                operation.target,
                radioButtons
              );

            return clickEventOperationString ? [clickEventOperationString] : [];
          }

          if (operation.type === "change") {
            const changeEventOperationString =
              JSPageObjectCodeGenerator.generateChangeEventOperationString(
                operation.target
              );

            return [changeEventOperationString];
          }

          if (operation.type === "switch_window") {
            return [`await browser.switchWindow("${operation.input}");`];
          }

          if (operation.type === "accept_alert") {
            return [`// Please insert code for 'accept_alert' here.`];
          }

          if (operation.type === "dismiss_alert") {
            return [`// Please insert code for 'dismiss_alert' here.`];
          }

          if (operation.type === "browser_back") {
            return [`// Please insert code for 'browser_back' here.`];
          }

          if (operation.type === "browser_forward") {
            return [`// Please insert code for 'browser_forward' here.`];
          }

          if (operation.type === "skipped_operations") {
            return [`// Please insert code for operations while pausing here.`];
          }

          return [];
        })
        .join("\n");

      const methodComment = method.comment
        ? `\
/**
${CodeFormatter.prependTextToAllLines(method.comment, " * ")}
 */\n`
        : "";

      const methodName = this.nameGenerator.method.generate(method.id);

      return `\
${methodComment}async ${methodName}(${argsString}) {
${CodeFormatter.indentToAllLines(
  operationsString ? operationsString : "// no operation",
  2
)}

  return new ${this.nameGenerator.pageObject.generate(
    method.returnPageObjectId
  )}();
}`;
    });
  }

  private static generateArgsString(method: PageObjectMethod) {
    const args: Set<string> = new FormalArgumentCollector().collect(
      method.operations
    );

    if (args.size === 0) {
      return "";
    }

    return `\
{
${Array.from(args)
  .map((arg) => `  ${arg}`)
  .join(",\n")}
}`;
  }

  private static generateClickEventOperationString(
    element: PageObjectElement,
    radioButtons: Set<string>
  ) {
    if (element.type === "RadioButton" && element.identifier) {
      if (radioButtons.has(element.identifier)) {
        radioButtons.add(element.identifier);

        return "";
      }

      return `await this.set_${element.identifier}(${element.identifier});`;
    }

    const identifier = element.identifier;

    if (element.type === "CheckBox") {
      return `await this.set_${identifier}(${identifier});`;
    }

    return `await (await this.${identifier}).click();`;
  }

  private static generateChangeEventOperationString(
    element: PageObjectElement
  ) {
    const identifier = element.identifier;

    if (element.type === "SelectBox") {
      return `await (await this.${identifier}).selectByAttribute('value', ${identifier});`;
    }

    return `await (await this.${identifier}).setValue(${identifier});`;
  }
}
