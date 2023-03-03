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
import { FileRepository } from "@/interfaces/fileRepository";
import { appRootPath } from "@/common";
import { ViewerTemplate } from "@/interfaces/viewerTemplate";

export class ViewerTemplateImpl implements ViewerTemplate {
  constructor(private dirPath: string, private appDirPath = appRootPath) {}

  public async copyDir(
    fileRepository: FileRepository,
    relativePath: string
  ): Promise<void> {
    const destFilePath = fileRepository.getFilePath(relativePath);
    const sourceFilePath = path.join(this.appDirPath, this.dirPath);
    return fs.copy(sourceFilePath, destFilePath);
  }

  public async copyFiles(
    fileRepository: FileRepository,
    relativePath: string,
    destRelativePath: string
  ): Promise<void> {
    const files = await fs.promises.readdir(
      path.join(this.appDirPath, this.dirPath, relativePath)
    );

    const viewerTemplatePath = path.join(
      this.appDirPath,
      this.dirPath,
      relativePath
    );

    const destDirPath = fileRepository.getFilePath(destRelativePath);

    for (const file of files) {
      await fs.mkdirp(destDirPath);
      await fs.copyFile(
        path.join(viewerTemplatePath, file),
        path.join(destDirPath, file)
      );
    }
  }

  public async copyFile(
    fileRepository: FileRepository,
    fileName: string,
    destRelativePath: string
  ): Promise<void> {
    const viewerTemplatePath = path.join(
      this.appDirPath,
      this.dirPath,
      fileName
    );

    const destFilePath = fileRepository.getFilePath(destRelativePath);

    await fs.mkdirp(destFilePath);
    await fs.copyFile(viewerTemplatePath, destFilePath);
  }
}

export function createSnapshotViewerTemplate() {
  return new ViewerTemplateImpl("snapshot-viewer");
}

export function createHistoryViewerTemplate() {
  return new ViewerTemplateImpl("history-viewer");
}
