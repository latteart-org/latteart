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

/**
 * Device information.
 */
export interface DeviceInfo {
  /**
   * Platform.
   */
  platform: "Android" | "iOS";

  /**
   * Device ID.
   */
  id: string;

  /**
   * Device name.
   */
  name: string;

  /**
   * OS version.
   */
  osVersion: string;
}

/**
 * Interface for accessing devices.
 */
export default interface DeviceAccessor {
  /**
   * Get connected devices.
   * @returns Connected devices.
   */
  getDevices(): Promise<DeviceInfo[]>;

  /**
   * Whether the device is connected or not.
   * @param deviceId Device ID.
   * @returns 'true': The device is connected, 'false': The device is not connected.
   */
  deviceIsConnected(deviceId: string): Promise<boolean>;
}
