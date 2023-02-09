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

import { ElementInfo } from "@/Operation";

/**
 * Suspended event.
 */
export interface SuspendedEvent {
  /**
   * Refire event.
   */
  reFire(): Promise<void>;

  /**
   * ReFire event type from webdriver.
   */
  reFireFromWebdriverType: string;
}

/**
 * Captured data.
 */
export interface CapturedData {
  /**
   * Operation.
   */
  operation: OperationInfo;

  /**
   * The screen elements in the screen that has been operated.
   */
  elements: ElementInfo[];

  /**
   * The event that is suspended.
   */
  suspendedEvent: SuspendedEvent;
}

/**
 * Event information.
 */
export interface EventInfo {
  /**
   * Event ID.
   */
  id: string;

  /**
   * The XPath of the screen element that has been operated.
   */
  targetXPath: string;

  /**
   * Event Type.
   */
  type: string;

  /**
   * Option.
   */
  option: {
    /**
     * Whether it bubbles or not.
     */
    bubbles: boolean;

    /**
     * Whether it is cancelable or not.
     */
    cancelable: boolean;
  };
}

/**
 * Operation information.
 */
export interface OperationInfo {
  /**
   * Input value.
   */
  input: string;

  /**
   * Operation type.
   */
  type: string;

  /**
   * The screen element that has been operated.
   */
  elementInfo: ElementInfoWithBoundingRect;

  /**
   * The title of the screen that has been operated.
   */
  title: string;

  /**
   * The URL of the screen that has been operated.
   */
  url: string;
}

/**
 * Element information with bounding rect.
 */
export interface ElementInfoWithBoundingRect extends ElementInfo {
  /**
   * Bounding Rect.
   */
  boundingRect: {
    /**
     * Top.
     */
    top: number;

    /**
     * Left.
     */
    left: number;

    /**
     * Width.
     */
    width: number;

    /**
     * Height.
     */
    height: number;
  };
}
