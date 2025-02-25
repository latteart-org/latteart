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
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";
import { NoteEntity } from "./NoteEntity";
import { ScreenshotEntity } from "./ScreenshotEntity";
import { TestPurposeEntity } from "./TestPurposeEntity";
import { TestResultEntity } from "./TestResultEntity";
import { VideoEntity } from "./VideoEntity";

@Entity("TEST_STEPS")
export class TestStepEntity {
  @PrimaryGeneratedColumn("uuid", { name: "test_step_id" })
  id!: string;

  @Column({ name: "window_handle" })
  windowHandle: string = "";

  @Column({ name: "page_title" })
  pageTitle: string = "";

  @Column({ name: "page_url" })
  pageUrl: string = "";

  @Column({ name: "keyword_texts" })
  keywordTexts: string = "[]";

  @Column({ name: "operation_type" })
  operationType: string = "";

  @Column({ name: "operation_input" })
  operationInput: string = "";

  @Column({ name: "operation_element" })
  operationElement: string = "{}";

  @Column({ name: "input_elements" })
  inputElements: string = "[]";

  @Column({ name: "scroll_position_x", nullable: true })
  scrollPositionX?: number;

  @Column({ name: "scroll_position_y", nullable: true })
  scrollPositionY?: number;

  @Column({ name: "client_size_width", nullable: true })
  clientSizeWidth?: number;

  @Column({ name: "client_size_height", nullable: true })
  clientSizeHeight?: number;

  @Column({ name: "timestamp" })
  timestamp: number = 0;

  @Column({ name: "is_automatic", nullable: true, default: false })
  isAutomatic: boolean = false;

  @ManyToOne(() => TestResultEntity, (testResult) => testResult.testSteps)
  @JoinColumn({ name: "test_result_id" })
  testResult?: TestResultEntity;

  @RelationId((testStep: TestStepEntity) => testStep.testResult)
  testResultId?: string;

  @ManyToOne(() => TestPurposeEntity, (testPurpose) => testPurpose.testSteps, {
    cascade: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "test_purpose_id" })
  testPurpose?: TestPurposeEntity | null;

  @ManyToMany(() => NoteEntity, (note) => note.testSteps, {
    cascade: true,
  })
  notes?: NoteEntity[];

  @OneToOne(() => ScreenshotEntity, (screenshot) => screenshot.testStep, {
    cascade: true,
  })
  @JoinColumn({ name: "screenshot_id" })
  screenshot?: ScreenshotEntity;

  @ManyToOne(() => VideoEntity, (video) => video.testStep, {
    cascade: true,
  })
  @JoinColumn({ name: "video_id" })
  video?: VideoEntity;

  @Column({ name: "video_time", nullable: true })
  videoTime?: number = 0;

  constructor(
    props: Partial<Omit<TestStepEntity, "id" | "testResultId">> = {}
  ) {
    Object.assign(this, props);
  }
}
