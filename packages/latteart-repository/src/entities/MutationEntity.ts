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
  PrimaryGeneratedColumn,
} from "typeorm";
import { ScreenshotEntity } from "./ScreenshotEntity";
import { TestResultEntity } from "./TestResultEntity";

@Entity("MUTATIONS")
export class MutationEntity {
  @PrimaryGeneratedColumn("uuid", { name: "mutation_id" })
  id!: string;

  @ManyToOne(() => TestResultEntity, (testResult) => testResult.mutations)
  @JoinColumn({ name: "test_result_id" })
  testResult?: TestResultEntity;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "element_mutations" })
  elementMutations: string = "[]";

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "timestamp", default: 0 })
  timestamp: number = 0;

  @ManyToOne(() => ScreenshotEntity, (screenshot) => screenshot.mutations)
  @JoinColumn({ name: "screenshot_id" })
  screenshot?: ScreenshotEntity;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "window_handle" })
  windowHandle: string = "";

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "scroll_position_x" })
  scrollPositionX: number = 0;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "scroll_position_y" })
  scrollPositionY: number = 0;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "client_size_width" })
  clientSizeWidth: number = 0;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ name: "client_size_height" })
  clientSizeHeight: number = 0;
}
