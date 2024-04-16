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

import { TestPurposeEntity } from "@/entities/TestPurposeEntity";
import { TestResultEntity } from "@/entities/TestResultEntity";
import {
  CreateNoteDto,
  UpdateNoteDto,
  GetNoteResponse,
  UpdateNoteResponse,
  CreateNoteResponse,
} from "@/interfaces/Notes";
import { testPurposeEntityToResponse } from "./helper/entityToResponse";
import { DataSource } from "typeorm";

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
  constructor(private dataSource: DataSource) {}

  public async createTestPurpose(
    testResultId: string,
    requestBody: CreateNoteDto
  ): Promise<CreateNoteResponse> {
    const testResultEntity = await this.dataSource
      .getRepository(TestResultEntity)
      .findOneByOrFail({ id: testResultId });

    const registeredTestPurposeEntity = await this.dataSource
      .getRepository(TestPurposeEntity)
      .save(
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
    const testPurposeEntity = await this.dataSource
      .getRepository(TestPurposeEntity)
      .findOneBy({
        id: testPurposeId,
      });

    if (!testPurposeEntity) {
      return undefined;
    }

    return testPurposeEntityToResponse(testPurposeEntity);
  }

  public async updateTestPurpose(
    testPurposeId: string,
    requestBody: UpdateNoteDto
  ): Promise<UpdateNoteResponse> {
    const testPurposeEntity = await this.dataSource
      .getRepository(TestPurposeEntity)
      .findOneByOrFail({ id: testPurposeId });

    testPurposeEntity.title = requestBody.value;
    testPurposeEntity.details = requestBody.details;

    await this.dataSource
      .getRepository(TestPurposeEntity)
      .save(testPurposeEntity);

    return testPurposeEntityToResponse(testPurposeEntity);
  }

  public async deleteTestPurpose(testPurposeId: string): Promise<void> {
    const testPurposeEntity = await this.dataSource
      .getRepository(TestPurposeEntity)
      .findOneOrFail({
        where: { id: testPurposeId },
        relations: ["testResult", "testSteps"],
      });

    await this.dataSource
      .getRepository(TestPurposeEntity)
      .remove(testPurposeEntity);
  }
}
