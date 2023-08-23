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

import { createFileRepositoryManager } from "@/gateways/fileRepository";
import { getRepository } from "typeorm";
import path from "path";
import { VideoEntity } from "@/entities/VideoEntity";
import { Video } from "@/interfaces/Videos";
import { FileRepository } from "@/interfaces/fileRepository";

export class VideoService {
  constructor(
    private service: {
      videoFileRepository: FileRepository;
    }
  ) {}

  public async createVideo(): Promise<Video> {
    const videoRepository = getRepository(VideoEntity);

    const videoEntity = await videoRepository.save(new VideoEntity());
    videoEntity.fileUrl = this.service.videoFileRepository.getFileUrl(
      `${videoEntity.id}.webm`
    );

    await videoRepository.save(videoEntity);

    return { id: videoEntity.id, url: videoEntity.fileUrl };
  }

  public async append(videoId: string, base64: string): Promise<void> {
    const buf = Uint8Array.from(Buffer.from(base64, "base64"));

    const video = await getRepository(VideoEntity).findOneOrFail(videoId);
    const videoUrl = path.basename(video.fileUrl);

    const fileRepositoryManager = await createFileRepositoryManager();
    const videoFileRepository = fileRepositoryManager.getRepository("video");
    await videoFileRepository.appendFile(videoUrl, buf);
  }
}