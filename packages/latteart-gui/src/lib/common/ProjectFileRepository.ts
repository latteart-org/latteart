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

import {
  DailyTestProgressForRepository,
  ProjectRepository,
  RepositoryAccessResult,
  createRepositoryAccessSuccess,
  createConnectionRefusedFailure,
} from "latteart-client";
import { Project } from "@/lib/testManagement/types";
import { TimestampImpl } from "@/lib/common/Timestamp";

export interface ProgressData {
  testMatrixId: string;
  testMatrixProgressDatas: TestMatrixProgressData[];
}
export interface TestMatrixProgressData {
  date: string;
  groups: GroupProgressData[];
}

export interface GroupProgressData {
  id: string;
  name: string;
  testTargets: TestTargetProgressData[];
}

export interface TestTargetProgressData {
  id: string;
  name: string;
  progress: {
    planNumber: number;
    completedNumber: number;
    incompletedNumber: number;
  };
}

export class ProjectFileRepository implements ProjectRepository {
  constructor(private progressFileData: DailyTestProgressForRepository[]) {}

  /**
   * Creates export project or testresult or all.
   * @param projectId  Project ID.
   * @param selectOption  Select option.
   * @returns Export File URL.
   */
  public async postProjectForExport(): Promise<
    RepositoryAccessResult<{ url: string }>
  > {
    return createConnectionRefusedFailure();
  }

  public async getProjects(): Promise<
    RepositoryAccessResult<
      Array<{
        id: string;
        name: string;
        createdAt: string;
      }>
    >
  > {
    return createRepositoryAccessSuccess({ data: [] });
  }

  public async getProject(): Promise<RepositoryAccessResult<Project>> {
    return createConnectionRefusedFailure();
  }

  public async postProject(): Promise<
    RepositoryAccessResult<{ id: string; name: string }>
  > {
    return createConnectionRefusedFailure();
  }

  public async getTestProgress(
    projectId: string,
    filter: {
      period?: { since?: number; until?: number };
    } = {}
  ): Promise<RepositoryAccessResult<DailyTestProgressForRepository[]>> {
    const filteredProgresses = this.progressFileData.filter(({ date }) => {
      if (
        filter.period?.since !== undefined &&
        filter.period.until !== undefined
      ) {
        return new TimestampImpl(date).isBetween(
          new TimestampImpl(filter.period.since),
          new TimestampImpl(filter.period.until)
        );
      }

      if (filter.period?.since !== undefined) {
        return new TimestampImpl(date).isSameOrAfter(
          new TimestampImpl(filter.period.since)
        );
      }

      if (filter.period?.until !== undefined) {
        return new TimestampImpl(date).isSameOrBefore(
          new TimestampImpl(filter.period.until)
        );
      }

      return true;
    });

    return createRepositoryAccessSuccess({
      data: filteredProgresses,
    });
  }
}
