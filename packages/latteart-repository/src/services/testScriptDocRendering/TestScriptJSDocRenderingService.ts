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
import { TestScriptDocRenderingService } from "./TestScriptDocRenderingService";
const jsdoc = require("jsdoc-api"); // eslint-disable-line

export class TestScriptJSDocRenderingService
  implements TestScriptDocRenderingService
{
  public async render(
    testScriptDirectoryPath: string,
    screenshotFilePaths: string[]
  ): Promise<void> {
    const confFilePath = path.join(testScriptDirectoryPath, "conf.json");
    const assetsDirPath = path.join(testScriptDirectoryPath, "assets");
    const screenshotDirectoryPath = path.join(assetsDirPath, "screenshots");

    await fs.mkdirp(screenshotDirectoryPath);
    await Promise.all(
      screenshotFilePaths.map((filePath) => {
        const destFilePath = path.join(
          screenshotDirectoryPath,
          path.basename(filePath)
        );
        return fs.copyFile(filePath, destFilePath);
      })
    );

    await fs.outputJSON(confFilePath, {
      plugins: ["jsdoc-mermaid"],
      templates: {
        default: {
          staticFiles: {
            include: [assetsDirPath],
          },
        },
      },
    });

    const readmeFilePath = path.join(testScriptDirectoryPath, "readme.md");
    const outputDirPath = path.join(testScriptDirectoryPath, "doc");

    await new Promise<void>((resolve) => {
      jsdoc.renderSync({
        files: [testScriptDirectoryPath],
        recurse: true,
        configure: confFilePath,
        destination: outputDirPath,
        readme: readmeFilePath,
      });

      resolve();
    });

    await fs.remove(assetsDirPath);
    await fs.remove(confFilePath);
    await fs.remove(readmeFilePath);
  }
}
