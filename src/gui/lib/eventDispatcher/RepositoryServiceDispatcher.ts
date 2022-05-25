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

import { ProjectUpdatable } from "../testManagement/actions/WriteDataFileAction";
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
import { SettingRepository } from "./repositoryService/SettingRepository";
import {
  ImportTestResultRepositoryImpl,
  ImportTestResultRepository,
} from "./repositoryService/ImportTestResultRepository";
import {
  ImportProjectRepository,
  ImportProjectRepositoryImpl,
} from "./repositoryService/ImportProjectRepository";
import { CompressedImageRepository } from "./repositoryService/CompressedImageRepository";
import {
  ProjectRepository,
  ProjectRepositoryImpl,
} from "./repositoryService/ProjectRepository";
import { SessionRepository } from "./repositoryService/SessionRepository";
import { SnapshotRepository } from "./repositoryService/SnapshotRepository";
import RESTClientImpl from "./RESTClient";
import { RepositoryServiceClient } from "./RepositoryServiceClient";

/**
 * A class that processes the acquisition of client-side information through the service.
 */
export default class RepositoryServiceDispatcher implements ProjectUpdatable {
  private _proxyUrl = "";
  private restClient: RepositoryServiceClient;

  private repositories: {
    testStep: TestStepRepository;
    note: NoteRepository;
    testResult: TestResultRepository;
    importTestResult: ImportTestResultRepository;
    importProject: ImportProjectRepository;
    testScript: TestScriptRepository;
    setting: SettingRepository;
    compressedImage: CompressedImageRepository;
    project: ProjectRepository;
    session: SessionRepository;
    snapshot: SnapshotRepository;
  };

  constructor(
    private config: {
      url: string;
      isRemote: boolean;
    }
  ) {
    const serviceUrl = this.config.url;
    this.restClient = new RepositoryServiceClient(
      new RESTClientImpl(),
      serviceUrl
    );
    this.repositories = {
      testStep: new TestStepRepositoryImpl(this.restClient),
      note: new NoteRepositoryImpl(this.restClient),
      testResult: new TestResultRepositoryImpl(this.restClient),
      importTestResult: new ImportTestResultRepositoryImpl(this.restClient),
      importProject: new ImportProjectRepositoryImpl(this.restClient),
      testScript: new TestScriptRepository(this.restClient),
      setting: new SettingRepository(this.restClient),
      compressedImage: new CompressedImageRepository(this.restClient),
      project: new ProjectRepositoryImpl(this.restClient),
      session: new SessionRepository(this.restClient),
      snapshot: new SnapshotRepository(this.restClient),
    };
  }

  /**
   * Service URL.
   */
  get serviceUrl(): string {
    return this.restClient.serviceUrl;
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

  public get testStepRepository(): TestStepRepository {
    return this.repositories.testStep;
  }

  public get noteRepository(): NoteRepository {
    return this.repositories.note;
  }

  public get testResultRepository(): TestResultRepository {
    return this.repositories.testResult;
  }

  public get importTestResultRepository(): ImportTestResultRepository {
    return this.repositories.importTestResult;
  }

  public get importProjectRepository(): ImportProjectRepository {
    return this.repositories.importProject;
  }

  public get testScriptRepository(): TestScriptRepository {
    return this.repositories.testScript;
  }

  public get settingRepository(): SettingRepository {
    return this.repositories.setting;
  }

  public get compressedImageRepository(): CompressedImageRepository {
    return this.repositories.compressedImage;
  }

  public get projectRepository(): ProjectRepository {
    return this.repositories.project;
  }

  public get sessionRepository(): SessionRepository {
    return this.repositories.session;
  }

  public get snapshotRepository(): SnapshotRepository {
    return this.repositories.snapshot;
  }
}
