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

import { CodeFormatter } from "../../CodeFormatter";

export class JSRadioButtonAccessorCodeGenerator {
  private _radioNameToValues: Map<string, Set<string>> = new Map();

  constructor(radioNameToValues: Map<string, Set<string>>) {
    this._radioNameToValues = radioNameToValues;
  }

  public generateRadioButtonString(name: string): string {
    const valuesString = JSRadioButtonAccessorCodeGenerator.generateRadioValuesString(
      name,
      this._radioNameToValues
    );

    return `\
static get ${name}() {
  return {
${CodeFormatter.indentToAllLines(valuesString, 4)}
  }
}

set_${name}(value) {
  $("//input[@name='${name}' and @value='" + value + "']").click();
}`;
  }

  // not generate values that is not operated.
  private static generateRadioValuesString(
    name: string,
    radioNameToValues: Map<string, Set<string>>
  ) {
    const values = Array.from(radioNameToValues.get(name) ?? []);

    const radioValuesString = values
      .map((value: string) => `${value}: '${value}'`)
      .join(",\n");

    return radioValuesString;
  }
}
