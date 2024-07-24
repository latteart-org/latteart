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
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("TEST_HINT_PROPS")
export class TestHintPropEntity {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column({ name: "title" })
  title!: string;

  @Column({ name: "type" })
  type!: string;

  @Column({ name: "list_items" })
  listItems!: string;

  @Column({ name: "index" })
  index!: number;

  constructor(param?: {
    id?: string;
    title: string;
    type: string;
    listItems: string;
    index: number;
  }) {
    if (param) {
      Object.assign(this, param);
    }
  }
}
