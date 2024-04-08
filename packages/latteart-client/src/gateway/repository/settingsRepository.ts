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

import { RESTClient } from "../../network/http/client";
import {
  RepositoryAccessResult,
  createRepositoryAccessSuccess,
  createRepositoryAccessFailure,
  createConnectionRefusedFailure,
} from "./result";
import { SettingsForRepository } from "./types";

export type SettingsRepository = {
  /**
   * Get setting information.
   * @returns Setting information.
   */
  getSettings(): Promise<RepositoryAccessResult<SettingsForRepository>>;

  /**
   * Save the setting information.
   * @param settings  Setting information.
   * @returns Saved setting information.
   */
  putSettings(
    settings: SettingsForRepository
  ): Promise<RepositoryAccessResult<SettingsForRepository>>;

  /**
   * Configuration file output.
   * @returns Config file URL.
   */
  exportSettings(): Promise<RepositoryAccessResult<{ url: string }>>;
};

export class SettingsRepositoryImpl implements SettingsRepository {
  constructor(private restClient: RESTClient) {}

  public async getSettings(): Promise<
    RepositoryAccessResult<SettingsForRepository>
  > {
    try {
      const response = await this.restClient.httpGet(
        `api/v1/projects/1/configs`
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as SettingsForRepository,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async putSettings(
    settings: SettingsForRepository
  ): Promise<RepositoryAccessResult<SettingsForRepository>> {
    try {
      const response = await this.restClient.httpPut(
        `api/v1/projects/1/configs`,
        settings
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as SettingsForRepository,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async exportSettings(): Promise<
    RepositoryAccessResult<{ url: string }>
  > {
    try {
      const response = await this.restClient.httpPost(
        `api/v1/projects/1/configs/export`
      );
      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as { url: string },
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
