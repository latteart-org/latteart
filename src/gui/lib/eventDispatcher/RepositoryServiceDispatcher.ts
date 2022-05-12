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

import RESTClient from "./RESTClient";
import { Reply, ReplyImpl } from "../captureControl/Reply";
import { TestResult } from "../operationHistory/types";
import {
  ManagedSession,
  ManagedStory,
} from "../testManagement/TestManagementData";
import { ProjectUpdatable } from "../testManagement/actions/WriteDataFileAction";
import { IntentionMovable } from "../operationHistory/actions/MoveIntentionAction";
import { IntentionRecordable } from "../operationHistory/actions/RecordIntentionAction";
import { TestScriptExportable } from "../operationHistory/actions/GenerateTestScriptsAction";
import { ProjectFetchable } from "../testManagement/actions/ReadProjectDataAction";
import { Importable } from "../testManagement/actions/ImportAction";
import { Exportable } from "../testManagement/actions/ExportAction";
import { TestResultImportable } from "../operationHistory/actions/ImportAction";
import { TestResultExportable } from "../operationHistory/actions/ExportAction";
import { TestMatrix, ProgressData } from "../testManagement/types";
import { TestResultUploadable } from "../operationHistory/actions/UploadTestResultAction";
import { TestResultDeletable } from "../operationHistory/actions/DeleteTestResultAction";
import { TestStepRepository } from "./repositoryService/TestStepRepository";
import { NoteRepository } from "./repositoryService/NoteRepository";
import { TestResultRepository } from "./repositoryService/TestResultRepository";
import { TestScriptRepository } from "./repositoryService/TestScriptRepository";
import { SettingGettable } from "../operationHistory/actions/ReadSettingAction";
import { SettingRepository } from "./repositoryService/SettingRepository";
import { ImportTestResultRepository } from "./repositoryService/ImportTestResultRepository";
import { ImportProjectRepository } from "./repositoryService/ImportProjectRepository";
import { CompressedImageRepository } from "./repositoryService/CompressedImageRepository";

/**
 * A class that processes the acquisition of client-side information through the service.
 */
