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

import { RESTClient } from "../../network/http/client";
import {
  RepositoryAccessResult,
  createRepositoryAccessSuccess,
  createRepositoryAccessFailure,
  createConnectionRefusedFailure,
} from "./result";
import { DailyTestProgressForRepository, ProjectForRepository } from "./types";

export interface ProjectRepository {
  /**
   * Creates export project or testresult or all.
   * @param projectId  Project ID.
   * @param selectOption  Select option.
   * @returns Export File URL.
   */
  postProjectForExport(
    projectId: string,
    selectOption: { includeProject: boolean; includeTestResults: boolean }
  ): Promise<RepositoryAccessResult<{ url: string }>>;

  getProjects(): Promise<
    RepositoryAccessResult<
      Array<{
        id: string;
        name: string;
        createdAt: string;
      }>
    >
  >;

  getProject(
    projectId: string
  ): Promise<RepositoryAccessResult<ProjectForRepository>>;

  postProject(): Promise<RepositoryAccessResult<{ id: string; name: string }>>;

  getTestProgress(
    projectId: string,
    filter?: {
      period?: { since?: number; until?: number };
    }
  ): Promise<RepositoryAccessResult<DailyTestProgressForRepository[]>>;
}

export class ProjectRESTRepository implements ProjectRepository {
  constructor(private restClient: RESTClient) {}

  /**
   * Creates export project or testresult or all.
   * @param projectId  Project ID.
   * @param selectOption  Select option.
   * @returns Export File URL.
   */
  public async postProjectForExport(
    projectId: string,
    selectOption: { includeProject: boolean; includeTestResults: boolean }
  ): Promise<RepositoryAccessResult<{ url: string }>> {
    try {
      const response = await this.restClient.httpPost(
        `api/v1/projects/${projectId}/export`,
        selectOption
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

  public async getProjects(): Promise<
    RepositoryAccessResult<
      Array<{
        id: string;
        name: string;
        createdAt: string;
      }>
    >
  > {
    try {
      const response = await this.restClient.httpGet(`api/v1/projects`);

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as Array<{
          id: string;
          name: string;
          createdAt: string;
        }>,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async getProject(
    projectId: string
  ): Promise<RepositoryAccessResult<ProjectForRepository>> {
    try {
      const response = await this.restClient.httpGet(
        `api/v1/projects/${projectId}`
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as ProjectForRepository,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async postProject(): Promise<
    RepositoryAccessResult<{ id: string; name: string }>
  > {
    try {
      const response = await this.restClient.httpPost(`api/v1/projects`, {
        name: "",
      });

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as { id: string; name: string },
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async getTestProgress(
    projectId: string,
    filter: {
      period?: { since?: number; until?: number };
    } = {}
  ): Promise<RepositoryAccessResult<DailyTestProgressForRepository[]>> {
    try {
      const query: string[] = [];
      if (filter.period?.since !== undefined) {
        query.push(`since=${filter.period.since}`);
      }
      if (filter.period?.until !== undefined) {
        query.push(`until=${filter.period.until}`);
      }

      const response = await this.restClient.httpGet(
        `api/v1/projects/${projectId}/progress${
          query.length > 0 ? `?${query.join("&")}` : ""
        }`
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      const dailyTestProgresses =
        response.data as DailyTestProgressForRepository[];

      return createRepositoryAccessSuccess({
        data: dailyTestProgresses,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
