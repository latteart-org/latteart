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
import { TimestampService } from "./TimestampService";
import { FileRepository } from "@/interfaces/fileRepository";

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
      testScriptRepository: FileRepository;
      testScriptDocRendering: TestScriptDocRenderingService;
      screenshotFileRepository: FileRepository;
      workingFileRepository: FileRepository;
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
    const testScriptDirName = await this.outputScripts(testScripts);

    const screenshotFileNames = screenshots.map(({ fileUrl }) => {
      return fileUrl.split("/").slice(-1)[0];
    });

    await this.service.testScriptDocRendering.render(
      this.service.workingFileRepository,
      testScriptDirName,
      screenshotFileNames
    );

    const zipFilePath = await this.service.workingFileRepository.outputZip(
      testScriptDirName,
      true
    );

    await this.service.testScriptRepository.moveFile(
      zipFilePath,
      path.basename(zipFilePath)
    );

    return this.service.testScriptRepository.getFileUrl(
      path.basename(zipFilePath)
    );
  }

  private async outputScripts(testScripts: {
    pageObjects: Array<{ name: string; script: string }>;
    testData: Array<{ name: string; testData: string }>;
    testSuite?: { name: string; spec: string };
    others?: { name: string; script: string }[];
  }) {
    const timestamp = this.service.timestamp.format("YYYYMMDD_HHmmss");
    const outputDirName = `test_script_${timestamp}`;

    await Promise.all(
      testScripts.pageObjects.map((po) => {
        const poPath = path.join(outputDirName, "page_objects", po.name);
        return this.service.workingFileRepository.outputFile(poPath, po.script);
      })
    );

    await Promise.all(
      testScripts.testData.map((testData) => {
        const testDataPath = path.join(
          outputDirName,
          "test_data",
          testData.name
        );
        return this.service.workingFileRepository.outputFile(
          testDataPath,
          testData.testData
        );
      })
    );

    if (testScripts.testSuite) {
      await this.service.workingFileRepository.outputFile(
        path.join(outputDirName, testScripts.testSuite.name),
        testScripts.testSuite.spec
      );
    }

    for (const other of testScripts.others ?? []) {
      await this.service.workingFileRepository.outputFile(
        path.join(outputDirName, other.name),
        other.script
      );
    }

    return outputDirName;
  }
}
