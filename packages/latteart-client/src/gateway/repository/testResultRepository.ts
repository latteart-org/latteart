/**
 * Copyright 2023 NTT Corporation.
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
import {
  TestResultSummaryForRepository,
  TestResultForRepository,
  TestResultViewOptionForRepository,
  SequenceViewForRepository,
  GraphViewForRepository,
  OperationForRepository,
  NoteForRepository,
} from "./types";

export type TestResultRepository = {
  /**
   * Delete test results.
   * @param testResultIds  Test result ids.
   */
  deleteTestResults(
    testResultIds: string[]
  ): Promise<RepositoryAccessResult<void>>;

  /**
   * Creates export data with the specified test results.
   * @param testResultId  Test result ID.
   * @param shouldSaveTemporary Whether to save temporary.
   * @returns Test script URL.
   */
  postTestResultForExport(
    testResultId: string
  ): Promise<RepositoryAccessResult<{ url: string }>>;

  /**
   * Create an empty test result.
   * @param name  Test result name.
   * @returns  Created test result information.
   */
  postEmptyTestResult(option?: {
    initialUrl?: string;
    name?: string;
    parentTestResultId?: string;
  }): Promise<RepositoryAccessResult<{ id: string; name: string }>>;

  /**
   * Get a list of test results.
   * @returns List of test results.
   */
  getTestResults(): Promise<
    RepositoryAccessResult<TestResultSummaryForRepository[]>
  >;

  /**
   * Get the test result of the specified test result ID.
   * @param testResultId  Test result ID.
   */
  getTestResult(
    testResultId: string
  ): Promise<RepositoryAccessResult<TestResultForRepository>>;

  patchTestResult(
    testResultId: string,
    name?: string,
    startTime?: number,
    initialUrl?: string
  ): Promise<RepositoryAccessResult<TestResultForRepository>>;

  getSessionIds(
    testResultId: string
  ): Promise<RepositoryAccessResult<Array<string>>>;

  generateSequenceView(
    testResultId: string,
    option?: TestResultViewOptionForRepository
  ): Promise<RepositoryAccessResult<SequenceViewForRepository>>;

  generateGraphView(
    testResultIds: string[],
    option?: TestResultViewOptionForRepository
  ): Promise<RepositoryAccessResult<GraphViewForRepository>>;
};

export class TestResultRepositoryImpl implements TestResultRepository {
  constructor(private restClient: RESTClient) {}

