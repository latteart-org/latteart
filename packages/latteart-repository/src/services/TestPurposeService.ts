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

import { TestPurposeEntity } from "@/entities/TestPurposeEntity";
import { TestResultEntity } from "@/entities/TestResultEntity";
import {
  CreateNoteDto,
  UpdateNoteDto,
  GetNoteResponse,
  UpdateNoteResponse,
  CreateNoteResponse,
} from "@/interfaces/Notes";
import { getRepository } from "typeorm";
import { testPurposeEntityToResponse } from "./helper/entityToResponse";

export interface TestPurposeService {
  createTestPurpose(
    testResultId: string,
    requestBody: CreateNoteDto
  ): Promise<CreateNoteResponse>;
  getTestPurpose(testPurposeId: string): Promise<GetNoteResponse | undefined>;
  updateTestPurpose(
    testPurposeId: string,
    requestBody: UpdateNoteDto
  ): Promise<UpdateNoteResponse>;
  deleteTestPurpose(testPurposeId: string): Promise<void>;
}

export class TestPurposeServiceImpl implements TestPurposeService {
  public async createTestPurpose(
    testResultId: string,
    requestBody: CreateNoteDto
  ): Promise<CreateNoteResponse> {
    const testResultEntity = await getRepository(
      TestResultEntity
    ).findOneOrFail(testResultId);

    const registeredTestPurposeEntity = await getRepository(
      TestPurposeEntity
    ).save(
      new TestPurposeEntity({
        title: requestBody.value,
        details: requestBody.details,
        testResult: testResultEntity,
        testSteps: [],
      })
    );

    return testPurposeEntityToResponse(registeredTestPurposeEntity);
  }

  public async getTestPurpose(
    testPurposeId: string
  ): Promise<GetNoteResponse | undefined> {
    const testPurposeEntity = await getRepository(TestPurposeEntity).findOne(
      testPurposeId
    );

    if (!testPurposeEntity) {
      return undefined;
    }

    return testPurposeEntityToResponse(testPurposeEntity);
  }

  public async updateTestPurpose(
    testPurposeId: string,
    requestBody: UpdateNoteDto
  ): Promise<UpdateNoteResponse> {
    const testPurposeEntity = await getRepository(
      TestPurposeEntity
    ).findOneOrFail(testPurposeId);

    testPurposeEntity.title = requestBody.value;
    testPurposeEntity.details = requestBody.details;

    await getRepository(TestPurposeEntity).save(testPurposeEntity);

    return testPurposeEntityToResponse(testPurposeEntity);
  }

  public async deleteTestPurpose(testPurposeId: string): Promise<void> {
    const testPurposeEntity = await getRepository(
      TestPurposeEntity
    ).findOneOrFail(testPurposeId, {
      relations: ["testResult", "testSteps"],
    });

    await getRepository(TestPurposeEntity).remove(testPurposeEntity);
  }
}
