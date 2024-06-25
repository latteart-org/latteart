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

import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProjectEntity } from "./ProjectEntity";
import { StoryEntity } from "./StoryEntity";
import { TestTargetGroupEntity } from "./TestTargetGroupEntity";
import { ViewPointEntity } from "./ViewPointEntity";

@Entity("TEST_MATRICES")
export class TestMatrixEntity {
  @PrimaryGeneratedColumn("uuid", { name: "test_matrix_id" })
  id!: string;

  @ManyToOne(() => ProjectEntity, (project) => project.testMatrices)
  @JoinColumn({ name: "project_id" })
  project!: ProjectEntity;

  @Column({ name: "name" })
  name!: string;

  @Column({ name: "index" })
  index!: number;

  @OneToMany(
    () => TestTargetGroupEntity,
    (testTargetGroup) => testTargetGroup.testMatrix,
    { cascade: ["remove"] }
  )
  testTargetGroups!: TestTargetGroupEntity[];

  @ManyToMany(() => ViewPointEntity, (viewPoint) => viewPoint.testMatrices, {
    cascade: ["remove"],
  })
  viewPoints!: ViewPointEntity[];

  @OneToMany(() => StoryEntity, (story) => story.testMatrix, {
    cascade: ["remove"],
  })
  stories!: StoryEntity[];

  public sortedViewPoint(): {
    id: string;
    name: string;
    description?: string;
    index: number;
    createdAt?: Date;
    testMatrices: TestMatrixEntity[];
    stories: StoryEntity[];
  }[] {
    return this.viewPoints
      .sort((v1, v2) => {
        if (v1.index === undefined && v2.index === undefined) {
          return (v1.createdAt as Date).toString() >=
            (v2.createdAt as Date).toString()
            ? 1
            : -1;
        }
        if (v1.index === undefined) {
          return 1;
        }
        if (v2.index === undefined) {
          return -1;
        }
        return v1.index - v2.index;
      })
      .map((viewPoint, index) => {
        return {
          ...viewPoint,
          index,
        };
      });
  }

  constructor(name: string, index: number, project: ProjectEntity) {
    this.name = name;
    this.index = index;
    this.project = project;
  }
}
