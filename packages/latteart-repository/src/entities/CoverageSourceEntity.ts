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
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TestResultEntity } from "./TestResultEntity";

@Entity("COVERAGE_SOURCES")
export class CoverageSourceEntity {
  @PrimaryGeneratedColumn({ name: "coverage_source_id" })
  id!: string;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "title" })
  title: string = "";

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "url" })
  url: string = "";

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "screen_elements" })
  screenElements: string = "[]";

  @ManyToOne(() => TestResultEntity, (testResult) => testResult.coverageSources)
  @JoinColumn({ name: "test_result_id" })
  testResult?: TestResultEntity;

  constructor(props: Partial<Omit<CoverageSourceEntity, "id">> = {}) {
    Object.assign(this, props);
  }
}
