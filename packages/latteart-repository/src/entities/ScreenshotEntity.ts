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
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { NoteEntity } from "./NoteEntity";
import { TestStepEntity } from "./TestStepEntity";
import { MutationEntity } from "./MutationEntity";

@Entity("SCREENSHOTS")
export class ScreenshotEntity {
  @PrimaryGeneratedColumn("uuid", { name: "screenshot_id" })
  id!: string;

  @Column({ name: "file_url" })
  fileUrl: string = "";

  @OneToOne(() => TestStepEntity, (testStep) => testStep.screenshot)
  testStep?: TestStepEntity;

  @OneToOne(() => NoteEntity, (note) => note.screenshot)
  note?: NoteEntity;

  @OneToMany(() => MutationEntity, (mutation) => mutation.screenshot, {
    cascade: true,
  })
  mutations?: MutationEntity[];

  constructor(props: Partial<Omit<ScreenshotEntity, "id">> = {}) {
    Object.assign(this, props);
  }
}