  public async deleteTestResults(
    testResultIds: string[]
  ): Promise<RepositoryAccessResult<void>> {
    try {
      const responses = await Promise.all(
        testResultIds.map(async (testResultId) => {
          return await this.restClient.httpDelete(
            `api/v1/test-results/${testResultId}`
          );
        })
      );

      const errorIndex = responses.findIndex(
        (response) => response.status !== 204
      );

      if (errorIndex > -1) {
        return createRepositoryAccessFailure(responses[errorIndex]);
      }

      return createRepositoryAccessSuccess({
        data: responses[0].data as void,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async postTestResultForExport(
    testResultId: string
  ): Promise<RepositoryAccessResult<{ url: string }>> {
    try {
      const response = await this.restClient.httpPost(
        `api/v1/test-results/${testResultId}/export`
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

  public async postEmptyTestResult(
    option: {
      initialUrl?: string;
      name?: string;
      parentTestResultId?: string;
    } = {}
  ): Promise<RepositoryAccessResult<{ id: string; name: string }>> {
    try {
      const url = `api/v1/test-results`;
      const response = await this.restClient.httpPost(url, option);

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

  public async getTestResults(): Promise<
    RepositoryAccessResult<TestResultSummaryForRepository[]>
  > {
    try {
      const response = await this.restClient.httpGet(`api/v1/test-results`);

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      const testResultSummaries =
        response.data as TestResultSummaryForRepository[];

      return createRepositoryAccessSuccess({
        data: testResultSummaries,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async getTestResult(
    testResultId: string
  ): Promise<RepositoryAccessResult<TestResultForRepository>> {
    try {
      const response = await this.restClient.httpGet(
        `api/v1/test-results/${testResultId}`
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      const data = response.data as TestResultForRepository;

      return createRepositoryAccessSuccess({
        data: this.convertTestResult(data),
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async patchTestResult(
    testResultId: string,
    name?: string,
    startTime?: number,
    initialUrl?: string
  ): Promise<RepositoryAccessResult<TestResultForRepository>> {
    try {
      const response = await this.restClient.httpPatch(
        `api/v1/test-results/${testResultId}`,
        { name, startTime, initialUrl }
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      const data = response.data as TestResultForRepository;

      return createRepositoryAccessSuccess({
        data: this.convertTestResult(data),
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async getSessionIds(
    testResultId: string
  ): Promise<RepositoryAccessResult<Array<string>>> {
    try {
      const response = await this.restClient.httpGet(
        `api/v1/test-results/${testResultId}/sessions`
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as Array<string>,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async generateSequenceView(
    testResultId: string,
    option?: TestResultViewOptionForRepository
  ): Promise<RepositoryAccessResult<SequenceViewForRepository>> {
    try {
      const url = `api/v1/test-results/${testResultId}/sequence-views`;
      const response = await this.restClient.httpPost(url, option);

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as SequenceViewForRepository,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async generateGraphView(
    testResultIds: string[],
    option?: TestResultViewOptionForRepository
  ): Promise<RepositoryAccessResult<GraphViewForRepository>> {
    try {
      const url = `api/v1/graph-views`;
      const response = await this.restClient.httpPost(url, {
        testResultIds,
        node: option?.node,
      });

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      const data = response.data as GraphViewForRepository;

      return createRepositoryAccessSuccess({
        data: this.convertGraphView(data),
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  private convertTestResult(testResult: TestResultForRepository) {
    return {
      ...testResult,
      testSteps: testResult.testSteps.map((testStep) => {
        return {
          ...testStep,
          operation: this.convertOperation(testStep.operation),
          bugs: testStep.bugs.map((note) => this.convertNote(note)),
          notices: testStep.notices.map((note) => this.convertNote(note)),
        };
      }),
    };
  }

  private convertOperation(operation: OperationForRepository) {
    return {
      ...operation,
      imageFileUrl: operation.imageFileUrl
        ? new URL(operation.imageFileUrl, this.restClient.serverUrl).toString()
        : "",
      videoFrame: operation.videoFrame
        ? {
            ...operation.videoFrame,
            url: new URL(
              operation.videoFrame.url,
              this.restClient.serverUrl
            ).toString(),
          }
        : undefined,
    };
  }

  private convertNote(note: NoteForRepository) {
    return {
      ...note,
      imageFileUrl: note.imageFileUrl
        ? new URL(note.imageFileUrl, this.restClient.serverUrl).toString()
        : "",
      videoFrame: note.videoFrame
        ? {
            ...note.videoFrame,
            url: new URL(
              note.videoFrame.url,
              this.restClient.serverUrl
            ).toString(),
          }
        : undefined,
    };
  }

  private convertGraphView(graphView: GraphViewForRepository) {
    return {
      ...graphView,
      nodes: graphView.nodes.map((node) => {
        return {
          ...node,
          testSteps: node.testSteps.map((testStep) => {
            return {
              ...testStep,
              imageFileUrl: testStep.imageFileUrl
                ? new URL(
                    testStep.imageFileUrl,
                    this.restClient.serverUrl
                  ).toString()
                : undefined,
              videoFrame: testStep.videoFrame
                ? {
                    ...testStep.videoFrame,
                    url: new URL(
                      testStep.videoFrame.url,
                      this.restClient.serverUrl
                    ).toString(),
                  }
                : undefined,
            };
          }),
        };
      }),
      store: {
        ...graphView.store,
        notes: graphView.store.notes.map((note) => {
          return {
            ...note,
            imageFileUrl: note.imageFileUrl
              ? new URL(note.imageFileUrl, this.restClient.serverUrl).toString()
              : undefined,
            videoFrame: note.videoFrame
              ? {
                  ...note.videoFrame,
                  url: new URL(
                    note.videoFrame.url,
                    this.restClient.serverUrl
                  ).toString(),
                }
              : undefined,
          };
        }),
      },
    };
  }
}
