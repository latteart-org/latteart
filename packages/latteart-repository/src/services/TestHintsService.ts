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
  GetTestHintResponse,
  ImportTestHints,
  PostTestHintDto,
  PostTestHintResponse,
  PutTestHintDto,
  PutTestHintResponse,
} from "@/interfaces/TestHints";
import { TransactionRunner } from "@/TransactionRunner";
import { DataSource } from "typeorm";
import {
  testHintEntityToResponse,
  testHintPropEntityToResponse,
} from "./helper/entityToResponse";
import { SettingsUtility } from "@/gateways/settings/SettingsUtility";
import { TestHintPropSetting } from "@/gateways/settings/Settings";

export class TestHintsService {
  constructor(private dataSource: DataSource) {}

  public async getAllTestHints(): Promise<GetTestHintResponse> {
    const testHintRepository = this.dataSource.getRepository(TestHintEntity);
    const testHints = await testHintRepository.find();

    const paramRepository = this.dataSource.getRepository(TestHintPropEntity);
    let props = await paramRepository.find();

    if (props.length === 0) {
      await this.initProps();
      props = await paramRepository.find();
    }

    return {
      props: props
        .filter((p) => p.type !== "dummy")
        .sort((a, b) => a.index - b.index)
        .map(testHintPropEntityToResponse),
      data: testHints
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map(testHintEntityToResponse),
    };
  }

  public async importAllTestHints(
    testHints: ImportTestHints,
    transactionRunner: TransactionRunner
  ): Promise<void> {
    await transactionRunner.waitAndRun(async (transactionalEntityManager) => {
      // truncate
      await transactionalEntityManager.clear(TestHintPropEntity);
      await transactionalEntityManager.clear(TestHintEntity);

      const oldNewIdMap = new Map<string, string>();
      await Promise.all(
        testHints.props.map(async (prop, index) => {
          const p = new TestHintPropEntity();
          p.index = index;
          p.listItems =
            prop.listItems !== undefined && prop.listItems.length !== 0
              ? JSON.stringify(prop.listItems)
              : "";
          p.name = prop.name;
          p.type = prop.type;
          const result = await transactionalEntityManager.save(p);
          oldNewIdMap.set(prop.id, result.id);
        })
      );

      await Promise.all(
        testHints.data.map(async (hint) => {
          const customs = hint.customs.map((custom) => {
            const newId = oldNewIdMap.get(custom.propId);
            return { ...custom, propId: newId };
          });
          const h = new TestHintEntity();
          h.value = hint.value;
          h.testMatrixName = hint.testMatrixName;
          h.groupName = hint.groupName;
          h.testTargetName = hint.testTargetName;
          h.viewPointName = hint.viewPointName;
          h.customs = JSON.stringify(customs);
          h.commentWords = JSON.stringify(hint.commentWords);
          h.operationElements = JSON.stringify(hint.operationElements);
          await transactionalEntityManager.save(h);
        })
      );
    });
  }

  public async postTestHint(
    body: PostTestHintDto
  ): Promise<PostTestHintResponse> {
    const paramRepository = this.dataSource.getRepository(TestHintPropEntity);
    let params = await paramRepository.find();
    if (params.length === 0) {
      await this.initProps();
      params = await paramRepository.find();
    }

    const testHintRepository = this.dataSource.getRepository(TestHintEntity);
    const result = await testHintRepository.save({
      value: body.value,
      testMatrixName: body.testMatrixName,
      groupName: body.groupName,
      testTargetName: body.testTargetName,
      viewPointName: body.viewPointName,
      customs: JSON.stringify(body.customs),
      commentWords: JSON.stringify(body.commentWords),
      operationElements: JSON.stringify(body.operationElements),
    });
    return testHintEntityToResponse(result);
  }

  public async putTestHint(
    testHintId: string,
    body: PutTestHintDto
  ): Promise<PutTestHintResponse> {
    const testHintRepository = this.dataSource.getRepository(TestHintEntity);
    const testHint = await testHintRepository.findOne({
      where: { id: testHintId },
    });
    if (!testHint) {
      throw new Error(`TestHint not found. id:${testHintId}`);
    }
    testHint.value = body.value;
    testHint.testMatrixName = body.testMatrixName;
    testHint.groupName = body.groupName;
    testHint.testTargetName = body.testTargetName;
    testHint.viewPointName = body.viewPointName;
    testHint.customs = JSON.stringify(body.customs);
    testHint.commentWords = JSON.stringify(body.commentWords);
    testHint.operationElements = JSON.stringify(body.operationElements);
    const result = await testHintRepository.save(testHint);

    return testHintEntityToResponse(result);
  }

  public async deleteTestHint(testHintId: string): Promise<void> {
    await this.dataSource.getRepository(TestHintEntity).delete(testHintId);
    return;
  }

  private async initProps(): Promise<void> {
    const props = (
      SettingsUtility.getSetting(
        "defaultTestHintProps"
      ) as TestHintPropSetting[]
    ).map((prop) => {
      return new TestHintPropEntity({
        ...prop,
        listItems: JSON.stringify(prop.listItems),
      });
    });
    await this.dataSource.getRepository(TestHintPropEntity).save(props);
  }
}
