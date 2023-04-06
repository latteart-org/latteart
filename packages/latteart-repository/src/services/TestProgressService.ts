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

import { TestProgressEntity } from "@/entities/TestProgressEntity";
import {
  Between,
  getRepository,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
} from "typeorm";
import { StoryEntity } from "@/entities/StoryEntity";
import {
  dateToFormattedString,
  unixtimeToFormattedString,
} from "@/domain/timeUtil";
import { TestTargetEntity } from "@/entities/TestTargetEntity";
import { ProjectsServiceImpl } from "./ProjectsService";

/**
 * Daily test progress.
 */
export type DailyTestProgress = {
  date: string;
  storyProgresses: {
    storyId: string;
    testMatrixId: string;
    testTargetGroupId: string;
    testTargetId: string;
    viewPointId: string;
    plannedSessionNumber: number;
    completedSessionNumber: number;
    incompletedSessionNumber: number;
  }[];
};

export interface TestProgressService {
  saveTodayTestProgresses(
    projectId: string,
    ...storyIds: string[]
  ): Promise<void>;

  collectStoryDailyTestProgresses(
    storyIds: string[],
    filter?: { since?: number; until?: number }
  ): Promise<DailyTestProgress[]>;

  collectProjectDailyTestProgresses(
    projectId: string,
    filter?: { since?: number; until?: number }
  ): Promise<DailyTestProgress[]>;
}

export class TestProgressServiceImpl implements TestProgressService {
  public async saveTodayTestProgresses(
    projectId: string,
    ...storyIds: string[]
  ): Promise<void> {
    const targetEntities = await this.collectUpdateTargetEntities(...storyIds);

    if (targetEntities.length > 0) {
      // update test progress
      await getRepository(TestProgressEntity).save(targetEntities);
    } else {
      // register test progress
      await this.registerProjectTestProgresses(projectId);
    }
  }

  public async collectStoryDailyTestProgresses(
    storyIds: string[],
    filter: { since?: number; until?: number } = {}
  ): Promise<DailyTestProgress[]> {
    const testProgressRepository = getRepository(TestProgressEntity);

    const since =
      filter.since !== undefined
        ? unixtimeToFormattedString(filter.since, "YYYY-MM-DD HH:mm:ss")
        : undefined;
    const until =
      filter.until !== undefined
        ? unixtimeToFormattedString(filter.until, "YYYY-MM-DD HH:mm:ss")
        : undefined;

    const periodCondition =
      since && until
        ? { date: Between(since, until) }
        : since
        ? { date: MoreThanOrEqual(since) }
        : until
        ? { date: LessThanOrEqual(until) }
        : {};

    const entities = await testProgressRepository.find({
      where: {
        story: In(storyIds),
        ...periodCondition,
      },
      order: { date: "ASC" },
      relations: [
        "story",
        "story.testTarget",
        "story.testTarget.testTargetGroup",
      ],
    });

    return Array.from(
      entities.reduce((acc, entity) => {
        const date = dateToFormattedString(entity.date, "YYYY-MM-DD");

        if (!acc.has(date)) {
          acc.set(date, new Map());
        }

        acc.get(date)?.set(entity.story.id, entity);

        return acc;
      }, new Map<string, Map<string, TestProgressEntity>>())
    ).map(([date, storyIdToEntity]) => {
      return {
        date,
        storyProgresses: Array.from(storyIdToEntity.values()).map((entity) => {
          return {
            storyId: entity.story.id,
            testMatrixId: entity.story.testMatrixId,
            testTargetGroupId: entity.story.testTarget.testTargetGroup.id,
            testTargetId: entity.story.testTargetId,
            viewPointId: entity.story.viewPointId,
            plannedSessionNumber: entity.plannedSessionNumber,
            completedSessionNumber: entity.completedSessionNumber,
            incompletedSessionNumber: entity.incompletedSessionNumber,
          };
        }),
      };
    });
  }

