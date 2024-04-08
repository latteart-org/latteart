/**
 * Copyright 2023 NTT Corporation.
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

import { type ActionResult, ActionSuccess } from "@/lib/common/ActionResult";
import { type AutofillConditionGroup } from "../types";

export class AutofillTestAction {
  public extractMatchingAutofillConditionGroup(
    conditionGroups: AutofillConditionGroup[],
    title: string,
    url: string
  ): ActionResult<AutofillConditionGroup[] | null> {
    const matchGroup = conditionGroups.filter((conditionGroup) => {
      return (
        conditionGroup.url === url &&
        conditionGroup.title === title &&
        conditionGroup.isEnabled &&
        conditionGroup.inputValueConditions.some((inputValue) => inputValue.isEnabled)
      );
    });

    return new ActionSuccess(matchGroup.length > 0 ? matchGroup : null);
  }
}
