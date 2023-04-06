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

import { RESTClient } from "../../network/http/client";
import { RepositoryService } from "./types";
import {
  TestStepRepositoryImpl,
  NoteRepositoryImpl,
  TestResultRepository,
  ImportTestResultRepository,
  ImportProjectRepository,
  TestScriptRepository,
  SettingsRepository,
  CompressedImageRepository,
  ProjectRESTRepository,
  SessionRepository,
  SnapshotRepository,
  ScreenshotRepository,
  TestMatrixRepository,
  TestTargetGroupRepository,
  TestTargetRepository,
  ViewPointRepository,
  StoryRepository,
  TestResultComparisonRepository,
} from "../../gateway/repository";
import {
  ServiceResult,
  ServiceError,
  ServiceFailure,
  ServiceSuccess,
} from "../result";
import {
  RepositoryContainer,
  TestResultAccessorImpl,
} from "./testResultAccessor";

/**
 * create a Repository Service
 * @param serviceUrl service url
 */
export function createRepositoryService(
  restClient: RESTClient
): RepositoryService {
  const repositories: RepositoryContainer = {
    testStepRepository: new TestStepRepositoryImpl(restClient),
    noteRepository: new NoteRepositoryImpl(restClient),
    testResultRepository: new TestResultRepository(restClient),
    importTestResultRepository: new ImportTestResultRepository(restClient),
    importProjectRepository: new ImportProjectRepository(restClient),
    testScriptRepository: new TestScriptRepository(restClient),
    settingRepository: new SettingsRepository(restClient),
    compressedImageRepository: new CompressedImageRepository(restClient),
    projectRepository: new ProjectRESTRepository(restClient),
    sessionRepository: new SessionRepository(restClient),
    snapshotRepository: new SnapshotRepository(restClient),
    screenshotRepository: new ScreenshotRepository(restClient),
    testMatrixRepository: new TestMatrixRepository(restClient),
    testTargetGroupRepository: new TestTargetGroupRepository(restClient),
    testTargetRepository: new TestTargetRepository(restClient),
    viewPointRepository: new ViewPointRepository(restClient),
    storyRepository: new StoryRepository(restClient),
    testResultComparisonRepository: new TestResultComparisonRepository(
      restClient
    ),
  };

  return {
    serviceUrl: restClient.serverUrl,
    async createEmptyTestResult(option?: {
      initialUrl?: string;
      name?: string;
      parentTestResultId?: string;
    }): Promise<ServiceResult<{ id: string; name: string }>> {
      const result =
        await repositories.testResultRepository.postEmptyTestResult(option);

      if (result.isFailure()) {
        const error: ServiceError = {
          errorCode: "create_empty_test_result_failed",
          message: "Create empty Test Result failed.",
        };
        console.error(error.message);
        return new ServiceFailure(error);
      }

      return new ServiceSuccess(result.data);
    },
    createTestResultAccessor(testResultId: string) {
      return new TestResultAccessorImpl(
        restClient.serverUrl,
        repositories,
        testResultId
      );
    },
    ...repositories,
  };
}
