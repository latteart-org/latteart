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
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";
import { CoverageSourceEntity } from "./CoverageSourceEntity";
import { TestStepEntity } from "./TestStepEntity";
import { TestPurposeEntity } from "./TestPurposeEntity";
import { NoteEntity } from "./NoteEntity";
import { ScreenshotEntity } from "./ScreenshotEntity";
import { SessionEntity } from "./SessionEntity";

@Entity("TEST_RESULTS")
export class TestResultEntity {
  @PrimaryGeneratedColumn("uuid", { name: "test_result_id" })
  id!: string;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "name" })
  name: string = "";

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "start_timestamp" })
  startTimestamp: number = 0;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "last_update_timestamp" })
  lastUpdateTimestamp: number = 0;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "initial_url" })
  initialUrl: string = "";

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "parent_test_result_id", nullable: true })
  parentTestResultId?: string;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "testing_time" })
  testingTime: number = 0;

  @OneToMany(() => SessionEntity, (session) => session.testResult)
  sessions?: SessionEntity[];

  @OneToMany(() => TestStepEntity, (testStep) => testStep.testResult, {
    cascade: true,
  })
  testSteps?: TestStepEntity[];

  @RelationId((testResult: TestResultEntity) => testResult.testSteps)
  testStepIds?: string[];

  @OneToMany(
    () => CoverageSourceEntity,
    (coverageSource) => coverageSource.testResult,
    { cascade: true }
  )
  coverageSources?: CoverageSourceEntity[];

  @OneToMany(() => TestPurposeEntity, (testPurpose) => testPurpose.testResult, {
    cascade: true,
  })
  testPurposes?: TestPurposeEntity[];

  @RelationId((testResult: TestResultEntity) => testResult.testPurposes)
  testPurposeIds?: string[];

  @OneToMany(() => NoteEntity, (note) => note.testResult, {
    cascade: true,
  })
  notes?: NoteEntity[];

  @RelationId((testResult: TestResultEntity) => testResult.notes)
  noteIds?: string[];

  @OneToMany(() => ScreenshotEntity, (screenshot) => screenshot.testResult, {
    cascade: true,
  })
  screenshots?: ScreenshotEntity[];

  @RelationId((testResult: TestResultEntity) => testResult.screenshots)
  screenshotIds?: string[];

  constructor(
    props: Partial<
      Omit<
        TestResultEntity,
        "id" | "testStepIds" | "testPurposeIds" | "noteIds" | "screenshotIds"
      >
    > = {}
  ) {
    Object.assign(this, props);
  }
}
