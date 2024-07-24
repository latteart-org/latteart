/**
 * Copyright 2024 NTT Corporation.
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

import { TestHintEntity } from "@/entities/TestHintEntity";
import { TestHintPropEntity } from "@/entities/TestHintPropEntity";
import {
  PutTestHintPropDto,
  PutTestHintPropResponse,
} from "@/interfaces/TestHints";
import { TransactionRunner } from "@/TransactionRunner";
import { DataSource } from "typeorm";
import { testHintPropEntityToResponse } from "./helper/entityToResponse";

export class TestHintPropsService {
  constructor(private dataSource: DataSource) {}

  public async putTestHintProps(
    testHintProps: PutTestHintPropDto[],
    transactionRunner: TransactionRunner
  ): Promise<PutTestHintPropResponse> {
    await transactionRunner.waitAndRun(async (entityManager) => {
      const existsParams = await entityManager.find(TestHintPropEntity);

      const idList = testHintProps
        .map((param) => param.id ?? "")
        .filter((id) => id !== "");
      const deleteIdList = existsParams
        .filter((existsParam) => !idList.includes(existsParam.id))
        .map((param) => param.id);

      if (deleteIdList.length > 0) {
        const testHintEntities = await entityManager.find(TestHintEntity);
        testHintEntities.forEach((testHintEntity) => {
          const customs = JSON.parse(testHintEntity.customs) as {
            paramId: string;
            value: string;
          }[];
          testHintEntity.customs = JSON.stringify(
            customs.filter((custom) => !deleteIdList.includes(custom.paramId))
          );
        });

        await entityManager.save(testHintEntities);
        await entityManager.delete(TestHintPropEntity, deleteIdList);
      }

      await Promise.all(
        testHintProps.map(async (param, index) => {
          const targetParam = existsParams.find(
            (existsParam) => existsParam.id === param.id
          );
          if (targetParam) {
            await entityManager.save(TestHintPropEntity, {
              ...targetParam,
              title: param.title,
              type: param.type,
              list: param.listItems ? JSON.stringify(param.listItems) : "",
              index,
            });
          } else {
            await entityManager.save(TestHintPropEntity, {
              title: param.title,
              type: param.type,
              list: param.listItems ? JSON.stringify(param.listItems) : "",
              index,
            });
          }
        })
      );
    });
    const results = await this.dataSource
      .getRepository(TestHintPropEntity)
      .find();
    return results
      .sort((a, b) => a.index - b.index)
      .map((r) => testHintPropEntityToResponse(r));
  }
}
