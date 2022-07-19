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

import { RESTClient, RESTClientResponse } from "../RESTClient";
import {
  createConnectionRefusedFailure,
  createRepositoryAccessFailure,
  RepositoryAccessResult,
  RepositoryAccessSuccess,
} from "@/lib/captureControl/Reply";
import { ViewPoint } from "@/lib/testManagement/types";

export class ViewPointRepository {
  constructor(private restClient: RESTClient) {}

  public async getViewPoint(
    id: string
  ): Promise<RepositoryAccessResult<ViewPoint>> {
    try {
      const response = await this.restClient.httpGet(`/view-points/${id}`);
      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as ViewPoint,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async postViewPoint(body: {
    testMatrixId: string;
    name: string;
    index: number;
    description: string;
  }): Promise<RepositoryAccessResult<ViewPoint>> {
    try {
      const response = await this.restClient.httpPost(`/view-points`, body);

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as ViewPoint,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async patchViewPoint(
    id: string,
    body: {
      name?: string;
      description?: string;
      index?: number;
    }
  ): Promise<RepositoryAccessResult<ViewPoint>> {
    try {
      const response = await this.restClient.httpPatch(
        `/view-points/${id}`,
        body
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as ViewPoint,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async deleteViewPoint(
    id: string
  ): Promise<RepositoryAccessResult<void>> {
    try {
      const response = await this.restClient.httpDelete(`/view-points/${id}`);

      if (response.status !== 204) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess(response.data as { data: void });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
