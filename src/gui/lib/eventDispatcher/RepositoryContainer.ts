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

import {
  TestStepRepository,
  TestStepRepositoryImpl,
} from "./repositoryService/TestStepRepository";
import {
  NoteRepository,
  NoteRepositoryImpl,
} from "./repositoryService/NoteRepository";
import { TestResultRepository } from "./repositoryService/TestResultRepository";
import { TestScriptRepository } from "./repositoryService/TestScriptRepository";
import { SettingRepository } from "./repositoryService/SettingRepository";
import { ImportTestResultRepository } from "./repositoryService/ImportTestResultRepository";
import { ImportProjectRepository } from "./repositoryService/ImportProjectRepository";
import { CompressedImageRepository } from "./repositoryService/CompressedImageRepository";
import {
  ProjectRESTRepository,
  ProjectRepository,
} from "./repositoryService/ProjectRepository";
import { SessionRepository } from "./repositoryService/SessionRepository";
import { SnapshotRepository } from "./repositoryService/SnapshotRepository";
import RESTClientImpl from "./RESTClient";
import { RepositoryServiceClient } from "./RepositoryServiceClient";
import { ScreenshotRepository } from "./repositoryService/ScreenshotRepository";
import { TestMatrixRepository } from "./repositoryService/TestMatrixRepository";
import { TestTargetGroupRepository } from "./repositoryService/TestTargetGroupRepository";
import { TestTargetRepository } from "./repositoryService/TestTargetRepository";
import { ViewPointRepository } from "./repositoryService/ViewPointRepository";
import { StoryRepository } from "./repositoryService/StoryRepository";

export interface RepositoryContainer {
  readonly serviceUrl: string;
  readonly isRemote: boolean;
  proxyUrl: string;
  readonly testStepRepository: TestStepRepository;
  readonly noteRepository: NoteRepository;
  readonly testResultRepository: TestResultRepository;
  readonly importTestResultRepository: ImportTestResultRepository;
  readonly importProjectRepository: ImportProjectRepository;
  readonly testScriptRepository: TestScriptRepository;
  readonly settingRepository: SettingRepository;
  readonly compressedImageRepository: CompressedImageRepository;
  readonly projectRepository: ProjectRepository;
  readonly sessionRepository: SessionRepository;
  readonly snapshotRepository: SnapshotRepository;
  readonly screenshotRepository: ScreenshotRepository;
  readonly testMatrixRepository: TestMatrixRepository;
  readonly testTargetGroupRepository: TestTargetGroupRepository;
  readonly testTargetRepository: TestTargetRepository;
  readonly viewPointRepository: ViewPointRepository;
  readonly storyRepository: StoryRepository;
}

/**
 * A class that processes the acquisition of client-side information through the service.
 */
export class RepositoryContainerImpl implements RepositoryContainer {
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
    screenshot: ScreenshotRepository;
    testMatrix: TestMatrixRepository;
    testTargetGroup: TestTargetGroupRepository;
    testTarget: TestTargetRepository;
    viewPoint: ViewPointRepository;
    story: StoryRepository;
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
      testResult: new TestResultRepository(this.restClient),
      importTestResult: new ImportTestResultRepository(this.restClient),
      importProject: new ImportProjectRepository(this.restClient),
      testScript: new TestScriptRepository(this.restClient),
      setting: new SettingRepository(this.restClient),
      compressedImage: new CompressedImageRepository(this.restClient),
      project: new ProjectRESTRepository(this.restClient),
      session: new SessionRepository(this.restClient),
      snapshot: new SnapshotRepository(this.restClient),
      screenshot: new ScreenshotRepository(this.restClient),
      testMatrix: new TestMatrixRepository(this.restClient),
      testTargetGroup: new TestTargetGroupRepository(this.restClient),
      testTarget: new TestTargetRepository(this.restClient),
      viewPoint: new ViewPointRepository(this.restClient),
      story: new StoryRepository(this.restClient),
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

  public get screenshotRepository(): ScreenshotRepository {
    return this.repositories.screenshot;
  }

  public get testMatrixRepository(): TestMatrixRepository {
    return this.repositories.testMatrix;
  }

  public get testTargetGroupRepository(): TestTargetGroupRepository {
    return this.repositories.testTargetGroup;
  }

  public get testTargetRepository(): TestTargetRepository {
    return this.repositories.testTarget;
  }

  public get viewPointRepository(): ViewPointRepository {
    return this.repositories.viewPoint;
  }

  public get storyRepository(): StoryRepository {
    return this.repositories.story;
  }
}
