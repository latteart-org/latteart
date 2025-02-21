/**
 * Copyright 2025 NTT Corporation.
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

import { createFileRepositoryManager } from "@/gateways/fileRepository";
import path from "path";
import { VideoEntity } from "@/entities/VideoEntity";
import { Video } from "@/interfaces/Videos";
import { FileRepository } from "@/interfaces/fileRepository";
import { DataSource } from "typeorm";

export class VideoService {
  constructor(
    private dataSource: DataSource,
    private service: {
      videoFileRepository: FileRepository;
    }
  ) {}

  public async createVideo(params: {
    width: number;
    height: number;
  }): Promise<Video> {
    const videoRepository = this.dataSource.getRepository(VideoEntity);

    const videoEntity = await videoRepository.save(new VideoEntity());
    videoEntity.fileUrl = this.service.videoFileRepository.getFileUrl(
      `${videoEntity.id}.webm`
    );
    videoEntity.width = params.width;
    videoEntity.height = params.height;

    await videoRepository.save(videoEntity);

    return {
      id: videoEntity.id,
      url: videoEntity.fileUrl,
      width: videoEntity.width,
      height: videoEntity.height,
    };
  }

  public async append(videoId: string, base64: string): Promise<string> {
    const buf = Uint8Array.from(Buffer.from(base64, "base64"));

    const video = await this.dataSource
      .getRepository(VideoEntity)
      .findOneByOrFail({
        id: videoId,
      });
    const videoUrl = path.basename(video.fileUrl);

    const fileRepositoryManager = await createFileRepositoryManager();
    const videoFileRepository = fileRepositoryManager.getRepository("video");
    await videoFileRepository.appendFile(videoUrl, buf);

    return videoId;
  }
}
