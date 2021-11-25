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

import { OperationHistoryItem } from "@/lib/captureControl/OperationHistoryItem";
import { CoverageSource, InputElementInfo } from "../types";
import { Reply } from "@/lib/captureControl/Reply";

export interface ResumeActionObserver {
  setResumedData: (data: {
    coverageSources: CoverageSource[];
    inputElementInfos: InputElementInfo[];
    historyItems: OperationHistoryItem[];
    url: string;
    testResultInfo: { id: string; name: string };
  }) => Promise<void>;
}

export interface TestResultResumable {
  resume(
    testResultId: string
  ): Promise<
    Reply<{
      id: string;
      name: string;
      operationHistoryItems: OperationHistoryItem[];
      coverageSources: CoverageSource[];
      inputElementInfos: InputElementInfo[];
      initialUrl: string;
    }>
  >;
}

export class ResumeAction {
  constructor(
    private observer: ResumeActionObserver,
    private repositoryServiceDispatcher: TestResultResumable
  ) {}

  public async resume(testResultId: string): Promise<void> {
    const reply = await this.repositoryServiceDispatcher.resume(testResultId);

    if (reply.error) {
      throw new Error(reply.error.code);
    }

    const data = reply.data;

    if (data) {
      await this.observer.setResumedData({
        coverageSources: data.coverageSources,
        inputElementInfos: data.inputElementInfos,
        historyItems: data.operationHistoryItems,
        url: data.initialUrl,
        testResultInfo: { id: data.id, name: data.name },
      });
    }
  }
}