export default class RepositoryServiceDispatcher
  implements
    ProjectUpdatable,
    ProjectFetchable,
    IntentionMovable,
    IntentionRecordable,
    TestScriptExportable,
    Importable,
    Exportable,
    TestResultImportable,
    TestResultExportable,
    TestResultUploadable,
    TestResultDeletable,
    SettingGettable {
  constructor(
    private config: {
      url: string;
      isRemote: boolean;
    }
  ) {
    const buildAPIURL = (url: string) => {
      return new URL(`api/v1${url}`, this.serviceUrl).toString();
    };
    this.restClient = new RESTClient();
    this._testStepRepository = new TestStepRepository(
      this.restClient,
      buildAPIURL
    );
    this._noteRepository = new NoteRepository(this.restClient, buildAPIURL);
    this._testResultRepository = new TestResultRepository(
      this.restClient,
      buildAPIURL
    );
    this._importTestResultRepository = new ImportTestResultRepository(
      this.restClient,
      buildAPIURL
    );
    this._importProjectRepository = new ImportProjectRepository(
      this.restClient,
      buildAPIURL
    );
    this._testScriptRepository = new TestScriptRepository(
      this.restClient,
      buildAPIURL
    );
    this._settingRepository = new SettingRepository(
      this.restClient,
      buildAPIURL
    );
    this._compressedImageRepository = new CompressedImageRepository(
      this.restClient,
      buildAPIURL
    );
  }

  /**
   * Service URL.
   */
  get serviceUrl(): string {
    return this.config.url;
  }

  get isRemote(): boolean {
    return this.config.isRemote;
  }

  /**
   * The URL of the proxy server used to connect to the service.
   */
  get proxyUrl(): string {
    return this._proxyUrl;
  }

  set proxyUrl(value: string) {
    this._proxyUrl = value;
  }

  private _proxyUrl = "";
  private restClient: RESTClient;
  private _testStepRepository: TestStepRepository;
  private _noteRepository: NoteRepository;
  private _testResultRepository: TestResultRepository;
  private _importTestResultRepository: ImportTestResultRepository;
  private _importProjectRepository: ImportProjectRepository;
  private _testScriptRepository: TestScriptRepository;
  private _settingRepository: SettingRepository;
  private _compressedImageRepository: CompressedImageRepository;

  public get testStepRepository(): TestStepRepository {
    return this._testStepRepository;
  }

  public get noteRepository(): NoteRepository {
    return this._noteRepository;
  }

  public get testResultRepository(): TestResultRepository {
    return this._testResultRepository;
  }

  public get importTestResultRepository(): ImportTestResultRepository {
    return this._importTestResultRepository;
  }

  public get importProjectRepository(): ImportProjectRepository {
    return this._importProjectRepository;
  }

  public get testScriptRepository(): TestScriptRepository {
    return this._testScriptRepository;
  }

  public get settingRepository(): SettingRepository {
    return this._settingRepository;
  }

  public get compressedImageRepository(): CompressedImageRepository {
    return this._compressedImageRepository;
  }

  /**
   * Import project or testresult or all.
   * @param importFileName  Import file name.
   * @param selectOption  Select options.
   */
  public async importZipFile(
    source: { projectFileUrl: string },
    selectOption: { includeProject: boolean; includeTestResults: boolean }
  ): Promise<Reply<{ projectId: string }>> {
    const response = await this.restClient.httpPost(
      this.buildAPIURL(`/imports/projects`),
      {
        source,
        includeTestResults: selectOption.includeTestResults,
        includeProject: selectOption.includeProject,
      }
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as { projectId: string },
    });
  }

  /**
   * Creates export project or testresult or all.
   * @param projectId  Project ID.
   * @param selectOption  Select option.
   * @returns Export File URL.
   */
  public async exportZipFile(
    projectId: string,
    selectOption: { includeProject: boolean; includeTestResults: boolean }
  ): Promise<Reply<{ url: string }>> {
    const response = await this.restClient.httpPost(
      this.buildAPIURL(`/projects/${projectId}/export`),
      selectOption
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as { url: string },
    });
  }

  /**
   * Get the test result of the specified test result ID.
   * @param testResultId  Test result ID.
   */
  public async getTestResult(
    testResultId: string
  ): Promise<
    Reply<{
      id: string;
      name: string;
      startTimeStamp: number;
      endTimeStamp: number;
      initialUrl: string;
      testSteps: any;
    }>
  > {
    const response = await this.restClient.httpGet(
      this.buildAPIURL(`/test-results/${testResultId}`)
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as {
        id: string;
        name: string;
        startTimeStamp: number;
        endTimeStamp: number;
        initialUrl: string;
        testSteps: any;
      },
    });
  }

  /**
   * Read project data.
   * @returns Project data.
   */
  public async readProject(): Promise<
    Reply<{
      projectId: string;
      testMatrices: TestMatrix[];
      progressDatas: ProgressData[];
      stories: ManagedStory[];
    }>
  > {
    const projects = (
      await this.restClient.httpGet(this.buildAPIURL(`/projects`))
    ).data as Array<{
      id: string;
      name: string;
    }>;

    const targetProjectId =
      projects.length === 0
        ? ((
            await this.restClient.httpPost(this.buildAPIURL(`/projects`), {
              name: "",
            })
          ).data as { id: string; name: string }).id
        : projects[projects.length - 1].id;

    const response = await this.restClient.httpGet(
      this.buildAPIURL(`/projects/${targetProjectId}`)
    );

    const data = {
      ...(response.data as any),
      projectId: targetProjectId,
    };

    return new ReplyImpl({
      status: response.status,
      data: data as {
        projectId: string;
        testMatrices: TestMatrix[];
        progressDatas: ProgressData[];
        stories: ManagedStory[];
      },
    });
  }

  /**
   * Update the project with the specified project ID.
   * @param projectId  Project ID.
   * @param body  Project information to update.
   * @returns Updated project information.
   */
  public async putProject(projectId: string, body: any): Promise<Reply<any>> {
    const response = await this.restClient.httpPut(
      this.buildAPIURL(`/projects/${projectId}`),
      body
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as any,
    });
  }

  public async updateSession(
    projectId: string,
    sessionId: string,
    body: Partial<ManagedSession>
  ): Promise<Reply<ManagedSession>> {
    const response = await this.restClient.httpPatch(
      this.buildAPIURL(`/projects/${projectId}/sessions/${sessionId}`),
      body
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as ManagedSession,
    });
  }

  /**
   * Create a snapshot of the specified project ID.
   * @param projectId  Project ID.
   * @returns URL of the snapshot.
   */
  public async postSnapshots(projectId: string): Promise<Reply<any>> {
    const response = await this.restClient.httpPost(
      this.buildAPIURL(`/projects/${projectId}/snapshots`),
      null
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as any,
    });
  }

  public async changeTestResult(
    testResultId: string,
    name?: string,
    startTime?: number,
    initialUrl?: string
  ): Promise<Reply<string>> {
    const response = await this.restClient.httpPatch(
      this.buildAPIURL(`/test-results/${testResultId}`),
      { name, startTime, initialUrl }
    );

    return new ReplyImpl({
      status: response.status,
      data: (response.data as TestResult).name,
    });
  }

  /**
   * Generate API URL.
   * @param url  URL after the fixed value.
   * @returns  URL
   */
  private buildAPIURL(url: string) {
    return new URL(`api/v1${url}`, this.serviceUrl).toString();
  }
}
