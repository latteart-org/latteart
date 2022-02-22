/**
 * Copyright 2021 NTT Corporation.
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
import { Reply } from "../captureControl/Reply";
import { CapturedOperation } from "../operationHistory/CapturedOperation";
import { Operation } from "../operationHistory/Operation";
import { OperationHistoryItem } from "../captureControl/OperationHistoryItem";
import { CoverageSource, InputElementInfo } from "../operationHistory/types";
import { Note } from "../operationHistory/Note";
import Settings from "@/lib/common/settings/Settings";
import DeviceSettings from "@/lib/common/settings/DeviceSettings";
import {
  ManagedSession,
  ManagedStory,
} from "../testManagement/TestManagementData";
import { TestResultResumable } from "../operationHistory/actions/ResumeAction";
import { ProjectUpdatable } from "../testManagement/actions/WriteDataFileAction";
import { IntentionMovable } from "../operationHistory/actions/MoveIntentionAction";
import { IntentionRecordable } from "../operationHistory/actions/RecordIntentionAction";
import { TestScript } from "../operationHistory/scriptGenerator/TestScript";
import { TestScriptExportable } from "../operationHistory/actions/GenerateTestScriptsAction";
import { ProjectFetchable } from "../testManagement/actions/ReadProjectDataAction";
import { Importable } from "../testManagement/actions/ImportAction";
import { Exportable } from "../testManagement/actions/ExportAction";
import { TestResultImportable } from "../operationHistory/actions/ImportAction";
import { TestResultExportable } from "../operationHistory/actions/ExportAction";
import { TestMatrix, ProgressData } from "../testManagement/types";
import { TestResultUploadable } from "../operationHistory/actions/UploadTestResultAction";
import { TestResultDeletable } from "../operationHistory/actions/DeleteTestResultAction";

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
    TestResultDeletable {
  constructor(
    private config: {
      url: string;
      isRemote: boolean;
    }
  ) {}

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
  private restClient: RESTClient = new RESTClient();

  /**
   * Get setting information.
   * @returns Setting information.
   */
  public async getSettings(): Promise<Reply<Settings>> {
    try {
      const data: Settings = await this.restClient.httpGet(
        this.buildAPIURL(`/projects/1/configs`)
      );

      return {
        succeeded: true,
        data,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
  }

  /**
   * Save the setting information.
   * @param settings  Setting information.
   * @returns Saved setting information.
   */
  public async saveSettings(settings: Settings): Promise<Reply<Settings>> {
    try {
      const data: Settings = await this.restClient.httpPut(
        this.buildAPIURL(`/projects/1/configs`),
        settings
      );

      return {
        succeeded: true,
        data,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
  }

  /**
   * Change locale.
   * @param locale  Locale value after change.
   */
  public async changeLocale(locale: string): Promise<Reply<void>> {
    try {
      const settings: Settings = await this.restClient.httpGet(
        this.buildAPIURL(`/projects/1/configs`)
      );

      settings.locale = locale as any;

      await this.restClient.httpPut(
        this.buildAPIURL(`/projects/1/configs`),
        settings
      );

      return {
        succeeded: true,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
  }

  /**
   * Get device settings information.
   * @returns Device settings information
   */
  public async getDeviceSettings(): Promise<Reply<DeviceSettings>> {
    try {
      const data: DeviceSettings = await this.restClient.httpGet(
        this.buildAPIURL(`/projects/1/device-configs`)
      );

      return {
        succeeded: true,
        data,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
  }

  /**
   * Save device settings information.
   * @param deviceSettings  Device settings information.
   * @returns  Saved device settings information.
   */
  public async saveDeviceSettings(
    deviceSettings: DeviceSettings
  ): Promise<Reply<DeviceSettings>> {
    try {
      const data: DeviceSettings = await this.restClient.httpPut(
        this.buildAPIURL(`/projects/1/device-configs`),
        deviceSettings
      );

      return {
        succeeded: true,
        data,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
  }

  /**
   * Get a list of test results.
   * @returns List of test results.
   */
  public async getTestResults(): Promise<
    Reply<
      Array<{
        id: string;
        name: string;
      }>
    >
  > {
    try {
      const data: Array<{
        id: string;
        name: string;
      }> = await this.restClient.httpGet(this.buildAPIURL(`/test-results`));

      return {
        succeeded: true,
        data,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
  }

  public async getImportTestResults(): Promise<
    Reply<
      Array<{
        url: string;
        name: string;
      }>
    >
  > {
    try {
      const data: Array<{
        url: string;
        name: string;
      }> = await this.restClient.httpGet(
        this.buildAPIURL(`/imports/test-results`)
      );

      return {
        succeeded: true,
        data: data.map(({ url, name }) => {
          return {
            url: `${this.serviceUrl}/${url}`,
            name,
          };
        }),
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
  }

  public async getImportProjects(): Promise<
    Reply<
      Array<{
        id: string;
        name: string;
      }>
    >
  > {
    try {
      const data: Array<{
        id: string;
        name: string;
      }> = await this.restClient.httpGet(this.buildAPIURL(`/imports/projects`));

      return {
        succeeded: true,
        data,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
  }

  /**
   * Create an empty test result.
   * @param name  Test result name.
   * @returns  Created test result information.
   */
  public async createEmptyTestResult(
    initialUrl?: string,
    name?: string
  ): Promise<Reply<{ id: string; name: string }>> {
    try {
      const url = this.buildAPIURL(`/test-results`);
      const res = await this.restClient.httpPost(url, { initialUrl, name });

      const createdTestResult: { id: string; name: string } = res;

      return {
        succeeded: true,
        data: createdTestResult,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
  }

  /**
   * Compress screenshot of note.
   * @param testResultId  Test result id.
   * @param noteId  Note id.
   * @returns File path after compression.
   */
  public async compressNoteImage(
    testResultId: string,
    noteId: number
  ): Promise<Reply<{ imageFileUrl: string }>> {
    try {
      const { imageFileUrl } = await this.restClient.httpPost(
        this.buildAPIURL(
          `/test-results/${testResultId}/notes/${noteId}/compressed-image`
        ),
        null
      );

      return {
        succeeded: true,
        data: { imageFileUrl },
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "error.operation_history.compress_note_screenshot_failed",
          message: "Compression error.",
        },
      };
    }
  }

  /**
   * Compress screenshot of test step.
   * @param testResultId  Test result id.
   * @param testStepId  Test step id of the target test step.
   * @returns File path after compression.
   */
  public async compressTestStepImage(
    testResultId: string,
    testStepId: string
  ): Promise<Reply<{ imageFileUrl: string }>> {
    try {
      const { imageFileUrl } = await this.restClient.httpPost(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${testStepId}/compressed-image`
        ),
        null
      );

      if (!imageFileUrl) {
        throw new Error();
      }
      return {
        succeeded: true,
        data: { imageFileUrl },
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "error.operation_history.compress_operation_screenshot_failed",
          message: "Compression error.",
        },
      };
    }
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
    try {
      const {
        id,
        operation,
        coverageSource,
        inputElementInfo,
      } = await this.restClient.httpPost(
        this.buildAPIURL(`/test-results/${testResultId}/test-steps`),
        capturedOperation
      );
      return {
        succeeded: true,
        data: {
          id,
          operation: Operation.createFromOtherOperation({
            other: operation,
            overrideParams: {
              imageFilePath: operation.imageFileUrl
                ? new URL(operation.imageFileUrl, this.serviceUrl).toString()
                : operation.imageFileUrl,
              keywordSet: new Set(operation.keywordTexts),
            },
          }),
          coverageSource,
          inputElementInfo,
        },
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
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
    try {
      // New registration of note.
      const savedNote: {
        id: number;
        type: string;
        value: string;
        details: string;
        imageFileUrl?: string;
        tags?: string[];
      } = await this.restClient.httpPost(
        this.buildAPIURL(`/test-results/${testResultId}/notes`),
        {
          type: "bug",
          value: bug.summary,
          details: bug.details,
          imageData: bug.imageData,
        }
      );

      // Linking with testStep.
      const savedTestStep: {
        bugs: string[];
      } = await (async () => {
        const { bugs } = await this.restClient.httpGet(
          this.buildAPIURL(
            `/test-results/${testResultId}/test-steps/${testStepId}`
          )
        );

        return this.restClient.httpPatch(
          this.buildAPIURL(
            `/test-results/${testResultId}/test-steps/${testStepId}`
          ),
          {
            bugs: [...bugs, savedNote.id],
          }
        );
      })();

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

      return {
        succeeded: true,
        data,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
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
    try {
      const { bugs } = await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${testStepId}`
        )
      );
      const noteId: string = bugs[index];

      // note update
      const savedNote: {
        id: string;
        type: string;
        value: string;
        details: string;
        imageFileUrl?: string;
        tags?: string[];
      } = await this.restClient.httpPut(
        this.buildAPIURL(`/test-results/${testResultId}/notes/${noteId}`),
        {
          type: "bug",
          value: bug.summary,
          details: bug.details,
        }
      );

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

      return {
        succeeded: true,
        data,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
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
    try {
      // Break the link of the move source.
      const { bugs: fromBugs } = await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${from.testStepId}`
        )
      );
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
      const { bugs: destBugs } = await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${dest.testStepId}`
        )
      );
      await this.restClient.httpPatch(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${dest.testStepId}`
        ),
        {
          bugs: [...destBugs, fromBugs[from.index]],
        }
      );

      const note: {
        id: string;
        type: string;
        value: string;
        details: string;
        imageFileUrl?: string;
        tags?: string[];
      } = await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/notes/${fromBugs[from.index]}`
        )
      );

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

      return {
        succeeded: true,
        data,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
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
    try {
      // Get noteId.
      const { bugs } = await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${testStepId}`
        )
      );
      const noteId = bugs[index];

      // Delete note.
      await this.restClient.httpDelete(
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

      return {
        succeeded: true,
        data: {
          testStepId,
          index,
        },
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
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
    try {
      // New registration of note.
      const savedNote: {
        id: number;
        type: string;
        value: string;
        details: string;
        imageFileUrl?: string;
        tags?: string[];
      } = await this.restClient.httpPost(
        this.buildAPIURL(`/test-results/${testResultId}/notes`),
        {
          type: "notice",
          value: notice.summary,
          details: notice.details,
          tags: notice.tags,
          imageData: notice.imageData,
        }
      );

      // Linking with testStep.
      const savedTestStep: {
        notices: string[];
      } = await (async () => {
        const { notices } = await this.restClient.httpGet(
          this.buildAPIURL(
            `/test-results/${testResultId}/test-steps/${testStepId}`
          )
        );

        return this.restClient.httpPatch(
          this.buildAPIURL(
            `/test-results/${testResultId}/test-steps/${testStepId}`
          ),
          {
            notices: [...notices, savedNote.id],
          }
        );
      })();

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

      return {
        succeeded: true,
        data,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
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
    try {
      const { notices } = await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${testStepId}`
        )
      );
      const noteId: string = notices[index];

      // Note update
      const savedNote: {
        id: string;
        type: string;
        value: string;
        details: string;
        imageFileUrl?: string;
        tags?: string[];
      } = await this.restClient.httpPut(
        this.buildAPIURL(`/test-results/${testResultId}/notes/${noteId}`),
        {
          type: "notice",
          value: notice.summary,
          details: notice.details,
          tags: notice.tags,
        }
      );

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

      return {
        succeeded: true,
        data,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
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
    try {
      // Break the link of the move source.
      const { notices: fromNotices } = await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${from.testStepId}`
        )
      );
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
      const { notices: destNotices } = await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${dest.testStepId}`
        )
      );
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

      const note: {
        id: string;
        type: string;
        value: string;
        details: string;
        imageFileUrl?: string;
        tags?: string[];
      } = await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/notes/${fromNotices[from.index]}`
        )
      );

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

      return {
        succeeded: true,
        data,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
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
    try {
      // Get noteId.
      const { notices } = await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${testStepId}`
        )
      );
      const noteId = notices[index];

      // Delete note.
      await this.restClient.httpDelete(
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

      return {
        succeeded: true,
        data: {
          testStepId,
          index,
        },
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
  }

  /**
   * Add intention information to the test step with the specified sequence number.
   * @param testResultId  Test result ID
   * @param testStepId  Test step id of the target test step.
   * @param intention  Intention information to add
   */
  public async addIntention(
    testResultId: string,
    testStepId: string,
    intention: {
      summary: string;
      details: string;
    }
  ): Promise<Reply<Note>> {
    try {
      // New note registration
      const savedNote: {
        id: string;
        type: string;
        value: string;
        details: string;
        imageFileUrl?: string;
        tags?: string[];
      } = await this.restClient.httpPost(
        this.buildAPIURL(`/test-results/${testResultId}/notes`),
        {
          type: "intention",
          value: intention.summary,
          details: intention.details,
        }
      );

      // Linking with test steps.
      await (async () => {
        return this.restClient.httpPatch(
          this.buildAPIURL(
            `/test-results/${testResultId}/test-steps/${testStepId}`
          ),
          {
            intention: savedNote.id,
          }
        );
      })();

      return {
        succeeded: true,
        data: new Note({
          value: savedNote.value,
          details: savedNote.details,
          imageFilePath: savedNote.imageFileUrl
            ? new URL(savedNote.imageFileUrl, this.serviceUrl).toString()
            : "",
          tags: savedNote.tags,
        }),
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
  }

  /**
   * Edit the intention information of the specified sequence number.
   * @param testResultId  Test result ID.
   * @param testStepId  Test step id of the target test step.
   * @param intention  Intention information to edit.
   * @returns Edited intention information.
   */
  public async editIntention(
    testResultId: string,
    testStepId: string,
    intention: {
      summary: string;
      details: string;
    }
  ): Promise<Reply<Note>> {
    try {
      // Get noteId.
      const { intention: noteId } = await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${testStepId}`
        )
      );

      // Note update.
      const savedNote: {
        id: string;
        type: string;
        value: string;
        details: string;
        imageFileUrl?: string;
        tags?: string[];
      } = await this.restClient.httpPut(
        this.buildAPIURL(`/test-results/${testResultId}/notes/${noteId}`),
        {
          type: "intention",
          value: intention.summary,
          details: intention.details,
        }
      );

      const data = new Note({
        value: savedNote.value,
        details: savedNote.details,
        imageFilePath: savedNote.imageFileUrl
          ? new URL(savedNote.imageFileUrl, this.serviceUrl).toString()
          : "",
        tags: savedNote.tags,
      });

      return {
        succeeded: true,
        data,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
  }

  /**
   * Change the associated sequence number of the Intention information of the specified sequence number.
   * @param testResultId  Test result ID.
   * @param fromTestStepId  Linking source sequence number.
   * @param destTestStepId  Linked sequence number
   * @returns Intention information after change.
   */
  public async moveIntention(
    testResultId: string,
    fromTestStepId: string,
    destTestStepId: string
  ): Promise<Reply<Note>> {
    try {
      const { intention: noteId } = await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${fromTestStepId}`
        )
      );

      // Break the link of the move source.
      await this.restClient.httpPatch(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${fromTestStepId}`
        ),
        {
          intention: null,
        }
      );

      // Link to the destination.
      await this.restClient.httpPatch(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${destTestStepId}`
        ),
        {
          intention: noteId,
        }
      );
      const note: {
        id: string;
        type: string;
        value: string;
        details: string;
        imageFileUrl?: string;
        tags?: string[];
      } = await this.restClient.httpGet(
        this.buildAPIURL(`/test-results/${testResultId}/notes/${noteId}`)
      );

      const data = new Note({
        value: note.value,
        details: note.details,
        imageFilePath: note.imageFileUrl
          ? new URL(note.imageFileUrl, this.serviceUrl).toString()
          : "",
        tags: note.tags,
      });

      return {
        succeeded: true,
        data,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
  }

  /**
   * Delete the intention information of the specified sequence number.
   * @param testResultId  Test result ID.
   * @param testStepId  Test step id of the target test step.
   */
  public async deleteIntention(
    testResultId: string,
    testStepId: string
  ): Promise<Reply<string>> {
    try {
      // Get noteId.
      const { intention } = await this.restClient.httpGet(
        this.buildAPIURL(
          `/test-results/${testResultId}/test-steps/${testStepId}`
        )
      );

      // Delete note.
      await this.restClient.httpDelete(
        this.buildAPIURL(`/test-results/${testResultId}/notes/${intention}`)
      );

      // Break the link.
      await (async () => {
        return this.restClient.httpPatch(
          this.buildAPIURL(
            `/test-results/${testResultId}/test-steps/${testStepId}`
          ),
          {
            intention: null,
          }
        );
      })();

      return {
        succeeded: true,
        data: testStepId,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
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
    try {
      const testResult: {
        id: string;
        name: string;
        testSteps: any[];
        coverageSources: CoverageSource[];
        inputElementInfos: InputElementInfo[];
        initialUrl: string;
      } = await this.restClient.httpGet(
        this.buildAPIURL(`/test-results/${testResultId}`)
      );

      return {
        succeeded: true,
        data: {
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
                        ? new URL(
                            notice.imageFileUrl,
                            this.serviceUrl
                          ).toString()
                        : "",
                    },
                  });
                }) ?? null,
            };
          }),
          coverageSources: testResult.coverageSources,
          inputElementInfos: testResult.inputElementInfos,
          initialUrl: testResult.initialUrl,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        succeeded: false,
        error: {
          code: "resume_failed",
          message: "Repository service is not found.",
        },
      };
    }
  }

  /**
   * Import project or testresult or all.
   * @param importFileName  Import file name.
   * @param selectOption  Select options.
   */
  public async importZipFile(
    importFileName: string,
    selectOption: { includeProject: boolean; includeTestResults: boolean }
  ): Promise<Reply<{ name: string; id: string }>> {
    let response;
    try {
      response = await this.restClient.httpPost(
        this.buildAPIURL(`/imports/projects/${importFileName}`),
        selectOption
      );

      if (!response.name) {
        return {
          succeeded: false,
          error: {
            code: response.code,
            message: response.code,
          },
        };
      }

      return {
        succeeded: true,
        data: response,
      };
    } catch (error) {
      console.error(error);
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
  }

  /**
   * Import test result.
   * @param source.importFileUrl Source import file url.
   * @param dest.testResultId Destination local test result id.
   * @param dest.shouldSaveTemporary Whether to save temporary.
   */
  public async importTestResult(
    source: { testResultFileUrl: string },
    dest?: { testResultId?: string }
  ): Promise<Reply<{ testResultId: string }>> {
    try {
      const body = {
        source,
        dest,
      };

      const response = await this.restClient.httpPost(
        this.buildAPIURL(`/imports/test-results`),
        body
      );

      if (!response) {
        return {
          succeeded: false,
          error: {
            code: response.code,
            message: response.code,
          },
        };
      }

      return {
        succeeded: true,
        data: response,
      };
    } catch (error) {
      console.error(error);
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
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
    let response;
    try {
      response = await this.restClient.httpPost(
        this.buildAPIURL(`/projects/${projectId}/export`),
        selectOption
      );
    } catch (e) {
      return {
        succeeded: false,
        error: {
          code: "code",
          message: "message",
        },
      };
    }
    return {
      succeeded: true,
      data: response,
    };
  }

  /**
   * Creates export data with the specified test results.
   * @param testResultId  Test result ID.
   * @param shouldSaveTemporary Whether to save temporary.
   * @returns Test script URL.
   */
  public async exportTestResult(
    testResultId: string,
    shouldSaveTemporary: boolean
  ): Promise<Reply<{ url: string }>> {
    let response;
    try {
      response = await this.restClient.httpPost(
        this.buildAPIURL(`/test-results/${testResultId}/export`),
        { temp: shouldSaveTemporary }
      );
    } catch (e) {
      return {
        succeeded: false,
        error: {
          code: "code",
          message: "message",
        },
      };
    }
    return {
      succeeded: true,
      data: response,
    };
  }

  /**
   * Get a list of test results.
   * @returns List of test results
   */
  public async getTestResultList(): Promise<
    Reply<Array<{ name: string; id: string }>>
  > {
    let response;
    try {
      response = await this.restClient.httpGet(
        this.buildAPIURL(`/test-results`)
      );
    } catch (e) {
      return {
        succeeded: false,
        error: {
          code: "code",
          message: "error",
        },
      };
    }
    return {
      succeeded: true,
      data: response,
    };
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
    let response;

    try {
      response = await this.restClient.httpGet(
        this.buildAPIURL(`/test-results/${testResultId}`)
      );
    } catch (e) {
      return {
        succeeded: false,
        error: {
          code: "code",
          message: "error",
        },
      };
    }
    return {
      succeeded: true,
      data: response,
    };
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
    let response;
    try {
      const projects: Array<{
        id: string;
        name: string;
      }> = await this.restClient.httpGet(this.buildAPIURL(`/projects`));

      const targetProjectId =
        projects.length === 0
          ? (
              await this.restClient.httpPost(this.buildAPIURL(`/projects`), {
                name: "",
              })
            ).id
          : projects[projects.length - 1].id;

      response = await this.restClient.httpGet(
        this.buildAPIURL(`/projects/${targetProjectId}`)
      );

      return {
        succeeded: true,
        data: {
          ...response,
          projectId: targetProjectId,
        },
      };
    } catch (e) {
      return {
        succeeded: false,
        error: {
          code: "code",
          message: "error",
        },
      };
    }
  }

  /**
   * Update the project with the specified project ID.
   * @param projectId  Project ID.
   * @param body  Project information to update.
   * @returns Updated project information.
   */
  public async putProject(projectId: string, body: any): Promise<Reply<any>> {
    let response;
    try {
      response = await this.restClient.httpPut(
        this.buildAPIURL(`/projects/${projectId}`),
        body
      );
    } catch (e) {
      return {
        succeeded: false,
        error: {
          code: "code",
          message: "error",
        },
      };
    }
    return {
      succeeded: true,
      data: response,
    };
  }

  public async updateSession(
    projectId: string,
    sessionId: string,
    body: Partial<ManagedSession>
  ): Promise<Reply<ManagedSession>> {
    let response;
    try {
      response = await this.restClient.httpPatch(
        this.buildAPIURL(`/projects/${projectId}/sessions/${sessionId}`),
        body
      );
    } catch (e) {
      return {
        succeeded: false,
        error: {
          code: "code",
          message: "error",
        },
      };
    }
    return {
      succeeded: true,
      data: response,
    };
  }

  /**
   * Create a snapshot of the specified project ID.
   * @param projectId  Project ID.
   * @returns URL of the snapshot.
   */
  public async postSnapshots(projectId: string): Promise<Reply<any>> {
    let response;
    try {
      response = await this.restClient.httpPost(
        this.buildAPIURL(`/projects/${projectId}/snapshots`),
        null
      );
    } catch (e) {
      return {
        succeeded: false,
        error: {
          code: "code",
          message: "message",
        },
      };
    }
    return {
      succeeded: true,
      data: response,
    };
  }

  /**
   * Create a test script with the specified project ID.
   * @param projectId  Project ID.
   * @param body.pageObjects  Page Objects.
   * @params body.testSuite  TestSuite.
   * @returns Test script URL.
   */
  public async postTestscriptsWithProjectId(
    projectId: string,
    body: TestScript
  ): Promise<Reply<{ url: string }>> {
    let response;
    try {
      response = await this.restClient.httpPost(
        this.buildAPIURL(`/projects/${projectId}/test-scripts`),
        body
      );
    } catch (e) {
      return {
        succeeded: false,
        error: {
          code: "code",
          message: "message",
        },
      };
    }
    return {
      succeeded: true,
      data: response,
    };
  }

  /**
   * Create a test script with the specified test results.
   * @param testResultId  Test result ID.
   * @param body.pageObjects  Page objects.
   * @param body.testSuite  Test suite.
   * @returns Test script URL.
   */
  public async postTestscriptsWithTestResultId(
    testResultId: string,
    body: TestScript
  ): Promise<Reply<{ url: string }>> {
    let response;
    try {
      response = await this.restClient.httpPost(
        this.buildAPIURL(`/test-results/${testResultId}/test-scripts`),
        body
      );
    } catch (e) {
      return {
        succeeded: false,
        error: {
          code: "code",
          message: "message",
        },
      };
    }
    return {
      succeeded: true,
      data: response,
    };
  }

  public async changeTestResultName(
    testResultId: string,
    name: string
  ): Promise<Reply<string>> {
    try {
      const data = await this.restClient.httpPatch(
        this.buildAPIURL(`/test-results/${testResultId}`),
        { name }
      );

      return {
        succeeded: true,
        data: data.name,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "repository_service_not_found",
          message: "Repository service is not found.",
        },
      };
    }
  }

  /**
   * Upload test result.
   * @param source.testResultId Source test result ID.
   * @param dest.repositoryUrl Destination repository url.
   * @param dest.testResultId Destination test result ID.
   */
  public async uploadTestResult(
    source: { testResultId: string },
    dest: { repositoryUrl: string; testResultId?: string }
  ): Promise<Reply<{ id: string }>> {
    try {
      const response = await this.restClient.httpPost(
        this.buildAPIURL(`/upload-request/test-result`),
        { source, dest }
      );

      return {
        succeeded: true,
        data: response,
      };
    } catch (e) {
      return {
        succeeded: false,
        error: {
          code: "code",
          message: "message",
        },
      };
    }
  }

  /**
   * Delete local test result.
   * @param testResultId  Test result id.
   */
  public async deleteTestResult(testResultId: string): Promise<Reply<void>> {
    try {
      await this.restClient.httpDelete(
        this.buildAPIURL(`/test-results/${testResultId}`)
      );
    } catch (e) {
      return {
        succeeded: false,
        error: {
          code: "code",
          message: "message",
        },
      };
    }
    return {
      succeeded: true,
    };
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
