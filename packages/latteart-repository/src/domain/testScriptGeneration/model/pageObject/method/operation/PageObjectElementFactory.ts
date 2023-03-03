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

import { PageObjectElement, PageObjectElementFactory } from "./types";
import { TestScriptSourceElement } from "../../../../types";
import { IdentifierGenerator } from "@/domain/testScriptGeneration/IdentifierGenerator";
import { TestScriptGenerationOption } from "@/domain/testScriptGeneration";

export class PageObjectElementFactoryImpl implements PageObjectElementFactory {
  constructor(
    private option: Pick<TestScriptGenerationOption, "buttonDefinitions"> = {
      buttonDefinitions: [
        { tagname: "INPUT", attribute: { name: "type", value: "submit" } },
        { tagname: "INPUT", attribute: { name: "type", value: "button" } },
        { tagname: "A" },
        { tagname: "BUTTON" },
      ],
    }
  ) {}

  public createFrom(
    element: TestScriptSourceElement | null,
    imageUrl: string,
    identifierGenerator: IdentifierGenerator
  ): PageObjectElement {
    if (!element) {
      return {
        identifier: "",
        type: "Other",
        value: "",
        name: "",
        locator: "",
        imageUrl,
      };
    }
    const identifier =
      identifierGenerator.generateIdentifierFromElement(element);

    return {
      identifier,
      type: this.createElementType(element.tagname, element.attributes),
      value: element.attributes.value ?? "",
      name: element.attributes.name ?? "",
      locator: element.locator,
      imageUrl,
    };
  }

  private createElementType(
    tagname: string,
    attributes: { [key: string]: string }
  ) {
    if (tagname === "INPUT" && attributes.type === "radio") {
      return "RadioButton";
    }

    if (tagname === "INPUT" && attributes.type === "checkbox") {
      return "CheckBox";
    }

    if (tagname === "SELECT") {
      return "SelectBox";
    }

    const isButton = this.option.buttonDefinitions.some((d) => {
      if (d.tagname.toUpperCase() !== tagname) {
        return false;
      }

      if (!d.attribute) {
        return true;
      }

      const definitionAttribute = d.attribute;

      return Object.entries(attributes).some(([name, value]) => {
        return (
          definitionAttribute.name === name &&
          definitionAttribute.value === value
        );
      });
    });

    if (isButton) {
      return "Button";
    }

    return "Other";
  }
}
