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

import { ServiceError, ServiceFailure, ServiceSuccess } from "../result";
import { CaptureConfig, Video } from "../types";
import { TestResultAccessor } from "../repositoryService";
import { CaptureClServerAdapter } from "../../gateway/captureCl/captureClServerAdapter";
import { CaptureClClientImpl } from "./captureClClient";
import { CaptureClService, CaptureEventListeners } from "./types";

/**
 * create a Client Side Capture Service
 * @param serviceUrl service url
 */
export function createCaptureClService(serviceUrl: string): CaptureClService {
  const captureCl = new CaptureClServerAdapter(serviceUrl);

  return {
    serviceUrl,
    createCaptureClient(option: {
      testResult?: TestResultAccessor;
      videoRecorder?: { getCapturingVideo(): Promise<Video> };
      config: CaptureConfig;
      eventListeners: CaptureEventListeners;
    }) {
      return new CaptureClClientImpl(captureCl, option);
    },
    async recognizeDevices(platformName: string) {
      const result = await captureCl.recognizeDevices(platformName);

      if (result.isFailure()) {
        const error: ServiceError = {
          errorCode: "detect_devices_failed",
          message: "Detect devices failed.",
        };
        console.error(error.message);

        return new ServiceFailure(error);
      }

      return new ServiceSuccess(result.data);
    },
  };
}
