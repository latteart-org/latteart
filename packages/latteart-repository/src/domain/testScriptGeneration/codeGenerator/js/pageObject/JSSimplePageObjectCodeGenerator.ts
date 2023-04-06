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

import {
  PageObject,
  PageObjectMethod,
  PageObjectElement,
  PageObjectOperation,
} from "../../../model";
import { JSRadioButtonAccessorCodeGenerator } from "./JSRadioButtonAccessorCodeGenerator";
import { CodeFormatter } from "../../CodeFormatter";
import { PageObjectCodeGenerator, NameGenerator } from "../../types";

export class JSSimplePageObjectCodeGenerator
  implements PageObjectCodeGenerator
{
  constructor(
    private nameGenerator: {
      pageObject: NameGenerator;
      method: NameGenerator;
    }
  ) {}
  public generateFrom(pageObject: PageObject): string {
    const pageObjectImportString =
      JSSimplePageObjectCodeGenerator.generatePageObjectImportString(
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
      JSSimplePageObjectCodeGenerator.generateFieldAccessorStrings(
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
            elem.name
          );
        }

        if (elem.type === "CheckBox") {
          return JSSimplePageObjectCodeGenerator.generateCheckBoxAccessorString(
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

`;
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
      const operationsString = method.operations
        .flatMap((operation) => {
          if (operation.type === "click") {
            const clickEventOperationString =
              JSSimplePageObjectCodeGenerator.generateClickEventOperationString(
                operation
              );

            return clickEventOperationString ? [clickEventOperationString] : [];
          }

          if (operation.type === "change") {
            const changeEventOperationString =
              JSSimplePageObjectCodeGenerator.generateChangeEventOperationString(
                operation
              );

            return [changeEventOperationString];
          }

          if (operation.type === "switch_window") {
            return [`browser.switchWindow("${operation.input}");`];
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
${methodComment}${methodName}() {
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
  private static generateClickEventOperationString(
    operation: PageObjectOperation
  ) {
    const element = operation.target;
    const identifier = element.identifier;

    if (element.type === "RadioButton") {
      return `this.set_${identifier}('${operation.input}');`;
    }

    if (identifier) {
      return `this.${identifier}.click();`;
    }
  }

  private static generateChangeEventOperationString(
    operation: PageObjectOperation
  ) {
    const element = operation.target;
    const identifier = element.identifier;

    if (element.type === "SelectBox") {
      return `this.${identifier}.selectByAttribute('value', '${operation.input}');`;
    }

    return `this.${identifier}.setValue('${operation.input}');`;
  }
}
