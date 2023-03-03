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

import { PageObjectOperation } from "./operation";
import { OperationFilter } from "./operation";
import { PageObjectMethod } from "./types";

export class PageObjectMethodImpl implements PageObjectMethod {
  private operationFilters: OperationFilter[];
  public comment?: string;

  constructor(
    private params: {
      id: string;
      pageObjectId: string;
      returnPageObjectId: string;
      operations: PageObjectOperation[];
    },
    ...operationFilters: OperationFilter[]
  ) {
    this.operationFilters = operationFilters;
  }

  public get id(): string {
    return this.params.id;
  }

  public get pageObjectId(): string {
    return this.params.pageObjectId;
  }

  public get returnPageObjectId(): string {
    return this.params.returnPageObjectId;
  }

  public get operations(): PageObjectOperation[] {
    return this.operationFilters.reduce((acc, operationFilter) => {
      return operationFilter.filter(acc);
    }, this.params.operations);
  }

  public includes(other: PageObjectMethod): boolean {
    if (this.returnPageObjectId !== other.returnPageObjectId) {
      return false;
    }

    if (other.operations.length === 0) {
      return true;
    }

    if (this.operations.length === 0) {
      return false;
    }

    return other.operations.every(({ target }) => {
      if (!target.identifier) {
        return true;
      }

      return (
        this.operations.find((operation) => {
          return target.identifier === operation.target.identifier;
        }) !== undefined
      );
    });
  }
}
