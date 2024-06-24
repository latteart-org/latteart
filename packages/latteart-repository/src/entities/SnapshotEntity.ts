/**
 * Copyright 2024 NTT Corporation.
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

import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ProjectEntity } from "./ProjectEntity";

@Entity("SNAPSHOTS")
export class SnapshotEntity {
  @PrimaryColumn({ name: "project_id" })
  projectId!: string;

  @ManyToOne(() => ProjectEntity, (project) => project.snapshots)
  @JoinColumn({ name: "project_id" })
  project!: ProjectEntity;

  @Column({ name: "timestamp" })
  timestamp!: string;

  constructor(props: SnapshotEntity) {
    Object.assign(this, props);
  }
}
