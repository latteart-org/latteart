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
import { ProjectUpdatable } from "../testManagement/actions/WriteDataFileAction";
import { IntentionMovable } from "../operationHistory/actions/MoveIntentionAction";
import { IntentionRecordable } from "../operationHistory/actions/RecordIntentionAction";
import { TestScriptExportable } from "../operationHistory/actions/GenerateTestScriptsAction";
import { TestResultUploadable } from "../operationHistory/actions/UploadTestResultAction";
import { TestResultDeletable } from "../operationHistory/actions/DeleteTestResultAction";
import {
  TestStepRepository,
  TestStepRepositoryImpl,
} from "./repositoryService/TestStepRepository";
import {
  NoteRepository,
  NoteRepositoryImpl,
} from "./repositoryService/NoteRepository";
import {
  TestResultRepository,
  TestResultRepositoryImpl,
} from "./repositoryService/TestResultRepository";
import { TestScriptRepository } from "./repositoryService/TestScriptRepository";
import { SettingGettable } from "../operationHistory/actions/ReadSettingAction";
import { SettingRepository } from "./repositoryService/SettingRepository";
import {
  ImportTestResultRepositoryImpl,
  ImportTestResultRepository,
} from "./repositoryService/ImportTestResultRepository";
import { ImportProjectRepository } from "./repositoryService/ImportProjectRepository";
import { CompressedImageRepository } from "./repositoryService/CompressedImageRepository";
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
    this._testStepRepository = new TestStepRepositoryImpl(
      this.restClient,
      buildAPIURL
    );
    this._noteRepository = new NoteRepositoryImpl(this.restClient, buildAPIURL);
    this._testResultRepository = new TestResultRepositoryImpl(
      this.restClient,
      buildAPIURL
    );
    this._importTestResultRepository = new ImportTestResultRepositoryImpl(
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
   * Generate API URL.
   * @param url  URL after the fixed value.
   * @returns  URL
   */
  private buildAPIURL(url: string) {
    return new URL(`api/v1${url}`, this.serviceUrl).toString();
  }
}
