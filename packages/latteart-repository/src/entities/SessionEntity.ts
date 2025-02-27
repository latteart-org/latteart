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
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AttachedFileEntity } from "./AttachedFilesEntity";
import { StoryEntity } from "./StoryEntity";
import { TestResultEntity } from "./TestResultEntity";

export type SessionEntityInitializationProps = Omit<SessionEntity, "id">;

@Entity("SESSIONS")
export class SessionEntity {
  @PrimaryGeneratedColumn("uuid", { name: "session_id" })
  id!: string;

  // @Column({ name: "tester_user_id" })
  // testUserId!: string;

  @Column({ name: "testUser" })
  testUser!: string;

  @Column({ name: "name" })
  name!: string;

  @Column({ name: "index" })
  index!: number;

  @Column({ name: "memo" })
  memo!: string;

  @Column({ name: "test_item" })
  testItem!: string;

  @Column({ name: "done_date" })
  doneDate!: string;

  @OneToMany(() => AttachedFileEntity, (attachedFile) => attachedFile.session, {
    cascade: true,
  })
  attachedFiles?: AttachedFileEntity[];

  @ManyToOne(() => StoryEntity, (story) => story.sessions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "story_id" })
  story!: StoryEntity;

  @ManyToMany(() => TestResultEntity, (testResult) => testResult.sessions, {
    onDelete: "CASCADE",
  })
  testResults!: TestResultEntity[];

  constructor(props: SessionEntityInitializationProps) {
    Object.assign(this, props);
  }
}
