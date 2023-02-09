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

import { PageObjectMethod } from "../pageObject/method/PageObjectMethod";
import { MethodCall, Scenario } from "./TestSuite";

export class ScenarioFactory {
  public create(methods: PageObjectMethod[]): Scenario {
    const methodCalls: MethodCall[] = methods.map((method) => {
      return {
        pageObjectId: method.pageObjectId,
        methodId: method.id,
        returnPageObjectId: method.returnPageObjectId,
      };
    });

    return {
      methodCalls: methodCalls,
    };
  }
}
