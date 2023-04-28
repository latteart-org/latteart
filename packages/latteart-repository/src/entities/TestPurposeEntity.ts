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
} from "typeorm";
import { TestResultEntity } from "./TestResultEntity";
import { TestStepEntity } from "./TestStepEntity";

@Entity("TEST_PURPOSES")
export class TestPurposeEntity {
  @PrimaryGeneratedColumn("uuid", { name: "test_purpose_id" })
  id!: string;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "title" })
  title: string = "";

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "details" })
  details: string = "";

  @ManyToOne(() => TestResultEntity, (testResult) => testResult.testPurposes)
  @JoinColumn({ name: "test_result_id" })
  testResult?: TestResultEntity;

  @OneToMany(() => TestStepEntity, (testStep) => testStep.testPurpose)
  testSteps?: TestStepEntity[];

  constructor(props: Partial<Omit<TestPurposeEntity, "id">> = {}) {
    Object.assign(this, props);
  }
}
