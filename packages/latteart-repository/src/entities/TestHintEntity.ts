/**
 * Copyright 2024 NTT Corporation.
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
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("TEST_HINT")
export class TestHintEntity {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column({ name: "value" })
  value!: string;

  @Column({ name: "test_matrix_name", default: "" })
  testMatrixName!: string;

  @Column({ name: "group_name", default: "" })
  groupName!: string;

  @Column({ name: "test_target_name", default: "" })
  testTargetName!: string;

  @Column({ name: "view_point_name", default: "" })
  viewPointName!: string;

  @Column({ name: "customs" })
  customs!: string;

  @Column({ name: "tags" })
  commentWords!: string;

  @Column({ name: "operation_elements", default: "" })
  operationElements!: string;

  @CreateDateColumn({ name: "created_at" })
  readonly createdAt!: Date;
}
