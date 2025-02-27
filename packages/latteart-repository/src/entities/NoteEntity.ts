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
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";
import { ScreenshotEntity } from "./ScreenshotEntity";
import { TagEntity } from "./TagEntity";
import { TestResultEntity } from "./TestResultEntity";
import { TestStepEntity } from "./TestStepEntity";
import { VideoEntity } from "./VideoEntity";

@Entity("NOTES")
export class NoteEntity {
  @PrimaryGeneratedColumn("uuid", { name: "note_id" })
  id!: string;

  @Column({ name: "value" })
  value: string = "";

  @Column({ name: "details" })
  details: string = "";

  @Column({ name: "timestamp", default: 0 })
  timestamp: number = 0;

  @ManyToOne(() => TestResultEntity, (testResult) => testResult.notes)
  @JoinColumn({ name: "test_result_id" })
  testResult?: TestResultEntity;

  @RelationId((note: NoteEntity) => note.testResult)
  testResultId?: string;

  @ManyToMany(() => TagEntity, (tag) => tag.notes, { cascade: true })
  @JoinTable({
    name: "NOTE_TAG_RELATIONS",
    joinColumn: { name: "note_id" },
    inverseJoinColumn: { name: "tag_id" },
  })
  tags?: TagEntity[];

  @ManyToMany(() => TestStepEntity, (testStep) => testStep.notes)
  @JoinTable({
    name: "TEST_STEP_NOTE_RELATIONS",
    joinColumn: { name: "note_id" },
    inverseJoinColumn: { name: "test_step_id" },
  })
  testSteps?: TestStepEntity[];

  @OneToOne(() => ScreenshotEntity, (screenshot) => screenshot.note, {
    cascade: true,
  })
  @JoinColumn({ name: "screenshot_id" })
  screenshot?: ScreenshotEntity;

  @ManyToOne(() => VideoEntity, (video) => video.note, {
    cascade: true,
  })
  @JoinColumn({ name: "video_id" })
  video?: VideoEntity;

  @Column({ name: "video_time", nullable: true })
  videoTime?: number = 0;

  constructor(props: Partial<Omit<NoteEntity, "id">> = {}) {
    Object.assign(this, props);
  }
}
