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
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { StoryEntity } from "./StoryEntity";
import { TestMatrixEntity } from "./TestMatrixEntity";

@Entity("VIEW_POINTS")
export class ViewPointEntity {
  @PrimaryGeneratedColumn("uuid", { name: "view_point_id" })
  id!: string;

  @Column({ name: "name" })
  name!: string;

  @Column({ name: "description" })
  description?: string;

  @Column({ name: "index", nullable: true })
  index?: number;

  @CreateDateColumn({ name: "created_at" })
  readonly createdAt?: Date;

  @ManyToMany(() => TestMatrixEntity, (testMatrix) => testMatrix.viewPoints, {
    onDelete: "CASCADE",
  })
  @JoinTable({
    name: "VIEW_POINTS_TEST_MATRICES_RELATIONS",
    joinColumn: { name: "view_point_id" },
    inverseJoinColumn: { name: "test_matrix_id" },
  })
  testMatrices!: TestMatrixEntity[];

  @OneToMany(() => StoryEntity, (story) => story.viewPoint)
  stories!: StoryEntity[];
}
