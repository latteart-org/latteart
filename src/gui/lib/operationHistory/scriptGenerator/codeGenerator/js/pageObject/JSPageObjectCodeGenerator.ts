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

import { PageObject } from "../../../model/pageObject/PageObject";
import {
  PageObjectElement,
  ElementType,
} from "../../../model/pageObject/method/operation/PageObjectOperation";
import { PageObjectMethod } from "../../../model/pageObject/method/PageObjectMethod";
import { JSRadioButtonAccessorCodeGenerator } from "./JSRadioButtonAccessorCodeGenerator";
import { CodeFormatter } from "../../CodeFormatter";
import { PageObjectCodeGenerator } from "../../PageObjectCodeGenerator";
import { FormalArgumentCollector } from "../../../model/pageObject/method/operation/FormalArgumentsCollector";
import { NameGenerator } from "../../NameGenerator";

export class JSPageObjectCodeGenerator implements PageObjectCodeGenerator {
  constructor(
    private nameGenerator: {
      pageObject: NameGenerator;
      method: NameGenerator;
    }
  ) {}
  public generateFrom(pageObject: PageObject): string {
    const pageObjectImportString = JSPageObjectCodeGenerator.generatePageObjectImportString(
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

    const fieldAccessorStrings = JSPageObjectCodeGenerator.generateFieldAccessorStrings(
      pageObject.methods
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

  private static generateFieldAccessorStrings(methods: PageObjectMethod[]) {
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
        if (
          element.type === ElementType.RadioButton &&
          element.name &&
          element.value
        ) {
          const name = element.name;

          if (!radioNameToValues.has(name)) {
            radioNameToValues.set(name, new Set());
          }

          radioNameToValues.get(name)?.add(element.value);
        }

        return radioNameToValues;
      }, new Map<string, Set<string>>())
    );

    const radioButtonNames = new Set<string>();

    return Array.from(identifierToElement).map(
      ([identifier, elem]: [string, PageObjectElement]) => {
        if (elem.type === ElementType.RadioButton && elem.name) {
          const name = elem.name;

          if (radioButtonNames.has(name)) {
            return "";
          }

          radioButtonNames.add(name);

          return radioButtonGenerator.generateRadioButtonString(name);
        }

        if (elem.type === ElementType.CheckBox) {
          return JSPageObjectCodeGenerator.generateCheckBoxAccessorString(
            identifier,
            elem.locator
          );
        }

        return `get ${identifier}() { return $('${elem.locator}'); }`;
      }
    );
  }

  private static generateCheckBoxAccessorString(
    identifier: string,
    locator: string
  ): string {
    return `\
get ${identifier}() { return $('${locator}'); }

set_${identifier}(isClick) {
  if (this.${identifier}.isSelected() ^ isClick) {
    this.${identifier}.click();
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
            const clickEventOperationString = JSPageObjectCodeGenerator.generateClickEventOperationString(
              operation.target,
              radioButtons
            );

            return clickEventOperationString ? [clickEventOperationString] : [];
          }

          if (operation.type === "change") {
            const changeEventOperationString = JSPageObjectCodeGenerator.generateChangeEventOperationString(
              operation.target
            );

            return [changeEventOperationString];
          }

          if (operation.type === "switch_window") {
            return [`browser.switchWindow("${operation.input}");`];
          }

          if (operation.type === "accept_alert") {
            return [`// invalid operation: accept_alert`];
          }

          if (operation.type === "dismiss_alert") {
            return [`// invalid operation: dismiss_alert`];
          }

          if (operation.type === "browser_back") {
            return [`// invalid operation: browser_back`];
          }

          if (operation.type === "browser_forward") {
            return [`// invalid operation: browser_forward`];
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
${methodComment}${methodName}(${argsString}) {
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
    if (element.type === ElementType.RadioButton && element.name) {
      if (radioButtons.has(element.name)) {
        radioButtons.add(element.name);

        return "";
      }

      return `this.set_${element.name}(${element.name});`;
    }

    const identifier = element.identifier;

    if (element.type === ElementType.CheckBox) {
      return `this.set_${identifier}(${identifier});`;
    }

    return `this.${identifier}.click();`;
  }

  private static generateChangeEventOperationString(
    element: PageObjectElement
  ) {
    const identifier = element.identifier;

    if (element.type === ElementType.SelectBox) {
      return `this.${identifier}.selectByAttribute('value', ${identifier});`;
    }

    return `this.${identifier}.setValue(${identifier});`;
  }
}
