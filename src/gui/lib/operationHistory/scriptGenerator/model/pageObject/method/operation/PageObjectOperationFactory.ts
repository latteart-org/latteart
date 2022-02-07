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

import { OperationType, PageObjectOperation } from "./PageObjectOperation";
import { Operation } from "@/lib/operationHistory/Operation";
import { PageObjectElementFactory } from "./PageObjectElementFactory";

export interface PageObjectOperationFactory {
  createFrom(operation: Operation, destinationUrl: string): PageObjectOperation;
}

export class PageObjectOperationFactoryImpl
  implements PageObjectOperationFactory {
  constructor(
    private imageUrlResolver: (url: string) => string,
    private elementFactory: PageObjectElementFactory
  ) {}

  public createFrom(
    operation: Operation,
    destinationUrl: string
  ): PageObjectOperation {
    const target = this.elementFactory.createFrom(
      operation.elementInfo,
      this.imageUrlResolver(
        operation.compressedImageFilePath ?? operation.imageFilePath
      )
    );

    return {
      target,
      type: this.createType(operation.type),
      input:
        operation.type === "switch_window" ? destinationUrl : operation.input,
    };
  }

  private createType(operationType: string) {
    if (operationType === "click") {
      return OperationType.Click;
    }

    if (operationType === "change") {
      return OperationType.Change;
    }

    if (operationType === "switch_window") {
      return OperationType.SwitchWindow;
    }

    if (operationType === "accept_alert") {
      return OperationType.AcceptAlert;
    }

    if (operationType === "dismiss_alert") {
      return OperationType.DismissAlert;
    }

    if (operationType === "browser_back") {
      return OperationType.BrowserBack;
    }

    if (operationType === "browser_forward") {
      return OperationType.BrowserForward;
    }

    return OperationType.Other;
  }
}
