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

import { OperationHistoryItem } from "@/lib/captureControl/OperationHistoryItem";
import { CoverageSource, InputElementInfo } from "../types";
import { Reply } from "@/lib/captureControl/Reply";
import { Operation } from "../Operation";
import { Note } from "../Note";

export interface ResumeActionObserver {
  setResumedData: (data: {
    coverageSources: CoverageSource[];
    inputElementInfos: InputElementInfo[];
    historyItems: OperationHistoryItem[];
    url: string;
    testResultInfo: { id: string; name: string };
  }) => Promise<void>;
  registerTestStepId(testStepId: string): number;
  clearTestStepIds(): void;
}

export interface TestResultResumable {
  resume(testResultId: string): Promise<
    Reply<{
      id: string;
      name: string;
      operationHistoryItems: ({ testStepId: string } & OperationHistoryItem)[];
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
      this.observer.clearTestStepIds();

      const historyItems = data.operationHistoryItems.map((item) => {
        const sequence = this.observer.registerTestStepId(item.testStepId);

        return {
          operation: item.operation
            ? Operation.createFromOtherOperation({
                other: item.operation,
                overrideParams: { sequence },
              })
            : null,
          intention: item.intention
            ? Note.createFromOtherNote({
                other: item.intention,
                overrideParams: { sequence },
              })
            : null,
          bugs:
            item.bugs?.map((bug) => {
              return Note.createFromOtherNote({
                other: bug,
                overrideParams: { sequence },
              });
            }) ?? [],
          notices:
            item.notices?.map((notice) => {
              return Note.createFromOtherNote({
                other: notice,
                overrideParams: { sequence },
              });
            }) ?? [],
        };
      });

      await this.observer.setResumedData({
        coverageSources: data.coverageSources,
        inputElementInfos: data.inputElementInfos,
        historyItems,
        url: data.initialUrl,
        testResultInfo: { id: data.id, name: data.name },
      });
    }
  }
}
