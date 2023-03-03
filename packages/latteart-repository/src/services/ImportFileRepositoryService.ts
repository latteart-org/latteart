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
import { readZip } from "@/gateways/zipReader";

export interface ImportFileRepositoryService {
  readImportFile(base64FileData: string): Promise<{
    testResultFile: { fileName: string; data: string };
    screenshots: { filePath: string; data: Buffer }[];
  }>;
}

export class ImportFileRepositoryServiceImpl
  implements ImportFileRepositoryService
{
  public async readImportFile(base64FileData: string): Promise<{
    testResultFile: { fileName: string; data: string };
    screenshots: { filePath: string; data: Buffer }[];
  }> {
    const decoded = Buffer.from(base64FileData, "base64");
    const files = await readZip(decoded);

    const testResultFile = files.find((file) => file.filePath === "log.json");

    if (!testResultFile || typeof testResultFile.data !== "string") {
      throw Error("Invalid test result file.");
    }

    const screenshots = files.filter(
      (file): file is { filePath: string; data: Buffer } => {
        return (
          [".png", ".webp"].includes(path.extname(file.filePath)) &&
          typeof file.data !== "string"
        );
      }
    );

    return {
      testResultFile: {
        fileName: testResultFile.filePath,
        data: testResultFile.data,
      },
      screenshots,
    };
  }
}
