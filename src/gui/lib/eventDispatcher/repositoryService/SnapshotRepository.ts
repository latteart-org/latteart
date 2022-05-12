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

import RESTClient from "../RESTClient";
import { Reply, ReplyImpl } from "@/lib/captureControl/Reply";

export class SnapshotRepository {
  constructor(
    private restClient: RESTClient,
    private buildAPIURL: (url: string) => string
  ) {}

  /**
   * Create a snapshot of the specified project ID.
   * @param projectId  Project ID.
   * @returns URL of the snapshot.
   */
  public async postSnapshots(
    projectId: string
  ): Promise<Reply<{ url: string }>> {
    const response = await this.restClient.httpPost(
      this.buildAPIURL(`/projects/${projectId}/snapshots`),
      null
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as { url: string },
    });
  }
}
