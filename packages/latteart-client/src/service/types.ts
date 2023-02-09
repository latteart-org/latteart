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

export type TestResultViewOption = {
  node: {
    unit: "title" | "url";
    definitions: {
      name: string;
      conditions: {
        target: "title" | "url" | "keyword";
        method: "contains" | "equals" | "regex";
        value: string;
      }[];
    }[];
  };
};

export type CapturedScreenTransition = {
  title: string;
  url: string;
  imageData: string;
  windowHandle: string;
  timestamp: string;
  pageSource: string;
};

export type CapturedOperation = {
  input: string;
  type: string;
  elementInfo: ElementInfo | null;
  title: string;
  url: string;
  imageData: string;
  windowHandle: string;
  timestamp: string;
  screenElements: ElementInfo[];
  pageSource: string;
  inputElements: ElementInfo[];
  keywordTexts: string[];
  isAutomatic?: boolean | undefined;
};

export type ElementInfo = {
  tagname: string;
  text?: string | undefined;
  xpath: string;
  value?: string | undefined;
  checked?: boolean | undefined;
  attributes: {
    [key: string]: any;
  };
};

export type Operation = {
  input: string;
  type: string;
  elementInfo: ElementInfo | null;
  title: string;
  url: string;
  imageFileUrl: string;
  timestamp: string;
  inputElements: ElementInfo[];
  windowHandle: string;
  keywordTexts?: string[] | undefined;
  isAutomatic: boolean;
};

export type TestStep = {
  id: string;
  operation: Operation;
  intention: string | null;
  bugs: string[];
  notices: string[];
};

export type Note = {
  id: string;
  type: string;
  value: string;
  details: string;
  imageFileUrl?: string | undefined;
  tags?: string[] | undefined;
};

export type TestStepNote = {
  note: Note;
  testStep: TestStep;
};

export type CoverageSource = {
  title: string;
  url: string;
  screenElements: ElementInfo[];
};

export type InputElementInfo = {
  title: string;
  url: string;
  inputElements: ElementInfo[];
};

export type CaptureConfig = {
  platformName: "PC" | "Android" | "iOS";
  browser: "Chrome" | "Edge" | "Safari";
  device?: {
    deviceName: string;
    modelNumber: string;
    osVersion: string;
  };
  platformVersion?: string;
  waitTimeForStartupReload: number;
};

export type VisualizeConfig = {
  screenDefinition: {
    screenDefType: "title" | "url";
    conditionGroups: {
      isEnabled: boolean;
      screenName: string;
      conditions: {
        isEnabled: boolean;
        definitionType: "url" | "title" | "keyword";
        matchType: "contains" | "equals" | "regex";
        word: string;
      }[];
    }[];
  };
  coverage: {
    include: {
      tags: string[];
    };
  };
};
