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

import { RESTClient } from "../RESTClient";
import Settings, {
  ScreenDefinition,
  Coverage,
  ImageCompression,
} from "@/lib/common/settings/Settings";
import {
  RepositoryAccessResult,
  RepositoryAccessSuccess,
  createRepositoryAccessFailure,
  createConnectionRefusedFailure,
} from "@/lib/captureControl/Reply";
import {
  AutofillSetting,
  AutoOperationSetting,
} from "@/lib/operationHistory/types";

type SettingsFromDB = Omit<Settings, "config"> & {
  config: {
    autofillSetting: Pick<AutofillSetting, "conditionGroups">;
    autoOperationSetting: AutoOperationSetting;
    screenDefinition: ScreenDefinition;
    coverage: Coverage;
    imageCompression: ImageCompression;
  };
};

export class SettingRepository {
  constructor(private restClient: RESTClient) {}

  /**
   * Get setting information.
   * @returns Setting information.
   */
  public async getSettings(): Promise<RepositoryAccessResult<SettingsFromDB>> {
    try {
      const response = await this.restClient.httpGet(`/projects/1/configs`);

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as SettingsFromDB,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  /**
   * Save the setting information.
   * @param settings  Setting information.
   * @returns Saved setting information.
   */
  public async putSettings(
    settings: SettingsFromDB
  ): Promise<RepositoryAccessResult<SettingsFromDB>> {
    try {
      const response = await this.restClient.httpPut(
        `/projects/1/configs`,
        settings
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as SettingsFromDB,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  /**
   * Configuration file output.
   * @returns Config file URL.
   */
  public async exportSettings(): Promise<
    RepositoryAccessResult<{ url: string }>
  > {
    try {
      const response = await this.restClient.httpPost(
        "/projects/1/configs/export"
      );
      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as { url: string },
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
