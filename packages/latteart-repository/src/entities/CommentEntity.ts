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
  PrimaryGeneratedColumn,
} from "typeorm";
import { TestResultEntity } from "./TestResultEntity";

@Entity("COMMENTS")
export class CommentEntity {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @ManyToOne(() => TestResultEntity, (testResult) => testResult.comments)
  @JoinColumn({ name: "test_result_id" })
  testResult?: TestResultEntity;

  @Column({ name: "value" })
  value!: string;

  @Column({ name: "timestamp" })
  timestamp!: number;

  constructor(props: Partial<Omit<CommentEntity, "id">> = {}) {
    Object.assign(this, props);
  }
}
