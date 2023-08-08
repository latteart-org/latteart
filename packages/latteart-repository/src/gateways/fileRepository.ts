/**
 * Copyright 2023 NTT Corporation.
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
import os from "os";
import { FileRepository, RepositoryName } from "@/interfaces/fileRepository";
import { publicDirPath } from "@/common";
import FileArchiver from "./FileArchiver";

export async function createFileRepositoryManager() {
  const tmpDirPath = await fs.mkdtemp(path.join(os.tmpdir(), "latteart-"));
  const fileRepositories = new Map([
    [
      "screenshot",
      new StaticDirectory(path.join(publicDirPath, "screenshots")),
    ],
    [
      "attachedFile",
      new StaticDirectory(path.join(publicDirPath, "attached-files")),
    ],
    ["snapshot", new StaticDirectory(path.join(publicDirPath, "snapshots"))],
    [
      "testScript",
      new StaticDirectory(path.join(publicDirPath, "test-scripts")),
    ],
    ["export", new StaticDirectory(path.join(publicDirPath, "exports"))],
    ["temp", new StaticDirectory(path.join(publicDirPath, "temp"))],
    ["work", new StaticDirectory(path.join(tmpDirPath, "work"))],
    ["video", new StaticDirectory(path.join(publicDirPath, "video"))],
  ]);

  return new FileRepositoryManager(fileRepositories, publicDirPath);
}

export class FileRepositoryManager {
  constructor(
    private repositoryNameToDirectory: Map<string, StaticDirectory>,
    private publicDirPath: string
  ) {}

  public getRepository(name: RepositoryName): FileRepository {
    const repositoryNameToDirectory = this.repositoryNameToDirectory;
    const directory = repositoryNameToDirectory.get(name);
    const publicDirectoryPath = this.publicDirPath;

    if (!directory) {
      throw new Error(`Not bound to any directory. : name=${name}`);
    }

    return {
      async readFile(
        relativePath: string,
        encoding?: "utf8" | "base64"
      ): Promise<string | Buffer> {
        return directory.readFile(relativePath, encoding);
      },

      async outputFile(
        relativePath: string,
        data: string | Buffer,
        encoding?: "utf8" | "base64"
      ): Promise<void> {
        return directory.outputFile(relativePath, data, encoding);
      },

      async outputJSON<T>(relativePath: string, data: T): Promise<void> {
        return directory.outputJSON(relativePath, data);
      },

      async outputZip(
        relativePath: string,
        deleteSource: boolean
      ): Promise<string> {
        return directory.outputZip(relativePath, deleteSource);
      },

      async removeFile(relativePath: string): Promise<void> {
        return directory.removeFile(relativePath);
      },

      getFileUrl(relativePath: string): string {
        const filePath = directory.getFilePath(relativePath);

        if (
          !filePath.startsWith(publicDirectoryPath) ||
          filePath.split(path.sep).includes("..")
        ) {
          throw new Error(`Not public repository. : name=${name}`);
        }

        return path
          .relative(publicDirectoryPath, filePath)
          .split(path.sep)
          .join("/");
      },

      getFilePath(relativePath: string): string {
        return directory.getFilePath(relativePath);
      },

      async moveFile(
        sourceFilePath: string,
        destRelativePath: string
      ): Promise<void> {
        return directory.moveFile(sourceFilePath, destRelativePath);
      },

      async copyFile(
        sourceFileName: string,
        destRelativePath: string,
        sourceRepositoryName: RepositoryName
      ): Promise<void> {
        const sourceDirectory =
          repositoryNameToDirectory.get(sourceRepositoryName);
        if (!sourceDirectory) {
          throw new Error("File repository not found.");
        }

        const sourceFilePath = sourceDirectory.getFilePath(sourceFileName);

        return directory.copyFile(sourceFilePath, destRelativePath);
      },

      async appendFile(relativePath: string, buf: Uint8Array): Promise<void> {
        await directory.appendFile(relativePath, buf);
      },
    };
  }
}

export class StaticDirectory {
  constructor(private staticDirPath: string) {}

  public async readFile(
    relativePath: string,
    encoding?: "utf8" | "base64"
  ): Promise<string | Buffer> {
    return fs.promises.readFile(path.join(this.staticDirPath, relativePath), {
      encoding,
    });
  }

  public async outputFile(
    relativePath: string,
    data: string | Buffer,
    encoding?: "utf8" | "base64"
  ): Promise<void> {
    const decode =
      typeof data === "string" ? Buffer.from(data, encoding) : data;
    await fs.outputFile(path.join(this.staticDirPath, relativePath), decode);
  }

  public async outputJSON<T>(relativePath: string, data: T): Promise<void> {
    await fs.outputJSON(path.join(this.staticDirPath, relativePath), data);
  }

  public async outputZip(
    relativePath: string,
    deleteSource: boolean
  ): Promise<string> {
    const dirPath = path.join(this.staticDirPath, relativePath);
    return new FileArchiver(dirPath, { deleteSource: deleteSource }).zip();
  }

  public async removeFile(relativePath: string): Promise<void> {
    await fs.remove(path.join(this.staticDirPath, relativePath));
  }

  public getFilePath(relativePath: string): string {
    return path.join(this.staticDirPath, relativePath);
  }

  public async moveFile(
    sourceFilePath: string,
    destRelativePath: string
  ): Promise<void> {
    const destFilePath = path.join(this.staticDirPath, destRelativePath);

    await fs.mkdirp(path.dirname(destFilePath));
    await fs.copyFile(sourceFilePath, destFilePath);
    await fs.remove(sourceFilePath);
  }

  public async copyFile(
    sourceFilePath: string,
    destRelativePath: string
  ): Promise<void> {
    const destFilePath = path.join(this.staticDirPath, destRelativePath);

    await fs.mkdirp(path.dirname(destFilePath));
    await fs.copyFile(sourceFilePath, destFilePath);
  }

  public async appendFile(
    relativePath: string,
    buf: Uint8Array
  ): Promise<void> {
    await fs.mkdirp(this.staticDirPath);
    return new Promise((resolve, reject) => {
      fs.appendFile(path.join(this.staticDirPath, relativePath), buf, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }
}
