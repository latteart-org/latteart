/**
 * Copyright 2022 NTT Corporation.
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

@Entity("TEST_STEPS")
export class TestStepEntity {
  @PrimaryGeneratedColumn("uuid", { name: "test_step_id" })
  id!: string;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "window_handle" })
  windowHandle: string = "";

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "page_title" })
  pageTitle: string = "";

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "page_url" })
  pageUrl: string = "";

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "keyword_texts" })
  keywordTexts: string = "[]";

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "operation_type" })
  operationType: string = "";

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "operation_input" })
  operationInput: string = "";

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "operation_element" })
  operationElement: string = "{}";

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
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

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "timestamp" })
  timestamp: number = 0;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
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

  constructor(
    props: Partial<Omit<TestStepEntity, "id" | "testResultId">> = {}
  ) {
    Object.assign(this, props);
  }
}
