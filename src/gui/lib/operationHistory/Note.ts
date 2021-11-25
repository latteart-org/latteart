/**
 * Copyright 2021 NTT Corporation.
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

import moment from "moment";

/**
 * Note class
 */
export class Note {
  /**
   * Create a new Note from an existing Note.
   * @param args.other  Existing Note.
   * @param args.overrideParams.id  Note id.
   * @param args.overrideParams.sequence  Linked test steps.
   * @param args.overrideParams.value
   * @param args.overrideParams.details
   * @param args.overrideParams.imageFilePath  Image file path.
   * @param args.overrideParams.compressedImageFilePath  Compressed image file path.
   * @returns Newly created Note.
   */
  public static createFromOtherNote(args: {
    other: Note;
    overrideParams?: {
      id?: number;
      sequence?: number;
      value?: string;
      details?: string;
      imageFilePath?: string;
      compressedImageFilePath?: string;
      tags?: string[];
    };
  }): Note {
    return new Note({
      id: args.overrideParams?.id ?? args.other.id,
      sequence: args.overrideParams?.sequence ?? args.other.sequence,
      value: args.overrideParams?.value ?? args.other.value,
      details: args.overrideParams?.details ?? args.other.details,
      imageFilePath:
        args.overrideParams?.imageFilePath ?? args.other.imageFilePath,
      compressedImageFilePath:
        args.overrideParams?.compressedImageFilePath ??
        args.other.compressedImageFilePath,
      tags: args.overrideParams?.tags ?? args.other.tags,
    });
  }

  /**
   * Note id.
   */
  public id?: number;

  /**
   * Sequence number of the associated test step.
   */
  public sequence: number;

  /**
   * Value.
   */
  public value: string;

  /**
   * Details.
   */
  public details: string;

  /**
   * Image file path.
   */
  public imageFilePath: string;

  /**
   * Creation time.
   */
  public timestamp: string;

  /**
   * Compressed image file path.
   */
  public compressedImageFilePath?: string;

  /**
   * Tags.
   */
  public tags: string[];

  /**
   * Constructor.
   * @param args.id  Note id.
   * @param args.sequence  Sequence number of the associated test step.
   * @param args.value
   * @param args.details
   * @param args.imageFilePath  Image file path.
   * @param args.timestamp  Creation time.
   * @param args.compressedImageFilePath  Compressed image file path.
   */
  constructor(args: {
    id?: number;
    sequence?: number;
    value?: string;
    details?: string;
    imageFilePath?: string;
    timestamp?: string;
    compressedImageFilePath?: string;
    tags?: string[];
  }) {
    this.id = args.id ?? 0;
    this.sequence = args.sequence ?? 0;
    this.value = args.value ?? "";
    this.details = args.details ?? "";
    this.imageFilePath = args.imageFilePath ?? "";
    this.timestamp = args.timestamp ?? moment().unix().toString();
    this.tags = args.tags ?? [];

    if (args !== undefined && args.compressedImageFilePath !== undefined) {
      this.compressedImageFilePath = args.compressedImageFilePath;
    }
  }
}
