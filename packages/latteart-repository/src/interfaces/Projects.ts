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

import { DailyTestProgress } from "../services/TestProgressService";
import { Story } from "./Stories";

/**
 * Project list record.
 */
export interface ProjectListResponse {
  id: string;
  name: string;
  createdAt: string;
}

/**
 * Project data for the specified ID.
 */
export type GetProjectResponse = Project;

/**
 * Test progress data in project.
 */
export type GetTestProgressResponse = DailyTestProgress;

/**
 * Project data.
 */
export type Project = {
  id: string;
  name: string;
  testMatrices: {
    id: string;
    name: string;
    index: number;
    groups: {
      id: string;
      name: string;
      index: number;
      testTargets: {
        id: string;
        name: string;
        index: number;
        plans: {
          viewPointId: string;
          value: number;
        }[];
      }[];
    }[];
    viewPoints: {
      id: string;
      name: string;
      index: number;
      description: string;
    }[];
  }[];
  stories: Story[];
};

/**
 * Test progress data for the specified ID.
 */
export interface ProgressData {
  testMatrixId: string;
  testMatrixProgressDatas: {
    date: string;
    groups: {
      id: string;
      name: string;
      testTargets: {
        id: string;
        name: string;
        progress: {
          completedNumber: number;
          incompletedNumber: number;
          planNumber: number;
        };
      }[];
    }[];
  }[];
}
