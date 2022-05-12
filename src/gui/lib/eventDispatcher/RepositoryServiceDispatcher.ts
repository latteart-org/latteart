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
import { CoverageSource, InputElementInfo } from "../operationHistory/types";
import { ProjectUpdatable } from "../testManagement/actions/WriteDataFileAction";
import { IntentionMovable } from "../operationHistory/actions/MoveIntentionAction";
import { IntentionRecordable } from "../operationHistory/actions/RecordIntentionAction";
import { TestScriptExportable } from "../operationHistory/actions/GenerateTestScriptsAction";
import { TestResultImportable } from "../operationHistory/actions/ImportAction";
import { TestResultExportable } from "../operationHistory/actions/ExportAction";
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
import { Operation } from "../operationHistory/Operation";
import { Note } from "../operationHistory/Note";
import { OperationHistoryItem } from "../captureControl/OperationHistoryItem";
import { ProjectRepository } from "./repositoryService/ProjectRepository";
import { SessionRepository } from "./repositoryService/SessionRepository";
import { SnapshotRepository } from "./repositoryService/SnapshotRepository";

/**
 * A class that processes the acquisition of client-side information through the service.
 */
export default class RepositoryServiceDispatcher
  implements
    ProjectUpdatable,
    IntentionMovable,
    IntentionRecordable,
    TestScriptExportable,
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
    this._projectRepository = new ProjectRepository(
      this.restClient,
      buildAPIURL
    );
    this._sessionRepository = new SessionRepository(
      this.restClient,
      buildAPIURL
    );
    this._snapshotRepository = new SnapshotRepository(
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
  private _projectRepository: ProjectRepository;
  private _sessionRepository: SessionRepository;
  private _snapshotRepository: SnapshotRepository;

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

  public get projectRepository(): ProjectRepository {
    return this._projectRepository;
  }

  public get sessionRepository(): SessionRepository {
    return this._sessionRepository;
  }

  public get snapshotRepository(): SnapshotRepository {
    return this._snapshotRepository;
  }

  /**
   * Restore the operation history of the specified test result ID
   * @param testResultId  Test result ID.
   * @returns Restored operation history information.
   */
  public async resume(
    testResultId: string
  ): Promise<
    Reply<{
      id: string;
      name: string;
      operationHistoryItems: ({ testStepId: string } & OperationHistoryItem)[];
      coverageSources: CoverageSource[];
      inputElementInfos: InputElementInfo[];
      initialUrl: string;
    }>
  > {
    const response = await this.restClient.httpGet(
      this.buildAPIURL(`/test-results/${testResultId}`)
    );

    const testResult = response.data as {
      id: string;
      name: string;
      testSteps: any[];
      coverageSources: CoverageSource[];
      inputElementInfos: InputElementInfo[];
      initialUrl: string;
    };

    const data = {
      id: testResult.id,
      name: testResult.name,
      operationHistoryItems: testResult.testSteps.map((testStep) => {
        return {
          testStepId: testStep.id,
          operation: testStep.operation
            ? Operation.createFromOtherOperation({
                other: testStep.operation,
                overrideParams: {
                  imageFilePath: testStep.operation.imageFileUrl
                    ? new URL(
                        testStep.operation.imageFileUrl,
                        this.serviceUrl
                      ).toString()
                    : "",
                  keywordSet: new Set(testStep.operation.keywordTexts),
                },
              })
            : testStep.operation,
          intention: testStep.intention,
          bugs:
            testStep.bugs?.map((bug: any) => {
              return Note.createFromOtherNote({
                other: bug,
                overrideParams: {
                  imageFilePath: bug.imageFileUrl
                    ? new URL(bug.imageFileUrl, this.serviceUrl).toString()
                    : "",
                },
              });
            }) ?? null,
          notices:
            testStep.notices?.map((notice: any) => {
              return Note.createFromOtherNote({
                other: notice,
                overrideParams: {
                  imageFilePath: notice.imageFileUrl
                    ? new URL(notice.imageFileUrl, this.serviceUrl).toString()
                    : "",
                },
              });
            }) ?? null,
        };
      }),
      coverageSources: testResult.coverageSources,
      inputElementInfos: testResult.inputElementInfos,
      initialUrl: testResult.initialUrl,
    };

    return new ReplyImpl({ status: response.status, data: data });
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
   * Generate API URL.
   * @param url  URL after the fixed value.
   * @returns  URL
   */
  private buildAPIURL(url: string) {
    return new URL(`api/v1${url}`, this.serviceUrl).toString();
  }
}
