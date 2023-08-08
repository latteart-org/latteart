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

import { VideoFrame } from "latteart-client";
import { TimestampImpl } from "../common/Timestamp";

/**
 * Note class
 */
export class NoteForGUI {
  /**
   * Create a new Note from an existing Note.
   * @param args.other  Existing Note.
   * @param args.overrideParams.id  Note id.
   * @param args.overrideParams.sequence  Linked test steps.
   * @param args.overrideParams.value
   * @param args.overrideParams.details
   * @param args.overrideParams.imageFilePath  Image file path.
   * @param args.overrideParams.compressedImageFilePath  Compressed image file path.
   * @param args.overrideParams.tags  Tags.
   * @param args.overrideParams.videoFrame  VideoFrame.
   * @returns Newly created Note.
   */
  public static createFromOtherNote(args: {
    other: NoteForGUI;
    overrideParams?: {
      id?: string;
      sequence?: number;
      value?: string;
      details?: string;
      imageFilePath?: string;
      compressedImageFilePath?: string;
      tags?: string[];
      videoFrame?: VideoFrame;
    };
  }): NoteForGUI {
    return new NoteForGUI({
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
      videoFrame: args.overrideParams?.videoFrame ?? args.other.videoFrame,
    });
  }

  /**
   * Note id.
   */
  public id?: string;

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
   * VideoFrame.
   */
  public videoFrame?: VideoFrame;

  /**
   * Constructor.
   * @param args.id  Note id.
   * @param args.sequence  Sequence number of the associated test step.
   * @param args.value
   * @param args.details
   * @param args.imageFilePath  Image file path.
   * @param args.timestamp  Creation time.
   * @param args.compressedImageFilePath  Compressed image file path.
   * @param args.tags  Tags.
   * @param args.videoFrame  VideoFrame.
   */
  constructor(args: {
    id?: string;
    sequence?: number;
    value?: string;
    details?: string;
    imageFilePath?: string;
    timestamp?: string;
    compressedImageFilePath?: string;
    tags?: string[];
    videoFrame?: VideoFrame;
  }) {
    this.id = args.id ?? "";
    this.sequence = args.sequence ?? 0;
    this.value = args.value ?? "";
    this.details = args.details ?? "";
    this.imageFilePath = args.imageFilePath ?? "";
    this.timestamp = args.timestamp ?? new TimestampImpl().unix().toString();
    this.tags = args.tags ?? [];
    this.videoFrame = args.videoFrame;

    if (args !== undefined && args.compressedImageFilePath !== undefined) {
      this.compressedImageFilePath = args.compressedImageFilePath;
    }
  }
}
