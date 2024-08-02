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

import { CommentEntity } from "@/entities/CommentEntity";
import { TestResultEntity } from "@/entities/TestResultEntity";
import { CreateCommentResponse } from "@/interfaces/Comments";
import { Between, DataSource, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

export class CommentsService {
  constructor(private dataSource: DataSource) {}

  public async getComments(
    testResultId: string,
    filter: { since?: number; until?: number } = {}
  ): Promise<CreateCommentResponse[]> {
    const periodCondition =
      filter.since && filter.until
        ? { timestamp: Between(filter.since, filter.until) }
        : filter.since
          ? { timestamp: MoreThanOrEqual(filter.since) }
          : filter.until
            ? { timestamp: LessThanOrEqual(filter.until) }
            : {};

    const testIntents = await this.dataSource
      .getRepository(CommentEntity)
      .find({
        where: { testResult: { id: testResultId }, ...periodCondition },
        order: { timestamp: "ASC" },
      });
    return testIntents.map((intent) => {
      return {
        ...intent,
        testResultId,
      };
    });
  }

  public async postComment(
    testResultId: string,
    value: string,
    timestamp: number
  ): Promise<CreateCommentResponse> {
    const testResult = await this.dataSource
      .getRepository(TestResultEntity)
      .findOne({ where: { id: testResultId } });
    if (!testResult) {
      throw new Error(`TestResult not found. :${testResultId}`);
    }
    const comment = await this.dataSource.getRepository(CommentEntity).save({
      testResult,
      value,
      timestamp,
    });
    return {
      id: comment.id,
      testResultId,
      value: comment.value,
      timestamp: comment.timestamp,
    };
  }

  public async importComments(
    comments: {
      testResultId: string;
      data: {
        testResult: string;
        value: string;
        timestamp: number;
      }[];
    }[]
  ) {
    const testResultEntities = await this.dataSource
      .getRepository(TestResultEntity)
      .find();
    const commentEntities = comments
      .map((comment) => {
        const testResult = testResultEntities.find(
          (testResultEntity) => testResultEntity.id === comment.testResultId
        );
        return comment.data
          .map((d) => {
            return testResult
              ? new CommentEntity({
                  testResult,
                  value: d.value,
                  timestamp: d.timestamp,
                })
              : null;
          })
          .filter((e) => e) as CommentEntity[];
      })
      .flat();
    await this.dataSource.getRepository(CommentEntity).save(commentEntities);
  }
}
