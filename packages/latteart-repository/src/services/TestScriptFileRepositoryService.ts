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

import { TestScriptDocRenderingService } from "./testScriptDocRendering/TestScriptDocRenderingService";
import path from "path";
import fs from "fs-extra";
import { TimestampService } from "./TimestampService";
import { ImageFileRepositoryService } from "./ImageFileRepositoryService";
import FileArchiver from "@/lib/FileArchiver";
import { StaticDirectoryService } from "./StaticDirectoryService";
import os from "os";

export interface TestScriptFileRepositoryService {
  write(
    testScripts: {
      pageObjects: {
        name: string;
        script: string;
      }[];
      testData: {
        name: string;
        testData: string;
      }[];
      testSuite: {
        name: string;
        spec: string;
      };
      others?: { name: string; script: string }[];
    },
    screenshots: { id: string; fileUrl: string }[]
  ): Promise<string>;
}

export class TestScriptFileRepositoryServiceImpl
  implements TestScriptFileRepositoryService
{
  constructor(
    private service: {
      staticDirectory: StaticDirectoryService;
      testScriptDocRendering: TestScriptDocRenderingService;
      imageFileRepository: ImageFileRepositoryService;
      timestamp: TimestampService;
    }
  ) {}

  public async write(
    testScripts: {
      pageObjects: {
        name: string;
        script: string;
      }[];
      testData: {
        name: string;
        testData: string;
      }[];
      testSuite: {
        name: string;
        spec: string;
      };
      others?: { name: string; script: string }[];
    },
    screenshots: { id: string; fileUrl: string }[]
  ): Promise<string> {
    const tmpTestScriptDirectoryPath = await this.outputScripts(testScripts);

    const screenshotFilePaths = screenshots.map(({ fileUrl }) => {
      const fileName = fileUrl.split("/").slice(-1)[0];

      return this.service.imageFileRepository.getFilePath(fileName);
    });

    await this.service.testScriptDocRendering.render(
      tmpTestScriptDirectoryPath,
      screenshotFilePaths
    );

    const zipFilePath = await new FileArchiver(tmpTestScriptDirectoryPath, {
      deleteSource: true,
    }).zip();

    await this.service.staticDirectory.moveFile(
      zipFilePath,
      path.basename(zipFilePath)
    );

    return this.service.staticDirectory.getFileUrl(path.basename(zipFilePath));
  }

  private async outputScripts(testScripts: {
    pageObjects: Array<{ name: string; script: string }>;
    testData: Array<{ name: string; testData: string }>;
    testSuite?: { name: string; spec: string };
    others?: { name: string; script: string }[];
  }) {
    const timestamp = this.service.timestamp.format("YYYYMMDD_HHmmss");

    const tmpDirPath = await fs.mkdtemp(path.join(os.tmpdir(), "latteart-"));

    const outputDirectoryPath = path.join(
      tmpDirPath,
      `test_script_${timestamp}`
    );

    await Promise.all(
      testScripts.pageObjects.map((po) => {
        const poDirPath = path.join(outputDirectoryPath, "page_objects");
        const outputPath = path.join(poDirPath, po.name);
        return fs.outputFile(outputPath, po.script);
      })
    );

    await Promise.all(
      testScripts.testData.map((testData) => {
        const testDataDirPath = path.join(outputDirectoryPath, "test_data");
        const outputPath = path.join(testDataDirPath, testData.name);
        return fs.outputFile(outputPath, testData.testData);
      })
    );

    if (testScripts.testSuite) {
      const outputPath = path.join(
        outputDirectoryPath,
        testScripts.testSuite.name
      );
      await fs.outputFile(outputPath, testScripts.testSuite.spec);
    }

    for (const other of testScripts.others ?? []) {
      await fs.outputFile(
        path.join(outputDirectoryPath, other.name),
        other.script
      );
    }

    return outputDirectoryPath;
  }
}
