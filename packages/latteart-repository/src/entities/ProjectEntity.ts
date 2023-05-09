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

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SnapshotEntity } from "./SnapshotEntity";
import { TestMatrixEntity } from "./TestMatrixEntity";
import { ViewPointPresetEntity } from "./ViewPointPresetEntity";

@Entity("PROJECTS")
export class ProjectEntity {
  @PrimaryGeneratedColumn("uuid", { name: "project_id" })
  id!: string;

  @Column({ name: "name" })
  name!: string;

  @OneToMany(() => SnapshotEntity, (snapshot) => snapshot.project)
  snapshots!: SnapshotEntity[];

  @OneToMany(
    () => ViewPointPresetEntity,
    (viewPointPreset) => viewPointPreset.project
  )
  viewPointPresets!: ViewPointPresetEntity[];

  @OneToMany(
    () => TestMatrixEntity,
    (testMatrixEntity) => testMatrixEntity.project
  )
  testMatrices!: TestMatrixEntity[];

  @CreateDateColumn({ name: "created_at" })
  readonly createdAt?: Date;

  constructor(name: string) {
    this.name = name;
  }
}
