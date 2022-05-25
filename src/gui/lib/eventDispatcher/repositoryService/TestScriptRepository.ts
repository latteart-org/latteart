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
import { TestScript } from "@/lib/operationHistory/scriptGenerator/TestScript";
import { Reply, ReplyImpl } from "@/lib/captureControl/Reply";

export class TestScriptRepository {
  constructor(private restClient: RESTClient) {}

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
    const response = await this.restClient.httpPost(
      `/projects/${projectId}/test-scripts`,
      body
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as { url: string },
    });
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
    const response = await this.restClient.httpPost(
      `/test-results/${testResultId}/test-scripts`,
      body
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as { url: string },
    });
  }
}
