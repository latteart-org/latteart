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

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { StoryEntity } from "./StoryEntity";
import { TestTargetGroupEntity } from "./TestTargetGroupEntity";

@Entity("TEST_TARGETS")
export class TestTargetEntity {
  @PrimaryGeneratedColumn("uuid", { name: "test_target_id" })
  id!: string;

  @Column({ name: "name" })
  name!: string;

  @Column({ name: "index" })
  index!: number;

  @Column({ name: "plans" })
  text!: string;

  @ManyToOne(
    () => TestTargetGroupEntity,
    (testTargetGroup) => testTargetGroup.testTargets,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "test_target_group_id" })
  testTargetGroup!: TestTargetGroupEntity;

  @OneToMany(() => StoryEntity, (story) => story.testTarget)
  stories!: StoryEntity[];
}
