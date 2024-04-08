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

import { TimestampImpl } from "../common/Timestamp";
import { convertInputValue } from "../common/util";
import { type ElementInfo, type VideoFrame } from "latteart-client";

/**
 * Class that handles operation information.
 */
export class OperationForGUI {
  /**
   * Create operation information.
   * @param args.sequence  Sequence number.
   * @param args.input  Input value.
   * @param args.type  Operation type.
   * @param args.elementInfo  Tag information to be operated.
   * @param args.title  Title of operation target.
   * @param args.url  URL to be operated.
   * @param args.screenDef  Screen definition.
   * @param args.imageFilePath  Screen image path.
   * @param args.windowHandle  Id of windowHandle that operated the screen.
   * @param args.timestamp  Time of operation.
   * @param args.compressedImageFilePath  Compressed image file path.
   * @param args.inputElements  Input information.
   * @param args.isAutomatic  Automatic or not.
   * @param args.videoFrame VideoFrame.
   */
  public static createOperation(args: {
    sequence?: number;
    input?: string;
    type?: string;
    elementInfo?: ElementInfo | null;
    title?: string;
    url?: string;
    screenDef?: string;
    imageFilePath?: string;
    windowHandle?: string;
    timestamp?: string;
    compressedImageFilePath?: string;
    inputElements?: ElementInfo[];
    keywordSet?: Set<string>;
    isAutomatic: boolean;
    videoFrame?: VideoFrame;
  }): OperationForGUI {
    const operation = new OperationForGUI(
      args.sequence ?? 1,
      args.input ?? "",
      args.type ?? "",
      args.elementInfo ?? null,
      args.title ?? "",
      args.url ?? "",
      args.screenDef ?? "",
      args.imageFilePath ?? "",
      args.isAutomatic,
      args.windowHandle,
      args.keywordSet
    );

    if (args.timestamp !== undefined) {
      operation.timestamp = args.timestamp;
    }

    if (args.compressedImageFilePath !== undefined) {
      operation.compressedImageFilePath = args.compressedImageFilePath;
    }

    if (args.inputElements !== undefined) {
      operation.inputElements = args.inputElements;
    }

    if (args.videoFrame !== undefined) {
      operation.videoFrame = args.videoFrame;
    }

    return operation;
  }

  /**
   * Create new operation information from existing operation information.
   * @param args.other  Existing operation information.
   * @param args.overrideParams.sequence  Sequence number.
   * @param args.overrideParams.input  Input value.
   * @param args.overrideParams.type  Operation type.
   * @param args.overrideParams.elementInfo  Tag information to be operated.
   * @param args.overrideParams.title  Title of operation target.
   * @param args.overrideParams.url  URL to be operated.
   * @param args.overrideParams.screenDef  Screen definition.
   * @param args.overrideParams.imageFilePath  Screen image path.
   * @param args.overrideParams.windowHandle  Screen image path.
   * @param args.overrideParams.timestamp  Time of operation.
   * @param args.overrideParams.compressedImageFilePath  Compressed image file path.
   * @param args.overrideparams.inputElements  Input information.
   * @param args.overrideparams.isAutomatic  Automatic or not.
   * @param args.overrideparams.videoFrame videoFrame.
   */
  public static createFromOtherOperation(args: {
    other: OperationForGUI;
    overrideParams?: {
      sequence?: number;
      input?: string;
      type?: string;
      elementInfo?: ElementInfo | null;
      title?: string;
      url?: string;
      screenDef?: string;
      imageFilePath?: string;
      windowHandle?: string;
      timestamp?: string;
      compressedImageFilePath?: string;
      inputElements?: ElementInfo[];
      keywordSet?: Set<string>;
      isAutomatic?: boolean;
      videoFrame?: VideoFrame;
    };
  }): OperationForGUI {
    if (args.overrideParams === undefined) {
      const newOperation = new OperationForGUI(
        args.other.sequence,
        args.other.input,
        args.other.type,
        args.other.elementInfo,
        args.other.title,
        args.other.url,
        args.other.screenDef,
        args.other.imageFilePath,
        args.other.isAutomatic,
        args.other.windowHandle,
        args.other.keywordSet,
        args.other.videoFrame
      );
      newOperation.timestamp = args.other.timestamp;
      newOperation.compressedImageFilePath = args.other.compressedImageFilePath;
      newOperation.inputElements = args.other.inputElements;
      return newOperation;
    }

    const newOperation2 = new OperationForGUI(
      args.overrideParams.sequence !== undefined
        ? args.overrideParams.sequence
        : args.other.sequence,
      args.overrideParams.input !== undefined ? args.overrideParams.input : args.other.input,
      args.overrideParams.type !== undefined ? args.overrideParams.type : args.other.type,
      args.overrideParams.elementInfo !== undefined
        ? args.overrideParams.elementInfo
        : args.other.elementInfo,
      args.overrideParams.title !== undefined ? args.overrideParams.title : args.other.title,
      args.overrideParams.url !== undefined ? args.overrideParams.url : args.other.url,
      args.overrideParams.screenDef !== undefined
        ? args.overrideParams.screenDef
        : args.other.screenDef,
      args.overrideParams.imageFilePath !== undefined
        ? args.overrideParams.imageFilePath
        : args.other.imageFilePath,
      args.overrideParams.isAutomatic ?? args.other.isAutomatic,
      args.overrideParams.windowHandle !== undefined
        ? args.overrideParams.windowHandle
        : args.other.windowHandle,
      args.overrideParams.keywordSet ?? args.other.keywordSet,
      args.overrideParams.videoFrame ?? args.other.videoFrame
    );
    newOperation2.timestamp =
      args.overrideParams.timestamp !== undefined
        ? args.overrideParams.timestamp
        : args.other.timestamp;
    newOperation2.compressedImageFilePath =
      args.overrideParams.compressedImageFilePath !== undefined
        ? args.overrideParams.compressedImageFilePath
        : args.other.compressedImageFilePath;
    newOperation2.inputElements =
      args.overrideParams.inputElements !== undefined
        ? args.overrideParams.inputElements
        : args.other.inputElements;
    return newOperation2;
  }

