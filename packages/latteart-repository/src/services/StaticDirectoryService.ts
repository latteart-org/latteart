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

import path from "path";
import fs from "fs-extra";

export interface StaticDirectoryService {
  mkdir(dirname: string): Promise<string>;

  outputFile<T>(relativePathToRoot: string, data: T): Promise<void>;

  removeFile(relativePathToRoot: string): Promise<void>;

  getFileUrl(relativePathToRoot: string): string;

  getJoinedPath(relativePathToRoot: string): string;

  moveFile(
    sourceFilePath: string,
    destRelativePathToRoot: string
  ): Promise<void>;

  copyFile(
    sourceFilePath: string,
    destRelativePathToRoot: string
  ): Promise<void>;

  collectFileNames(filterPattern?: RegExp): Promise<string[]>;

  collectFilePaths(filterPattern?: RegExp): Promise<string[]>;
}

export class StaticDirectoryServiceImpl implements StaticDirectoryService {
  constructor(private staticRootPath: string, private directoryPath: string) {}

  public async mkdir(dirname: string): Promise<string> {
    const dirPath = this.getJoinedPath(dirname);
    await fs.mkdir(dirPath);
    return dirPath;
  }

  public async outputFile<T>(
    relativePathToRoot: string,
    data: T
  ): Promise<void> {
    await fs.outputFile(
      path.join(this.staticRootPath, this.directoryPath, relativePathToRoot),
      data
    );
  }

  public async removeFile(relativePathToRoot: string): Promise<void> {
    await fs.remove(
      path.join(this.staticRootPath, this.directoryPath, relativePathToRoot)
    );
  }

  public getFileUrl(relativePathToRoot: string): string {
    const filePath = path.join(this.directoryPath, relativePathToRoot);

    return `${filePath.split(path.sep).join("/")}`;
  }

  public getJoinedPath(relativePathToRoot: string): string {
    return path.join(
      this.staticRootPath,
      this.directoryPath,
      relativePathToRoot
    );
  }

  public async moveFile(
    sourceFilePath: string,
    destRelativePathToRoot: string
  ): Promise<void> {
    const destFilePath = path.join(
      this.staticRootPath,
      this.directoryPath,
      destRelativePathToRoot
    );

    await fs.mkdirp(path.dirname(destFilePath));
    await fs.copyFile(sourceFilePath, destFilePath);
    await fs.remove(sourceFilePath);
  }

  public async copyFile(
    sourceFilePath: string,
    destRelativePathToRoot: string
  ): Promise<void> {
    const destFilePath = path.join(
      this.staticRootPath,
      this.directoryPath,
      destRelativePathToRoot
    );

    await fs.mkdirp(path.dirname(destFilePath));
    await fs.copyFile(sourceFilePath, destFilePath);
  }

  public async collectFileNames(filterPattern = /.+/): Promise<string[]> {
    return (
      await fs.readdir(path.join(this.staticRootPath, this.directoryPath), {
        withFileTypes: true,
      })
    )
      .filter((dirent) => {
        return !dirent.isDirectory();
      })
      .map((dirent) => {
        return dirent.name;
      })
      .filter((fileName) => fileName.match(filterPattern));
  }

  public async collectFilePaths(filterPattern = /.+/): Promise<string[]> {
    return (await this.collectFileNames(filterPattern)).map((fileName) =>
      this.getJoinedPath(fileName)
    );
  }
}
