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
import { TestScriptDocRenderingService } from "./TestScriptDocRenderingService";
import { FileRepository } from "@/interfaces/fileRepository";
const jsdoc = require("jsdoc-api"); // eslint-disable-line

export class TestScriptJSDocRenderingService
  implements TestScriptDocRenderingService
{
  public async render(
    workingFileRepository: FileRepository,
    testScriptDirName: string,
    screenshotFileNames: string[]
  ): Promise<void> {
    const confFilePath = path.join(testScriptDirName, "conf.json");
    const assetsDir = path.join(testScriptDirName, "assets");

    const screenshotDirPath = path.join(assetsDir, "screenshots");

    await Promise.all(
      screenshotFileNames.map((fileName) => {
        return workingFileRepository.copyFile(
          fileName,
          path.join(screenshotDirPath, fileName),
          "screenshot"
        );
      })
    );

    const assetsDirPath = workingFileRepository.getFilePath(assetsDir);

    await workingFileRepository.outputJSON(confFilePath, {
      plugins: ["jsdoc-mermaid"],
      templates: {
        default: {
          staticFiles: {
            include: [assetsDirPath],
          },
        },
      },
    });

    const testScriptDirPath =
      workingFileRepository.getFilePath(testScriptDirName);
    const confDirPath = workingFileRepository.getFilePath(confFilePath);
    const outputDirPath = workingFileRepository.getFilePath(
      path.join(testScriptDirName, "doc")
    );
    const readmeFilePath = workingFileRepository.getFilePath(
      path.join(testScriptDirName, "readme.md")
    );
    await new Promise<void>((resolve) => {
      jsdoc.renderSync({
        files: [testScriptDirPath],
        recurse: true,
        configure: confDirPath,
        destination: outputDirPath,
        readme: readmeFilePath,
      });

      resolve();
    });

    await workingFileRepository.removeFile(assetsDir);
    await workingFileRepository.removeFile(confFilePath);
    await workingFileRepository.removeFile(
      path.join(testScriptDirName, "readme.md")
    );
  }
}