  /**
   * Sequence number.
   */
  public sequence: number;

  /**
   * Input value.
   */
  public input: string;

  /**
   * Operation type.
   */
  public type: string;

  /**
   * Tag information to be operated.
   */
  public elementInfo: ElementInfo | null;

  /**
   * Operation target title.
   */
  public title: string;

  /**
   * URL to be operated.
   */
  public url: string;

  /**
   * Screen definition.
   */
  public screenDef: string;

  /**
   * Screen image path.
   */
  public imageFilePath: string;

  /**
   * Time of operation.
   */
  public timestamp: string;

  /**
   * Id of windowHandle that operated the screen
   */
  public windowHandle: string;

  /**
   * Compressed image file path.
   */
  public compressedImageFilePath?: string;

  /**
   * Input information.
   */
  public inputElements?: ElementInfo[];

  /**
   * InnterText set.
   */
  public keywordSet?: Set<string>;

  /**
   * Automatic or not.
   */
  public isAutomatic: boolean;

  /**
   * VideoFrame.
   */
  public videoFrame?: VideoFrame;

  /**
   * Constructor.
   * @param sequence Sequence number.
   * @param input  Input value.
   * @param type  Operation type.
   * @param elementInfo  Tag information to be operated.
   * @param title  Title of operation target.
   * @param url  URL to be operated.
   * @param screenDef  Screen definition.
   * @param imageFilePath  Screen image path.
   * @param isAutomatic Automatic or not.
   * @param windowHandle  Id of windowHandle that operated the screen.
   * @param keywordSet InnterText set.
   * @param videoFrame videoFrame.
   */
  constructor(
    sequence: number,
    input: string,
    type: string,
    elementInfo: ElementInfo | null,
    title: string,
    url: string,
    screenDef: string,
    imageFilePath: string,
    isAutomatic: boolean,
    windowHandle?: string,
    keywordSet?: Set<string>,
    videoFrame?: VideoFrame
  ) {
    this.sequence = sequence;
    this.input = input;
    this.type = type;
    this.elementInfo = elementInfo;
    this.title = title;
    this.url = url;
    this.screenDef = screenDef;
    this.imageFilePath = imageFilePath;
    this.isAutomatic = isAutomatic;
    this.timestamp = new TimestampImpl().unix().toString();
    this.windowHandle = windowHandle === undefined ? "" : windowHandle;
    this.keywordSet = keywordSet;
    this.videoFrame = videoFrame;
  }

  /**
   * Get the input value.
   * If the target is a checkbox, on / off is returned.
   */
  public get inputValue(): string {
    // TODO: When the separation and cooperation of ClientSideCaptureService is completed,
    // stop building the input field on the backend and aggregate it here, and name this getter input.

    return convertInputValue(this.elementInfo, this.input);
  }
}
