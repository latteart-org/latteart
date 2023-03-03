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

import { NameGenerator } from "../../types";
import { PageObjectMethod, PageObject } from "../../../model";
import { AliasGenerator } from "../../AliasGenerator";

export class JSPageObjectMethodNameGenerator implements NameGenerator {
  private methodIdToName: Map<string, string>;
  private methodNameDuplicateCount: Map<string, number> = new Map(); // key = pageObjectId + methodName

  constructor(
    pageObjects: Pick<PageObject, "methods">[],
    private pageObjectNameGenerator: NameGenerator
  ) {
    this.methodIdToName = new Map(
      new AliasGenerator(255)
        .generate(
          pageObjects.flatMap(({ methods }) => {
            return methods.map((method) => {
              return { id: method.id, name: this.buildMethodName(method) };
            });
          })
        )
        .map(({ id, alias }) => [id, alias])
    );
  }

  public generate(id: string): string {
    return this.methodIdToName.get(id) ?? "";
  }

  private buildMethodName(method: PageObjectMethod): string {
    const userOperations = method.operations.filter((operation) => {
      return operation.target !== null;
    });

    const lastOperatedElement =
      userOperations[userOperations.length - 1]?.target ?? undefined;

    const destination = this.pageObjectNameGenerator.generate(
      method.returnPageObjectId
    );

    const methodNameCandidate = !lastOperatedElement
      ? `go${destination}Empty`
      : lastOperatedElement.type === "Button"
      ? `go${destination}`
      : `do${lastOperatedElement.identifier}`;

    const key = method.pageObjectId + methodNameCandidate;

    if (this.methodNameDuplicateCount.has(key)) {
      const methodNameCount = this.methodNameDuplicateCount.get(key)!;
      this.methodNameDuplicateCount.set(key, methodNameCount + 1);
      return methodNameCandidate + (methodNameCount + 1).toString();
    } else {
      this.methodNameDuplicateCount.set(key, 1);
      return methodNameCandidate;
    }
  }
}
