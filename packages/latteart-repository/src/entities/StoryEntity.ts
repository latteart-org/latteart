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
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";
import { SessionEntity } from "./SessionEntity";
import { TestMatrixEntity } from "./TestMatrixEntity";
import { TestProgressEntity } from "./TestProgressEntity";
import { TestTargetEntity } from "./TestTargetEntity";
import { ViewPointEntity } from "./ViewPointEntity";

@Entity("STORIES")
export class StoryEntity {
  @PrimaryGeneratedColumn("uuid", { name: "story_id" })
  id!: string;

  @Column({ name: "index " })
  index!: number;

  @Column({ name: "status" })
  status!: string;

  @Column({ name: "planed_session_number" })
  planedSessionNumber!: number;

  @ManyToOne(() => TestMatrixEntity, (testMatrix) => testMatrix.stories, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "test_matrix_id" })
  testMatrix!: TestMatrixEntity;

  @RelationId((story: StoryEntity) => story.testMatrix)
  testMatrixId!: string;

  @ManyToOne(() => ViewPointEntity, (viewPoint) => viewPoint.stories, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "view_point_id" })
  viewPoint!: ViewPointEntity;

  @RelationId((story: StoryEntity) => story.viewPoint)
  viewPointId!: string;

  @ManyToOne(() => TestTargetEntity, (testTarget) => testTarget.stories, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "test_target_id" })
  testTarget!: TestTargetEntity;

  @RelationId((story: StoryEntity) => story.testTarget)
  testTargetId!: string;

  @OneToMany(() => SessionEntity, (session) => session.story)
  sessions!: SessionEntity[];

  @OneToMany(() => TestProgressEntity, (testProgress) => testProgress.story)
  testProgresses!: TestProgressEntity[];
}
