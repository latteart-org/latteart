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

import RESTClient from "../RESTClient";
import Settings from "@/lib/common/settings/Settings";
import { Reply, ReplyImpl } from "@/lib/captureControl/Reply";
import DeviceSettings from "@/lib/common/settings/DeviceSettings";

export class SettingRepository {
  constructor(
    private restClient: RESTClient,
    private buildAPIURL: (url: string) => string
  ) {}

  /**
   * Get setting information.
   * @returns Setting information.
   */
  public async getSettings(): Promise<Reply<Settings>> {
    const response = await this.restClient.httpGet(
      this.buildAPIURL(`/projects/1/configs`)
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as Settings,
    });
  }

  /**
   * Save the setting information.
   * @param settings  Setting information.
   * @returns Saved setting information.
   */
  public async putSettings(settings: Settings): Promise<Reply<Settings>> {
    const response = await this.restClient.httpPut(
      this.buildAPIURL(`/projects/1/configs`),
      settings
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as Settings,
    });
  }

  /**
   * Get device settings information.
   * @returns Device settings information
   */
  public async getDeviceSettings(): Promise<Reply<DeviceSettings>> {
    const response = await this.restClient.httpGet(
      this.buildAPIURL(`/projects/1/device-configs`)
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as DeviceSettings,
    });
  }

  /**
   * Save device settings information.
   * @param deviceSettings  Device settings information.
   * @returns  Saved device settings information.
   */
  public async putDeviceSettings(
    deviceSettings: DeviceSettings
  ): Promise<Reply<DeviceSettings>> {
    const response = await this.restClient.httpPut(
      this.buildAPIURL(`/projects/1/device-configs`),
      deviceSettings
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as DeviceSettings,
    });
  }
}
