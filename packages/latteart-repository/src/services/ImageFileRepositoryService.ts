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

import LoggingService from "@/logger/LoggingService";
import { StaticDirectoryService } from "./StaticDirectoryService";

export interface ImageFileRepositoryService {
  /**
   * Write image buffer to file.
   * @param fileName  file name
   * @param imageData  image buffer
   * @returns file url
   */
  writeBufferToFile(fileName: string, imageData: Buffer): Promise<string>;

  /**
   * Write base64 encoded image to file.
   * @param fileName  file name
   * @param imageData  base64 encoded image data
   * @returns file url
   */
  writeBase64ToFile(fileName: string, imageData: string): Promise<string>;

  /**
   * Remove image.
   * @param fileName image file name
   */
  removeFile(fileName: string): void;

  /**
   * Get image file path.
   * @returns image file path
   */
  getFilePath(fileName: string): string;

  /**
   * Get image file url.
   * @returns image file url
   */
  getFileUrl(fileName: string): string;
}

export class ImageFileRepositoryServiceImpl
  implements ImageFileRepositoryService
{
  constructor(
    private service: {
      staticDirectory: StaticDirectoryService;
    }
  ) {}

  public async writeBufferToFile(
    fileName: string,
    imageData: Buffer
  ): Promise<string> {
    await this.service.staticDirectory.outputFile(fileName, imageData);

    return this.service.staticDirectory.getFileUrl(fileName);
  }

  public async writeBase64ToFile(
    fileName: string,
    imageData: string
  ): Promise<string> {
    if (fileName === "" || imageData === "") {
      return "";
    }

    const decode = Buffer.from(imageData, "base64");

    return this.writeBufferToFile(fileName, decode);
  }

  public async removeFile(fileName: string): Promise<void> {
    await this.service.staticDirectory.removeFile(fileName);

    LoggingService.debug("remove succeeded");
  }

  public getFilePath(fileName: string): string {
    return this.service.staticDirectory.getJoinedPath(fileName);
  }

  public getFileUrl(fileName: string): string {
    return this.service.staticDirectory.getFileUrl(fileName);
  }
}
