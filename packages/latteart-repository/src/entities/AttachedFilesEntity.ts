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
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { SessionEntity } from "./SessionEntity";

@Entity("ATTACHED_FILES")
export class AttachedFileEntity {
  @ManyToOne(() => SessionEntity, (session) => session.attachedFiles, {
    primary: true,
    orphanedRowAction: "delete",
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "session_id" })
  session!: SessionEntity;

  @PrimaryColumn({ name: "name" })
  name!: string;

  @PrimaryColumn({ name: "file_url" })
  fileUrl!: string;

  @CreateDateColumn()
  createdDate?: Date;

  constructor(props: AttachedFileEntity) {
    Object.assign(this, props);
  }
}
