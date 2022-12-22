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
  CapturedOperationForRepository,
  ElementInfoForRepository,
  OperationForRepository,
  CoverageSourceForRepository,
  InputElementInfoForRepository,
  NoteForRepository,
  TestStepForRepository,
} from "../gateway/repository";

export type CapturedScreenTransition = {
  type: string;
  title: string;
  url: string;
  imageData: string;
  windowHandle: string;
  timestamp: string;
  pageSource: string;
};

export type CapturedOperation = CapturedOperationForRepository;

export type ElementInfo = ElementInfoForRepository;

export type Operation = OperationForRepository;

export type TestStep = TestStepForRepository;

export type Note = NoteForRepository;

export type TestStepNote = {
  note: Note;
  testStep: TestStep;
};

export type CoverageSource = CoverageSourceForRepository;

export type InputElementInfo = InputElementInfoForRepository;

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
