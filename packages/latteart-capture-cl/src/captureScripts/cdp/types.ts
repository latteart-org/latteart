/**
 * Copyright 2025 NTT Corporation.
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
  CapturedElementInfo,
  Iframe,
  ScreenMutationForScript,
  SuspendedCapturedItem,
} from "../types";

export type ExtendedWindowForCDP = Window & {
  getIFrameInfo?: () => Iframe | undefined;
  sendCapturedOperation?: (data: {
    suspendedOperation: SuspendedCapturedItem;
    screenElements: { iframeIndex?: number; elements: CapturedElementInfo[] };
  }) => void;

  sendCapturedMutation?: (data: {
    mutation: ScreenMutationForScript;
    screenElements: { iframeIndex?: number; elements: CapturedElementInfo[] };
  }) => void;
};
