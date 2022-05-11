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
import { CapturedOperation } from "../operationHistory/CapturedOperation";
import { Operation } from "../operationHistory/Operation";
import { OperationHistoryItem } from "../captureControl/OperationHistoryItem";
import {
  CoverageSource,
  InputElementInfo,
  TestStepOperation,
  TestResult,
} from "../operationHistory/types";
import { Note } from "../operationHistory/Note";
import {
  ManagedSession,
  ManagedStory,
} from "../testManagement/TestManagementData";
import { TestResultResumable } from "../operationHistory/actions/ResumeAction";
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
    TestResultResumable,
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
   * Register the operation information in the repository.
   * @param testResultId  Test result ID.
   * @param capturedOperation  Operation information to register.
   * @returns Saved operation information.
   */
  public async registerOperation(
    testResultId: string,
    capturedOperation: CapturedOperation
  ): Promise<
    Reply<{
      id: string;
      operation: Operation;
      coverageSource: CoverageSource;
      inputElementInfo: InputElementInfo;
    }>
  > {
    const response = await this.restClient.httpPost(
      this.buildAPIURL(`/test-results/${testResultId}/test-steps`),
      capturedOperation
    );

    const {
      id,
      operation: testStepOperation,
      coverageSource,
      inputElementInfo,
    } = response.data as {
      id: string;
      operation: TestStepOperation;
      coverageSource: CoverageSource;
      inputElementInfo?: InputElementInfo;
    };

    const operation = Operation.createOperation({
      input: testStepOperation.input,
      type: testStepOperation.type,
      elementInfo: testStepOperation.elementInfo,
      title: testStepOperation.title,
      url: testStepOperation.url,
      imageFilePath: testStepOperation.imageFileUrl
        ? new URL(testStepOperation.imageFileUrl, this.serviceUrl).toString()
        : testStepOperation.imageFileUrl,
      windowHandle: testStepOperation.windowHandle,
      timestamp: testStepOperation.timestamp,
      inputElements: testStepOperation.inputElements,
      keywordSet: new Set(testStepOperation.keywordTexts),
    });

    const data = {
      id,
      operation,
      coverageSource,
      inputElementInfo,
    };

    return new ReplyImpl({
      status: response.status,
      data: data as {
        id: string;
        operation: Operation;
        coverageSource: CoverageSource;
        inputElementInfo: InputElementInfo;
      },
    });
  }

  /**
   * Add bug information to the test step with the specified sequence number.
   * @param testResultId  Test result ID.
   * @param testStepId  Test step id of the target test step.
   * @param bug  Bug information to add.
   * @returns Added bug information.
   */
  public async addBug(
    testResultId: string,
    testStepId: string,
    bug: {
      summary: string;
      details: string;
      imageData?: string;
    }
  ): Promise<Reply<{ bug: Note; index: number }>> {
    // New registration of note.
    const response = await this.restClient.httpPost(
      this.buildAPIURL(`/test-results/${testResultId}/notes`),
      {
        type: "bug",
        value: bug.summary,
        details: bug.details,
        imageData: bug.imageData,
      }
    );
    const savedNote = response.data as {
      id: number;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    };

    // Linking with testStep.
    const linkTestStep = await (async () => {
      const { bugs } = (
        await this.restClient.httpGet(
          this.buildAPIURL(
            `/test-results/${testResultId}/test-steps/${testStepId}`
          )
        )
      ).data as {
        id: string;
        operation: TestStepOperation;
        intention: string | null;
        bugs: string[];
        notices: string[];
      };

      return this.restClient.httpPatch(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${testStepId}`
        ),
        {
          bugs: [...bugs, savedNote.id],
        }
      );
    })();

    const savedTestStep = linkTestStep.data as {
      bugs: string[];
    };

    const data = {
      bug: new Note({
        id: savedNote.id,
        value: savedNote.value,
        details: savedNote.details,
        imageFilePath: savedNote.imageFileUrl
          ? new URL(savedNote.imageFileUrl, this.serviceUrl).toString()
          : "",
        tags: savedNote.tags,
      }),
      index: savedTestStep.bugs.length - 1,
    };

    return new ReplyImpl({ status: response.status, data: data });
  }

  /**
   * Edit the bug.
   * @param testResultId  ID of the test result associated with the bug to be edited.
   * @param testStepId  Test step id of the test result associated with the target bug.
   * @param index  bug index.
   * @param bug  Contents to update the bug.
   * @returns Updated bug information.
   */
  public async editBug(
    testResultId: string,
    testStepId: string,
    index: number,
    bug: {
      summary: string;
      details: string;
    }
  ): Promise<Reply<{ bug: Note; index: number }>> {
    const { bugs } = (
      await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${testStepId}`
        )
      )
    ).data as {
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    };
    const noteId: string = bugs[index];

    // note update
    const response = await this.restClient.httpPut(
      this.buildAPIURL(`/test-results/${testResultId}/notes/${noteId}`),
      {
        type: "bug",
        value: bug.summary,
        details: bug.details,
      }
    );

    const savedNote = response.data as {
      id: string;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    };

    const data = {
      bug: new Note({
        value: savedNote.value,
        details: savedNote.details,
        imageFilePath: savedNote.imageFileUrl
          ? new URL(savedNote.imageFileUrl, this.serviceUrl).toString()
          : "",
        tags: savedNote.tags,
      }),
      index,
    };

    return new ReplyImpl({ status: response.status, data: data });
  }

  /**
   * Update the position where the bug is associated.
   * @param testResultId  ID of the test result associated with the bug.
   * @param from  Location of test results related to the bug.
   * @param dest  The position of the test result where you want to link the bug.
   * @returns Updated bug information.
   */
  public async moveBug(
    testResultId: string,
    from: {
      testStepId: string;
      index: number;
    },
    dest: {
      testStepId: string;
    }
  ): Promise<Reply<{ bug: Note; index: number }>> {
    // Break the link of the move source.
    const { bugs: fromBugs } = (
      await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${from.testStepId}`
        )
      )
    ).data as {
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    };

    await (async () => {
      return this.restClient.httpPatch(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${from.testStepId}`
        ),
        {
          bugs: fromBugs.filter(
            (_: unknown, index: number) => index !== from.index
          ),
        }
      );
    })();

    // Link to the destination.
    const { bugs: destBugs } = (
      await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${dest.testStepId}`
        )
      )
    ).data as {
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    };

    await this.restClient.httpPatch(
      this.buildAPIURL(
        `/test-results/${testResultId}/test-steps/${dest.testStepId}`
      ),
      {
        bugs: [...destBugs, fromBugs[from.index]],
      }
    );

    const response = await this.restClient.httpGet(
      this.buildAPIURL(
        `/test-results/${testResultId}/notes/${fromBugs[from.index]}`
      )
    );

    const note = response.data as {
      id: string;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    };

    const data = {
      bug: new Note({
        value: note.value,
        details: note.details,
        imageFilePath: note.imageFileUrl
          ? new URL(note.imageFileUrl, this.serviceUrl).toString()
          : "",
        tags: note.tags,
      }),
      index: destBugs.length,
    };

    return new ReplyImpl({ status: response.status, data: data });
  }

  /**
   * Remove the bug.
   * @param testResultId  The id of the test result associated with the bug to be deleted.
   * @param testStepId  Test step id of test results related to the target bug.
   * @param index  Bug index.
   */
  public async deleteBug(
    testResultId: string,
    testStepId: string,
    index: number
  ): Promise<
    Reply<{
      testStepId: string;
      index: number;
    }>
  > {
    // Get noteId.
    const { bugs } = (
      await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${testStepId}`
        )
      )
    ).data as {
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    };
    const noteId = bugs[index];

    // Delete note.
    const response = await this.restClient.httpDelete(
      this.buildAPIURL(`/test-results/${testResultId}/notes/${noteId}`)
    );

    // Break the link.
    await this.restClient.httpPatch(
      this.buildAPIURL(
        `/test-results/${testResultId}/test-steps/${testStepId}`
      ),
      {
        bugs: bugs.filter((_: unknown, i: number) => i !== index),
      }
    );

    return new ReplyImpl({
      status: response.status,
      data: {
        testStepId,
        index,
      },
    });
  }

  /**
   * Notice the test step with the specified sequence number and add information.
   * @param testResultId  Test result ID.
   * @param testStepId  Test step id of the target test step.
   * @param notice  Notice information to add.
   */
  public async addNotice(
    testResultId: string,
    testStepId: string,
    notice: {
      summary: string;
      details: string;
      tags: string[];
      imageData?: string;
    }
  ): Promise<Reply<{ notice: Note; index: number }>> {
    // New registration of note.
    const response = await this.restClient.httpPost(
      this.buildAPIURL(`/test-results/${testResultId}/notes`),
      {
        type: "notice",
        value: notice.summary,
        details: notice.details,
        tags: notice.tags,
        imageData: notice.imageData,
      }
    );
    const savedNote = response.data as {
      id: number;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    };

    // Linking with testStep.
    const linkTestStep = await (async () => {
      const { notices } = (
        await this.restClient.httpGet(
          this.buildAPIURL(
            `/test-results/${testResultId}/test-steps/${testStepId}`
          )
        )
      ).data as {
        id: string;
        operation: TestStepOperation;
        intention: string | null;
        bugs: string[];
        notices: string[];
      };

      return this.restClient.httpPatch(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${testStepId}`
        ),
        {
          notices: [...notices, savedNote.id],
        }
      );
    })();

    const savedTestStep = linkTestStep.data as {
      notices: string[];
    };

    const data = {
      notice: new Note({
        id: savedNote.id,
        value: savedNote.value,
        details: savedNote.details,
        imageFilePath: savedNote.imageFileUrl
          ? new URL(savedNote.imageFileUrl, this.serviceUrl).toString()
          : "",
        tags: savedNote.tags,
      }),
      index: savedTestStep.notices.length - 1,
    };

    return new ReplyImpl({ status: response.status, data: data });
  }

  /**
   * Edit Notice.
   * @param testResultId  ID of the test result associated with the notice to be edited.
   * @param testStepId  Test step id of the test result associated with the target Notice.
   * @param index  Notice index
   * @param notice  Update contents of notice.
   * @returns Updated notice information.
   */
  public async editNotice(
    testResultId: string,
    testStepId: string,
    index: number,
    notice: {
      summary: string;
      details: string;
      tags: string[];
    }
  ): Promise<Reply<{ notice: Note; index: number }>> {
    const { notices } = (
      await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${testStepId}`
        )
      )
    ).data as {
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    };
    const noteId: string = notices[index];

    // Note update
    const response = await this.restClient.httpPut(
      this.buildAPIURL(`/test-results/${testResultId}/notes/${noteId}`),
      {
        type: "notice",
        value: notice.summary,
        details: notice.details,
        tags: notice.tags,
      }
    );
    const savedNote = response.data as {
      id: string;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    };

    const data = {
      notice: new Note({
        value: savedNote.value,
        details: savedNote.details,
        imageFilePath: savedNote.imageFileUrl
          ? new URL(savedNote.imageFileUrl, this.serviceUrl).toString()
          : "",
        tags: savedNote.tags,
      }),
      index,
    };

    return new ReplyImpl({ status: response.status, data: data });
  }

  /**
   * Update the position associated with the Notice.
   * @param testResultId  ID of the test result associated with the Notice.
   * @param from  Position of test result associated with Notice.
   * @param dest  Position of the test result to which you want to link the Notice.
   * @returns Updated notice information.
   */
  public async moveNotice(
    testResultId: string,
    from: {
      testStepId: string;
      index: number;
    },
    dest: {
      testStepId: string;
    }
  ): Promise<Reply<{ notice: Note; index: number }>> {
    // Break the link of the move source.
    const { notices: fromNotices } = (
      await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${from.testStepId}`
        )
      )
    ).data as {
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    };

    await (async () => {
      return this.restClient.httpPatch(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${from.testStepId}`
        ),
        {
          notices: fromNotices.filter(
            (_: unknown, index: number) => index !== from.index
          ),
        }
      );
    })();

    // Link to the destination.
    const { notices: destNotices } = (
      await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${dest.testStepId}`
        )
      )
    ).data as {
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    };

    await (async () => {
      return this.restClient.httpPatch(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${dest.testStepId}`
        ),
        {
          notices: [...destNotices, fromNotices[from.index]],
        }
      );
    })();

    const response = await this.restClient.httpGet(
      this.buildAPIURL(
        `/test-results/${testResultId}/notes/${fromNotices[from.index]}`
      )
    );

    const note = response.data as {
      id: string;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    };

    const data = {
      notice: new Note({
        value: note.value,
        details: note.details,
        imageFilePath: note.imageFileUrl
          ? new URL(note.imageFileUrl, this.serviceUrl).toString()
          : "",
        tags: note.tags,
      }),
      index: destNotices.length,
    };

    return new ReplyImpl({ status: response.status, data: data });
  }

  /**
   * Delete Notice.
   * @param testResultId  The id of the test result associated with the Notice to be deleted.
   * @param testStepId  Test step id of the test result associated with the target Notice.
   * @param index  Notice index.
   */
  public async deleteNotice(
    testResultId: string,
    testStepId: string,
    index: number
  ): Promise<
    Reply<{
      testStepId: string;
      index: number;
    }>
  > {
    // Get noteId.
    const { notices } = (
      await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${testStepId}`
        )
      )
    ).data as {
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    };
    const noteId = notices[index];

    // Delete note.
    const response = await this.restClient.httpDelete(
      this.buildAPIURL(`/test-results/${testResultId}/notes/${noteId}`)
    );

    // Break the link.
    await this.restClient.httpPatch(
      this.buildAPIURL(
        `/test-results/${testResultId}/test-steps/${testStepId}`
      ),
      {
        notices: notices.filter((_: unknown, i: number) => i !== index),
      }
    );

    return new ReplyImpl({
      status: response.status,
      data: {
        testStepId,
        index,
      },
    });
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
