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
 * File repository.
 */
export type FileRepository = {
  readFile(
    relativePath: string,
    encoding?: "utf8" | "base64"
  ): Promise<string | Buffer>;

  outputFile(
    relativePath: string,
    data: string | Buffer,
    encoding?: "utf8" | "base64"
  ): Promise<void>;

  outputJSON<T>(relativePath: string, data: T): Promise<void>;

  outputZip(relativePath: string, deleteSource: boolean): Promise<string>;

  removeFile(relativePath: string): Promise<void>;

  getFileUrl(relativePath: string): string;

  getFilePath(relativePath: string): string;

  moveFile(sourceFilePath: string, destRelativePath: string): Promise<void>;

  copyFile(
    sourceFileName: string,
    destRelativePath: string,
    sourceRepositoryName: RepositoryName
  ): Promise<void>;
};

/**
 * Repository name.
 */
export type RepositoryName =
  | "screenshot"
  | "attachedFile"
  | "snapshot"
  | "testScript"
  | "export"
  | "temp"
  | "work";
