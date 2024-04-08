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

import { type TestResultAccessor, type Video } from "latteart-client";
import { ActionFailure, type ActionResult, ActionSuccess } from "../common/ActionResult";

export type VideoRecorder = {
  readonly recordingVideo?: Video & { startTimestamp: number };
  startRecording(): Promise<ActionResult<void>>;
  updateVideo(): Promise<void>;
};

export function createVideoRecorder(testResult: TestResultAccessor): VideoRecorder {
  return new VideoRecorderImpl(testResult);
}

class VideoRecorderImpl implements VideoRecorder {
  private mediaRecorder: MediaRecorder | null;
  private videoInfo?: Video & { startTimestamp: number };

  constructor(private testResult: TestResultAccessor) {
    this.mediaRecorder = null;
  }

  public get recordingVideo(): (Video & { startTimestamp: number }) | undefined {
    return this.videoInfo;
  }

  public async startRecording(): Promise<ActionResult<void>> {
    const { startTimestamp, mediaRecorder } = await this.startMediaRecorder().catch((error) => {
      console.error(error);
      return { startTimestamp: 0, mediaRecorder: null };
    });

    if (!mediaRecorder) {
      return new ActionFailure({
        messageKey: "error.capture_control.start_video_recording_failed"
      });
    }

    const videoTrackSettings = mediaRecorder.stream.getVideoTracks().at(0)?.getSettings();

    const createVideoResult = await this.testResult.createVideo({
      width: videoTrackSettings?.width ?? 0,
      height: videoTrackSettings?.height ?? 0
    });

    if (createVideoResult.isFailure()) {
      return new ActionFailure({
        messageKey: `error.operation_history.${createVideoResult.error.errorCode}`
      });
    }

    this.mediaRecorder = mediaRecorder;
    this.videoInfo = { ...createVideoResult.data, startTimestamp };

    await this.updateVideo();

    return new ActionSuccess(undefined);
  }

  public updateVideo(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.mediaRecorder === null) {
        resolve();
        return;
      }

      if (this.mediaRecorder.state !== "recording") {
        resolve();
        return;
      }

      this.mediaRecorder.ondataavailable = async (blobEvent) => {
        if (!this.videoInfo) {
          resolve();
          return;
        }

        const buffer = await blobEvent.data.arrayBuffer();

        await this.testResult.appendVideoBuffer(this.videoInfo?.id, buffer);
        resolve();
      };

      this.mediaRecorder.requestData();
    });
  }

  private async startMediaRecorder() {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: { frameRate: 10 }
    });
    const tracks = [...stream.getTracks()];
    const mediaStream = new MediaStream(tracks);

    return new Promise<{
      startTimestamp: number;
      mediaRecorder: MediaRecorder;
    }>((resolve) => {
      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: "video/webm; codecs=vp9",
        videoBitsPerSecond: 2048000
      });

      mediaRecorder.onstart = () => {
        resolve({
          startTimestamp: new Date().getTime(),
          mediaRecorder: mediaRecorder
        });
      };

      mediaRecorder.start();
    });
  }
}
