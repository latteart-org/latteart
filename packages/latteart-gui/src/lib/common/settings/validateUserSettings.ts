/**
 * Copyright 2024 NTT Corporation.
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

export const validateUserSettings = (userSettings: any) => {
  return (
    validateCaptureMediaSetting(userSettings.captureMediaSetting) &&
    validateAutoOperationSetting(userSettings.autoOperationSetting) &&
    validateAutofillSetting(userSettings.autofillSetting) &&
    validateTestHintSetting(userSettings.testHintSetting)
  );
};

export const validateCaptureMediaSetting = (captureMediaSetting: any) => {
  return (
    "mediaType" in captureMediaSetting &&
    ["image", "video", "video_and_imge"].includes(captureMediaSetting.mediaType) &&
    "imageCompression" in captureMediaSetting &&
    "format" in captureMediaSetting.imageCompression &&
    ["png", "webp"].includes(captureMediaSetting.imageCompression.format)
  );
};

export const validateAutofillSetting = (autofillSetting: any) => {
  return (
    typeof autofillSetting.autoPopupRegistrationDialog === "boolean" &&
    typeof autofillSetting.autoPopupSelectionDialog === "boolean" &&
    Array.isArray(autofillSetting.conditionGroups) &&
    autofillSetting.conditionGroups.every((conditionGroup: any) => {
      return (
        typeof conditionGroup.isEnabled === "boolean" &&
        typeof conditionGroup.settingName === "string" &&
        typeof conditionGroup.url === "string" &&
        typeof conditionGroup.title === "string" &&
        Array.isArray(conditionGroup.inputValueConditions) &&
        conditionGroup.inputValueConditions.every((inputValueCondition: any) => {
          return (
            typeof inputValueCondition.isEnabled === "boolean" &&
            ["id", "xpath"].includes(inputValueCondition.locatorType) &&
            typeof inputValueCondition.locator === "string" &&
            ["equals", "regex"].includes(inputValueCondition.locatorMatchType) &&
            typeof inputValueCondition.inputValue === "string" &&
            ("iframeIndex" in inputValueCondition
              ? typeof inputValueCondition.iframeIndex === "number"
              : true)
          );
        })
      );
    })
  );
};

export const validateAutoOperationSetting = (autoOperationSetting: any) => {
  return (
    Array.isArray(autoOperationSetting.conditionGroups) &&
    autoOperationSetting.conditionGroups.every((condition: any) => {
      return (
        typeof condition.isEnabled === "boolean" &&
        typeof condition.settingName === "string" &&
        ("details" in condition ? typeof condition.details === "string" : true) &&
        Array.isArray(condition.autoOperations)
      );
    })
  );
};

export const validateTestHintSetting = (testHintSetting: any) => {
  return (
    "commentMatching" in testHintSetting &&
    ["all", "wordsOnPageOnly"].includes(testHintSetting.commentMatching.target) &&
    Array.isArray(testHintSetting.commentMatching.extraWords) &&
    testHintSetting.commentMatching.extraWords.every((word: any) => typeof word === "string") &&
    Array.isArray(testHintSetting.commentMatching.excludedWords) &&
    testHintSetting.commentMatching.excludedWords.every((word: any) => typeof word === "string") &&
    typeof testHintSetting.defaultSearchSeconds === "string"
  );
};