  public async collectProjectDailyTestProgresses(
    projectId: string,
    filter: { since?: number; until?: number } = {}
  ): Promise<DailyTestProgress[]> {
    const project = await new ProjectsServiceImpl().getProject(projectId);

    const storyIds = project.stories.map((story) => story.id);

    return await this.collectStoryDailyTestProgresses(storyIds, filter);
  }

  private async registerStoryTestProgresses(
    ...storyIds: string[]
  ): Promise<void> {
    const storyProgresses = await Promise.all(
      storyIds.map(async (storyId) => {
        const storyRepository = getRepository(StoryEntity);
        const story = await storyRepository.findOneOrFail(storyId, {
          relations: ["sessions"],
        });

        const testTargetRepository = getRepository(TestTargetEntity);
        const testTarget = await testTargetRepository.findOneOrFail(
          story.testTargetId
        );
        const plans: { viewPointId: string; value: number }[] = JSON.parse(
          testTarget.text
        );

        return {
          plannedSessionNumber:
            plans.find((plan) => plan.viewPointId === story.viewPointId)
              ?.value ?? 0,
          completedSessionNumber: story.sessions.filter(
            (session) => session.doneDate
          ).length,
          incompletedSessionNumber: story.sessions.filter(
            (session) => !session.doneDate
          ).length,
          story,
          date: new Date(),
        };
      })
    );

    const testProgressRepository = getRepository(TestProgressEntity);

    await testProgressRepository.save(storyProgresses);
  }

  private async registerProjectTestProgresses(
    projectId: string
  ): Promise<void> {
    const project = await new ProjectsServiceImpl().getProject(projectId);

    const storyIds = project.stories.map((story) => story.id);

    return await this.registerStoryTestProgresses(...storyIds);
  }

  private async collectUpdateTargetEntities(...storyIds: string[]) {
    const _d = new Date();
    const d = new Date(_d.getFullYear(), _d.getMonth(), _d.getDate(), 0, 0, 0);
    const today = dateToFormattedString(d, "YYYY-MM-DD HH:mm");

    const testProgressRepository = getRepository(TestProgressEntity);
    const entitiesWithStoryId = await Promise.all(
      storyIds.map(async (storyId) => {
        const entity = await testProgressRepository.findOne({
          where: { story: storyId, createdAt: MoreThanOrEqual(today) },
          order: { createdAt: "DESC" },
        });

        return {
          storyId,
          entity,
        };
      })
    );

    const hasNoEntity = entitiesWithStoryId.some((item) => {
      return !item.entity;
    });

    if (hasNoEntity) {
      return [];
    }

    const updateTargetEntities: TestProgressEntity[] = [];
    for (const target of entitiesWithStoryId as {
      storyId: string;
      entity: TestProgressEntity;
    }[]) {
      const newProgress = await this.getNewTestProgress(target.storyId);

      target.entity.plannedSessionNumber = newProgress.planned;
      target.entity.completedSessionNumber = newProgress.completed;
      target.entity.incompletedSessionNumber = newProgress.incompleted;

      updateTargetEntities.push(target.entity);
    }

    return updateTargetEntities;
  }

  private async getNewTestProgress(storyId: string) {
    const { sessions, viewPointId, testTargetId } = await getRepository(
      StoryEntity
    ).findOneOrFail(storyId, {
      relations: ["sessions"],
    });

    const testTarget = await getRepository(TestTargetEntity).findOneOrFail(
      testTargetId
    );
    const plans: { viewPointId: string; value: number }[] = JSON.parse(
      testTarget.text
    );
    const planValue = plans.find(
      (plan) => plan.viewPointId === viewPointId
    )?.value;

    const planned = planValue ?? 0;
    const completed = sessions.filter(({ doneDate }) => doneDate).length;
    const incompleted = sessions.filter(({ doneDate }) => !doneDate).length;

    return { planned, completed, incompleted };
  }
}
