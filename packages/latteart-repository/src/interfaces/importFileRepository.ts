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

/**
 * Test result data to import.
 */
export type CreateTestResultImportDto = {
  source: {
    testResultFile: { data: string; name: string };
  };
  dest?: {
    testResultId?: string;
  };
};

/**
 * Project data to import.
 */
export type CreateProjectImportDto = {
  source: { projectFile: { data: string; name: string } };
  includeTestResults: boolean;
  includeProject: boolean;
};

/**
 * Import fileR rpository.
 */
export type ImportFileRepository = {
  read(
    base64FileData: string
  ): Promise<{ filePath: string; data: string | Buffer }[]>;
};
