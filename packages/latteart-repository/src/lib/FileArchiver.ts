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

import fs from "fs-extra";
import path from "path";
import archiver from "archiver";
import encoding from "encoding-japanese";

/**
 * Class to compress files.
 */
export default class FileArchiver {
  private sourcePath: string;
  private option: {
    outputPath?: string;
    deleteSource: boolean;
  };

  /**
   * constructor
   * @param sourcePath  File path to compress
   * @param option.outputPath  Output destination path
   * @param option.deleteSource  Delete the compressed source file
   */
  constructor(
    sourcePath: string,
    option?: {
      outputPath?: string;
      deleteSource?: boolean;
    }
  ) {
    this.sourcePath = sourcePath;
    this.option = {
      outputPath: option?.outputPath,
      deleteSource: option?.deleteSource ?? false,
    };
  }

  /**
   * Compress the file
   * @returns File path of the compressed file
   */
  public async zip(): Promise<string> {
    const sourceIsDirectory = (await fs.stat(this.sourcePath)).isDirectory();

    const defaultZipFilePath = `${
      sourceIsDirectory ? this.sourcePath : path.dirname(this.sourcePath)
    }.zip`;
    const zipFilePath = this.option.outputPath ?? defaultZipFilePath;

    const writeStream = fs.createWriteStream(zipFilePath);

    const archive = archiver("zip", { zlib: { level: 1 } });

    await new Promise<void>((resolve) => {
      archive.pipe(writeStream).on("close", () => {
        resolve();
      });

      const buffer = Buffer.alloc(this.sourcePath.length);
      buffer.write(this.sourcePath);
      const decordedSourcePath = String.fromCharCode(
        ...encoding.convert(buffer, "UNICODE")
      );

      if (sourceIsDirectory) {
        archive.directory(decordedSourcePath, false);
      } else {
        archive.file(decordedSourcePath, {
          name: path.basename(decordedSourcePath),
        });
      }

      archive.finalize();
    });

    if (this.option.deleteSource) {
      await fs.remove(this.sourcePath);
    }

    return zipFilePath;
  }
}
