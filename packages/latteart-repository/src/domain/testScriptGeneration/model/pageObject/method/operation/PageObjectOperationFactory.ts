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
  PageObjectOperation,
  PageObjectOperationFactory,
  PageObjectElementFactory,
  OperationType,
} from "./types";
import { TestScriptSourceOperation } from "../../../../types";
import { IdentifierGenerator } from "@/domain/testScriptGeneration/IdentifierGenerator";

export class PageObjectOperationFactoryImpl
  implements PageObjectOperationFactory
{
  constructor(private elementFactory: PageObjectElementFactory) {}

  public createFrom(
    operation: TestScriptSourceOperation,
    destinationUrl: string,
    identifierGenerator: IdentifierGenerator
  ): PageObjectOperation {
    const target = this.elementFactory.createFrom(
      operation.elementInfo,
      operation.imageFilePath,
      identifierGenerator
    );

    return {
      target,
      type: this.createType(operation.type),
      input:
        operation.type === "switch_window" ? destinationUrl : operation.input,
    };
  }

  private createType(operationType: string) {
    const operationTypeList = [
      "click",
      "change",
      "switch_window",
      "accept_alert",
      "dismiss_alert",
      "browser_back",
      "browser_forward",
      "skipped_operations",
    ];

    if (operationTypeList.includes(operationType)) {
      return operationType as OperationType;
    }

    return "other";
  }
}
