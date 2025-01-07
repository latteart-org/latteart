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

export const validateUserSettings = (userSettings: unknown) => {
  return (
    !!userSettings &&
    typeof userSettings === "object" &&
    "captureMediaSetting" in userSettings &&
    validateCaptureMediaSetting(userSettings.captureMediaSetting) &&
    "autoOperationSetting" in userSettings &&
    validateAutoOperationSetting(userSettings.autoOperationSetting) &&
    "autofillSetting" in userSettings &&
    validateAutofillSetting(userSettings.autofillSetting) &&
    "testHintSetting" in userSettings &&
    validateTestHintSetting(userSettings.testHintSetting) &&
    "deviceSettings" in userSettings &&
    validateDeviceSetting(userSettings.deviceSettings) &&
    "testScriptOption" in userSettings &&
    isObject(userSettings.testScriptOption) &&
    ("buttonDefinitions" in userSettings.testScriptOption
      ? validateButtonDefinitions(userSettings.testScriptOption.buttonDefinitions)
      : true) &&
    "repositoryUrls" in userSettings &&
    validateRepositoryUrls(userSettings.repositoryUrls) &&
    "locale" in userSettings &&
    validateLocale(userSettings.locale)
  );
};

export const validateLocale = (locale: unknown) => {
  if (includes(locale, ["ja", "en"])) {
    return true;
  }
  console.error(`invalid locale.${locale}`);
  return false;
};

export const validateRepositoryUrls = (repositoryUrls: unknown) => {
  if (Array.isArray(repositoryUrls) && repositoryUrls.every((url) => typeof url === "string")) {
    return true;
  }
  console.error(`invalid repositoryUrls.${repositoryUrls}`);
  return false;
};

export const validateButtonDefinitions = (buttonDefinitions?: unknown) => {
  if (
    buttonDefinitions
      ? Array.isArray(buttonDefinitions) &&
        buttonDefinitions.every((definition) => {
          return typeof definition.tagname === "string" && definition.attribute
            ? typeof definition.attribute.name === "string" &&
                typeof definition.attribute.value === "string"
            : true;
        })
      : true
  ) {
    return true;
  }
  console.error(`invalid buttonDefinitions.${JSON.stringify(buttonDefinitions)}`);
  return false;
};

export const validateDeviceSetting = (deviceSetting: unknown) => {
  if (
    isObject(deviceSetting) &&
    "platformName" in deviceSetting &&
    includes(deviceSetting.platformName, ["PC", "Android", "iOS"]) &&
    "browser" in deviceSetting &&
    includes(deviceSetting.browser, ["Chrome", "Edge", "Safari"]) &&
    ("device" in deviceSetting
      ? isObject(deviceSetting.device) &&
        "deviceName" in deviceSetting.device &&
        typeof deviceSetting.device.deviceName === "string" &&
        "modelNumber" in deviceSetting.device &&
        typeof deviceSetting.device.modelNumber === "string" &&
        "osVersion" in deviceSetting.device &&
        typeof deviceSetting.device.osVersion === "string"
      : true) &&
    ("platformVersion" in deviceSetting
      ? typeof deviceSetting.platformVersion === "string"
      : true) &&
    "waitTimeForStartupReload" in deviceSetting &&
    typeof deviceSetting.waitTimeForStartupReload === "number"
  ) {
    return true;
  }
  console.error(`invalid deviceSetting.${JSON.stringify(deviceSetting)}`);
  return false;
};

export const validateCaptureMediaSetting = (captureMediaSetting: unknown) => {
  if (
    isObject(captureMediaSetting) &&
    "mediaType" in captureMediaSetting &&
    includes(captureMediaSetting.mediaType, ["image", "video", "video_and_image"]) &&
    "imageCompression" in captureMediaSetting &&
    isObject(captureMediaSetting.imageCompression) &&
    "format" in captureMediaSetting.imageCompression &&
    includes(captureMediaSetting.imageCompression.format, ["png", "webp"])
  ) {
    return true;
  }
  console.error(`invalid captureMediaSetting.${JSON.stringify(captureMediaSetting)}`);
  return false;
};

