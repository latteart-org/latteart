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

import { SnapshotConfig } from "@/interfaces/Configs";
import { CreateResponse } from "@/interfaces/Snapshots";
import { ProjectsServiceImpl } from "./ProjectsService";
import { SnapshotFileRepositoryService } from "./SnapshotFileRepositoryService";

export class SnapshotsService {
  constructor(
    private service: {
      snapshotFileRepository: SnapshotFileRepositoryService;
      project: ProjectsServiceImpl;
    }
  ) {}

  public async createSnapshot(
    projectId: string,
    snapshotConfig: SnapshotConfig
  ): Promise<CreateResponse> {
    console.log(projectId);

    const project = await this.service.project.getProject(projectId);

    const url = await this.service.snapshotFileRepository.write(
      project,
      snapshotConfig
    );

    return {
      url,
    };
  }
}
