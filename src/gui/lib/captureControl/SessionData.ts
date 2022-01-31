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

import { TimestampImpl } from "../common/Timestamp";

/**
 * Session information.
 */
export class SessionData {
  private sessionId = "";
  private sequence = 0;
  private startTimeStamp = 0;
  private endTimeStamp = -1;

  /**
   * Constructor.
   * @param sessionId  Session ID.
   * @param sequence  Sequence number.
   * @param startTimeStamp  Session start time.
   * @param endTimeStamp  Session end time.
   */
  constructor(
    sessionId?: any,
    sequence?: any,
    startTimeStamp?: any,
    endTimeStamp?: any
  ) {
    if (sessionId) {
      this.sessionId = sessionId;
      this.sequence = sequence;
      this.startTimeStamp = startTimeStamp;
      this.endTimeStamp = endTimeStamp;
    } else {
      const sessionTimestamp = new TimestampImpl().format("YYYYMMDD_HHmmss");
      this.sessionId = `session_${sessionTimestamp}`;
      this.sequence = 0;
      this.startTimeStamp = 0;
      this.endTimeStamp = -1;
    }
  }

  /**
   * Get session ID.
   * @returns Session ID.
   */
  public getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get the sequence number of the test step.
   * @returns sequence  Sequence number.
   */
  public getSequence(): number {
    return this.sequence;
  }

  /**
   * Increment sequence number.
   */
  public incrementSequence(): void {
    this.sequence = this.sequence + 1;
  }

  /**
   * Set session start time.
   * @param unixTimeStamp  Session start time.
   */
  public setStartTimeStamp(unixTimeStamp: number): void {
    this.startTimeStamp = unixTimeStamp;
  }

  /**
   * Get session start time.
   * @returns Session start time.
   */
  public getStartTimeStamp(): number {
    return this.startTimeStamp;
  }

  /**
   * Set session end time.
   * @param unixTimeStamp  Session end time.
   */
  public setEndTimeStamp(unixTimeStamp: number): void {
    this.endTimeStamp = unixTimeStamp;
  }

  /**
   * Get session end time.
   * @returns Session end time.
   */
  public getEndTimeStamp(): number {
    return this.endTimeStamp;
  }

  /**
   * Determine if the session ended normally.
   * @returns Returns true if successful.
   */
  public isCompletedEnd(): boolean {
    if (this.endTimeStamp <= 0) {
      return false;
    }
    return true;
  }

  /**
   * Start a session.
   * @param endOperationTimeStamp  Last session end time.
   * @returns Session start time.
   */
  public startSession(endOperationTimeStamp?: number): number {
    // If it did not end normally last time, or when creating a new one.
    if (this.endTimeStamp <= 0) {
      if (!endOperationTimeStamp) {
        this.startTimeStamp = new TimestampImpl().unix();
        return this.startTimeStamp;
      }
      this.endTimeStamp = endOperationTimeStamp;
    }
    const timeDifference = this.endTimeStamp - this.startTimeStamp;
    this.startTimeStamp = new TimestampImpl().unix() - timeDifference;
    this.endTimeStamp = -1;

    return this.startTimeStamp;
  }

  /**
   * End session.
   */
  public endSession(): void {
    this.endTimeStamp = new TimestampImpl().unix();
  }
}
