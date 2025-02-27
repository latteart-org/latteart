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

/**
 * Captured Operation.
 */
export type CapturedOperationForCaptureCl = {
  input: string;
  type: string;
  elementInfo: ElementInfoForCaptureCl | null;
  title: string;
  url: string;
  imageData: string;
  windowHandle: string;
  timestamp: string;
  screenElements: ScreenElementsForCaptureCl[];
  pageSource: string;
  scrollPosition: { x: number; y: number };
  clientSize: { width: number; height: number };
  isAutomatic?: boolean;
};

/**
 * Captured Screen Transition.
 */
export type CapturedScreenTransitionForCaptureCl = {
  title: string;
  url: string;
  imageData: string;
  windowHandle: string;
  timestamp: string;
  screenElements: ScreenElementsForCaptureCl[];
  pageSource: string;
  scrollPosition: { x: number; y: number };
  clientSize: { width: number; height: number };
};

export type ScreenElementsForCaptureCl = {
  iframeIndex?: number;
  elements: ElementInfoForCaptureCl[];
};

export type ElementInfoForCaptureCl = {
  tagname: string;
  text?: string;
  xpath: string;
  value?: string;
  checked?: boolean;
  attributes: { [key: string]: string };
  boundingRect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  innerHeight?: number;
  innerWidth?: number;
  outerHeight?: number;
  outerWidth?: number;
  textWithoutChildren?: string;
  iframe?: {
    index: number;
    boundingRect: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
    innerHeight: number;
    innerWidth: number;
    outerHeight: number;
    outerWidth: number;
  };
};

export type CaptureCLServerError = {
  code: CaptureCLServerErrorCode | CaptureCLConnectionErrorCode;
  message?: string;
  details?: Array<{
    code: string;
    message: string;
    target: string;
  }>;
};

type CaptureCLServerErrorCode =
  | "detect_devices_failed"
  | "capture_failed"
  | "unknown_error"
  | "invalid_url"
  | "web_driver_version_mismatch"
  | "connection_refused"
  | "web_driver_not_ready"
  | "appium_not_started"
  | "device_not_connected"
  | "invalid_operation"
  | "element_not_found"
  | "element_not_interactable";

type CaptureCLConnectionErrorCode =
  | "capture_socket_disconnected"
  | "client_side_capture_service_not_found";
