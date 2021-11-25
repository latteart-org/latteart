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

import { ScreenDefinition } from "@/lib/common/settings/Settings";

/**
 * Class that generates screen definition.
 */
export default class ScreenDefFactory {
  private config: ScreenDefinition;

  /**
   * Constructor.
   * @param config  Screen definition settings.
   */
  constructor(config: ScreenDefinition) {
    this.config = config;
  }

  /**
   * Returns the screen name according to the screen definition settings.
   * @param title  Screen title.
   * @param url  Screen URL.
   * @param keywordSet  Set of keywords contained in the page.
   */
  public createFrom(
    title: string,
    url: string,
    keywordSet?: Set<string>
  ): string {
    const hitCondition = this.config.conditionGroups
      .filter((screenDefinitionCondition) => {
        return (
          screenDefinitionCondition.isEnabled &&
          screenDefinitionCondition.conditions.some(
            (condition) => condition.isEnabled
          ) &&
          screenDefinitionCondition.conditions.some(
            (condition) => !!condition.word
          )
        );
      })
      .find((screenDefinitionCondition) => {
        return screenDefinitionCondition.conditions.every((condition) => {
          if (
            !condition.isEnabled ||
            !condition.definitionType ||
            !condition.word
          ) {
            return true;
          }
          switch (condition.definitionType) {
            case "url": {
              return this.textIsMetCondition(
                url,
                condition.word,
                condition.matchType
              );
            }
            case "title": {
              return this.textIsMetCondition(
                title,
                condition.word,
                condition.matchType
              );
            }
            case "keyword": {
              if (!keywordSet) {
                return false;
              }

              return !!Array.from(keywordSet).find((keyword) => {
                return this.textIsMetCondition(
                  keyword,
                  condition.word,
                  condition.matchType
                );
              });
            }
          }
          return true;
        });
      });

    if (hitCondition) {
      return hitCondition.screenName ? hitCondition.screenName : " ";
    }

    if (this.config.screenDefType === "url") {
      return url;
    } else if (this.config.screenDefType === "title") {
      if (title === "") {
        return "(No Title)";
      } else {
        return title;
      }
    }
    throw new Error(`invalid screenDefType: ${this.config.screenDefType}`);
  }

  private textIsMetCondition(
    text: string,
    condition: string,
    matchType: "contains" | "equals" | "regex"
  ): boolean {
    switch (matchType) {
      case "contains": {
        return text.includes(condition);
      }
      case "equals": {
        return condition === text;
      }
      case "regex": {
        return new RegExp(condition).test(text);
      }
    }
  }
}
