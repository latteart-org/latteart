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
export interface Project {
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
  stories: StoryDetails[];
}

/**
 * Story data.
 */
interface StoryDetails {
  id: string;
  testMatrixId: string;
  testTargetId: string;
  viewPointId: string;
  status: string;
  sessions: {
    id: string;
    attachedFiles: {
      name: string;
      fileUrl?: string;
    }[];
    doneDate: string;
    isDone: boolean;
    issues: {
      details: string;
      source: {
        index: number;
        type: string;
      };
      status: string;
      ticketId: string;
      type: string;
      value: string;
      imageFilePath?: string;
      tags?: string[];
    }[];
    memo: string;
    name: string;
    testItem: string;
    testResultFiles?: {
      name: string;
      id: string;
    }[];
    testerName: string;
    testingTime: number;
  }[];
}

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
