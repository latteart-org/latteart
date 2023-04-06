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

import AdmZip from "adm-zip";
import path from "path";

export async function readZip(
  filePathOrRawData: string | Buffer
): Promise<{ filePath: string; data: Buffer | string }[]> {
  const zip = new AdmZip(filePathOrRawData);

  const entries = zip.getEntries();

  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory) {
      continue;
    }
    const data = await new Promise<Buffer>((resolve, rejects) =>
      entry.getDataAsync((data, err) => {
        if (err) {
          rejects(err);
        } else {
          resolve(data);
        }
      })
    );
    const entryIsText = (entryName: string) => {
      return [".json", ".yaml", ".js", ".ts", ".txt", ".md"].includes(
        path.extname(entryName)
      );
    };

    files.push({
      filePath: entry.entryName,
      data: entryIsText(entry.entryName) ? data.toString("utf8") : data,
    });
  }

  return files;
}
