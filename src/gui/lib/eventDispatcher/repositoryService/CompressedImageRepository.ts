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

export class CompressedImageRepository {
  constructor(private restClient: RESTClient) {}

  /**
   * Compress screenshot of note.
   * @param testResultId  Test result id.
   * @param noteId  Note id.
   * @returns File path after compression.
   */
  public async postNoteImage(
    testResultId: string,
    noteId: string
  ): Promise<Reply<{ imageFileUrl: string }>> {
    const response = await this.restClient.httpPost(
      `/test-results/${testResultId}/notes/${noteId}/compressed-image`,
      null
    );

    const { imageFileUrl } = response.data as { imageFileUrl: string };

    return new ReplyImpl({
      status: response.status,
      data: { imageFileUrl },
    });
  }

  /**
   * Compress screenshot of test step.
   * @param testResultId  Test result id.
   * @param testStepId  Test step id of the target test step.
   * @returns File path after compression.
   */
  public async postTestStepImage(
    testResultId: string,
    testStepId: string
  ): Promise<Reply<{ imageFileUrl: string }>> {
    const response = await this.restClient.httpPost(
      `/test-results/${testResultId}/test-steps/${testStepId}/compressed-image`,
      null
    );

    const { imageFileUrl } = response.data as { imageFileUrl: string };

    if (!imageFileUrl) {
      throw new Error();
    }

    return new ReplyImpl({
      status: response.status,
      data: { imageFileUrl },
    });
  }
}
