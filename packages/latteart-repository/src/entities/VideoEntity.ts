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

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { NoteEntity } from "./NoteEntity";
import { TestStepEntity } from "./TestStepEntity";

@Entity("VIDEOS")
export class VideoEntity {
  @PrimaryGeneratedColumn("uuid", { name: "video_id" })
  id!: string;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "file_url" })
  fileUrl: string = "";

  @OneToMany(() => TestStepEntity, (testStep) => testStep.video)
  testStep?: TestStepEntity;

  @OneToMany(() => NoteEntity, (note) => note.video)
  note?: NoteEntity;

  constructor(props: Partial<Omit<VideoEntity, "id">> = {}) {
    Object.assign(this, props);
  }
}
