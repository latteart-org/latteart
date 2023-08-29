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

import {
  CapturedOperationForCaptureCl,
  CapturedScreenTransitionForCaptureCl,
  ElementInfoForCaptureCl,
  ScreenElementsForCaptureCl,
} from "../gateway/captureCl";

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

export type CapturedScreenTransition = CapturedScreenTransitionForCaptureCl & {
  videoId?: string;
  videoTime?: number;
};

export type CapturedOperation = CapturedOperationForCaptureCl & {
  videoId?: string;
  videoTime?: number;
};

export type ScreenElements = ScreenElementsForCaptureCl;

export type ElementInfo = ElementInfoForCaptureCl;

export type Video = { id: string; url: string; width: number; height: number };

export type VideoFrame = Omit<Video, "id"> & { time: number };

export type Operation = {
  input: string;
  type: string;
  elementInfo: ElementInfo | null;
  title: string;
  url: string;
  imageFileUrl: string;
  timestamp: string;
  windowHandle: string;
  keywordTexts?: (string | { tagname: string; value: string })[];
  scrollPosition?: { x: number; y: number };
  clientSize?: { width: number; height: number };
  isAutomatic: boolean;
  videoFrame?: VideoFrame;
};

export type RunnableOperation = Pick<
  Operation,
  "type" | "input" | "elementInfo" | "clientSize" | "scrollPosition"
> &
  Partial<Pick<Operation, "timestamp" | "windowHandle" | "title">>;

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
  imageFileUrl: string;
  tags: string[];
  timestamp: number;
  videoFrame?: VideoFrame;
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
  mediaType: "image" | "video";
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