export const validateAutofillSetting = (autofillSetting: unknown) => {
  if (
    isObject(autofillSetting) &&
    "autoPopupRegistrationDialog" in autofillSetting &&
    typeof autofillSetting.autoPopupRegistrationDialog === "boolean" &&
    "autoPopupSelectionDialog" in autofillSetting &&
    typeof autofillSetting.autoPopupSelectionDialog === "boolean" &&
    "conditionGroups" in autofillSetting &&
    Array.isArray(autofillSetting.conditionGroups) &&
    autofillSetting.conditionGroups.every((conditionGroup: unknown) => {
      return (
        isObject(conditionGroup) &&
        "isEnabled" in conditionGroup &&
        typeof conditionGroup.isEnabled === "boolean" &&
        "settingName" in conditionGroup &&
        typeof conditionGroup.settingName === "string" &&
        "url" in conditionGroup &&
        typeof conditionGroup.url === "string" &&
        "title" in conditionGroup &&
        typeof conditionGroup.title === "string" &&
        "inputValueConditions" in conditionGroup &&
        Array.isArray(conditionGroup.inputValueConditions) &&
        conditionGroup.inputValueConditions.every((inputValueCondition: unknown) => {
          return (
            isObject(inputValueCondition) &&
            "isEnabled" in inputValueCondition &&
            typeof inputValueCondition.isEnabled === "boolean" &&
            "locatorType" in inputValueCondition &&
            includes(inputValueCondition.locatorType, ["id", "xpath"]) &&
            "locator" in inputValueCondition &&
            typeof inputValueCondition.locator === "string" &&
            "locatorMatchType" in inputValueCondition &&
            includes(inputValueCondition.locatorMatchType, ["equals", "regex"]) &&
            "inputValue" in inputValueCondition &&
            typeof inputValueCondition.inputValue === "string" &&
            ("iframeIndex" in inputValueCondition
              ? typeof inputValueCondition.iframeIndex === "number"
              : true)
          );
        })
      );
    })
  ) {
    return true;
  }
  console.error(`invalid autofillSetting.${JSON.stringify(autofillSetting)}`);
  return false;
};

export const validateAutoOperationSetting = (autoOperationSetting: unknown) => {
  if (
    isObject(autoOperationSetting) &&
    "conditionGroups" in autoOperationSetting &&
    Array.isArray(autoOperationSetting.conditionGroups) &&
    autoOperationSetting.conditionGroups.every((condition: any) => {
      return (
        typeof condition.isEnabled === "boolean" &&
        typeof condition.settingName === "string" &&
        ("details" in condition ? typeof condition.details === "string" : true) &&
        Array.isArray(condition.autoOperations)
      );
    })
  ) {
    return true;
  }
  console.error(`invalid autoOperationSetting.${JSON.stringify(autoOperationSetting)}`);
  return false;
};

export const validateTestHintSetting = (testHintSetting: unknown) => {
  if (
    isObject(testHintSetting) &&
    "commentMatching" in testHintSetting &&
    isObject(testHintSetting.commentMatching) &&
    "target" in testHintSetting.commentMatching &&
    includes(testHintSetting.commentMatching.target, ["all", "wordsOnPageOnly"]) &&
    "extraWords" in testHintSetting.commentMatching &&
    Array.isArray(testHintSetting.commentMatching.extraWords) &&
    testHintSetting.commentMatching.extraWords.every((word: any) => typeof word === "string") &&
    "excludedWords" in testHintSetting.commentMatching &&
    Array.isArray(testHintSetting.commentMatching.excludedWords) &&
    testHintSetting.commentMatching.excludedWords.every((word: any) => typeof word === "string") &&
    "defaultSearchSeconds" in testHintSetting &&
    typeof testHintSetting.defaultSearchSeconds === "number"
  ) {
    return true;
  }
  console.error(`invalid testHintSetting.${JSON.stringify(testHintSetting)}`);
  return false;
};

const isObject = (value: unknown): value is object => {
  return value !== null && typeof value === "object";
};

const includes = (value: unknown, target: string[]) => {
  return typeof value === "string" && target.includes(value);
};
