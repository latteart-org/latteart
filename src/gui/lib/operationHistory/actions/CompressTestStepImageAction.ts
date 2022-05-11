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

import { ActionResult } from "@/lib/common/ActionResult";
import { CompressedImageRepository } from "@/lib/eventDispatcher/repositoryService/CompressedImageRepository";

export interface TestStepImageCompressible {
  readonly compressedImageRepository: CompressedImageRepository;
}

export class CompressTestStepImageAction {
  constructor(private dispatcher: TestStepImageCompressible) {}

  public async compressNoteImage(
    testResultId: string,
    testStepId: string
  ): Promise<ActionResult<{ imageFileUrl: string }>> {
    const reply = await this.dispatcher.compressedImageRepository.postTestStepImage(
      testResultId,
      testStepId
    );

    return reply;
  }
}