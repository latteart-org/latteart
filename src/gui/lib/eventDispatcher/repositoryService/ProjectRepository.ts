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
import { Reply, ReplyImpl } from "@/lib/captureControl/Reply";
import { Project } from "@/lib/testManagement/types";
import { TestManagementData } from "@/lib/testManagement/TestManagementData";

export interface ProjectRepository {
  postProjectForExport(
    projectId: string,
    selectOption: { includeProject: boolean; includeTestResults: boolean }
  ): Promise<Reply<{ url: string }>>;
  getProjects(): Promise<
    Reply<
      Array<{
        id: string;
        name: string;
        createdAt: string;
      }>
    >
  >;
  getProject(projectId: string): Promise<Reply<Project>>;
  postProject(): Promise<Reply<{ id: string; name: string }>>;
  putProject(
    projectId: string,
    body: TestManagementData
  ): Promise<Reply<Project>>;
}

export class ProjectRepositoryImpl implements ProjectRepository {
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
  ): Promise<Reply<{ url: string }>> {
    const response = await this.restClient.httpPost(
      `/projects/${projectId}/export`,
      selectOption
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as { url: string },
    });
  }

  public async getProjects(): Promise<
    Reply<
      Array<{
        id: string;
        name: string;
        createdAt: string;
      }>
    >
  > {
    const response = await this.restClient.httpGet(`/projects`);

    return new ReplyImpl({
      status: response.status,
      data: response.data as Array<{
        id: string;
        name: string;
        createdAt: string;
      }>,
    });
  }

  public async getProject(projectId: string): Promise<Reply<Project>> {
    const response = await this.restClient.httpGet(`/projects/${projectId}`);

    return new ReplyImpl({
      status: response.status,
      data: response.data as Project,
    });
  }

  public async postProject(): Promise<Reply<{ id: string; name: string }>> {
    const response = await this.restClient.httpPost(`/projects`, {
      name: "",
    });

    return new ReplyImpl({
      status: response.status,
      data: response.data as { id: string; name: string },
    });
  }

  /**
   * Update the project with the specified project ID.
   * @param projectId  Project ID.
   * @param body  Project information to update.
   * @returns Updated project information.
   */
  public async putProject(
    projectId: string,
    body: TestManagementData
  ): Promise<Reply<Project>> {
    const response = await this.restClient.httpPut(
      `/projects/${projectId}`,
      body
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as Project,
    });
  }
}
