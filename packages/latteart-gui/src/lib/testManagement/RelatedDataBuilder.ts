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

import RelatedData from "@/lib/testManagement/RelatedData";
import { Story } from "./types";

/**
 * Classes to convert data to a storage format.
 */
export default class RelatedDataBuilder {
  private _stories: Story[] = [];
  private _deletedSessions: Array<{ storyId: string; sessionId: string }> = [];
  private _deletedAttachedFiles: Array<{
    storyId: string;
    sessionId: string;
    attachedFile: {
      path: string;
      name: string;
    };
  }> = [];
  private _deletedTestResultFiles: Array<{
    storyId: string;
    sessionId: string;
    testResultFile: {
      path: string;
      name: string;
    };
  }> = [];

  set stories(value: Story[]) {
    this._stories = JSON.parse(JSON.stringify(value));
  }

  set deleteSessions(value: Array<{ storyId: string; sessionId: string }>) {
    this._deletedSessions = value;
  }

  set deletedAttachedFiles(
    value: Array<{
      storyId: string;
      sessionId: string;
      attachedFile: {
        path: string;
        name: string;
      };
    }>
  ) {
    this._deletedAttachedFiles = value;
  }

  set deletedTestResultFiles(
    value: Array<{
      storyId: string;
      sessionId: string;
      testResultFile: {
        path: string;
        name: string;
      };
    }>
  ) {
    this._deletedTestResultFiles = value;
  }

  /**
   * Convert each data to a saved format and return.
   */
  public build(): RelatedData[] {
    const relatedDatas: RelatedData[] = [];

    for (const story of this._stories) {
      const deletedSessionIds = this._deletedSessions
        .filter((deletedSession) => {
          return deletedSession.storyId === story.id;
        })
        .map((deletedSession) => {
          return deletedSession.sessionId;
        });

      for (const deletedSessionId of deletedSessionIds) {
        relatedDatas.push({
          storyId: story.id,
          sessionId: deletedSessionId,
          sessionDeleted: true,
          addedAttachedFiles: [],
          addedTestResults: [],
          deletedAttachedFiles: [],
          deletedTestResults: [],
        });
      }

      // Instructions for adding or removing relevant data under the session.
      for (const session of story.sessions) {
        const relatedData: RelatedData = {
          storyId: story.id,
          sessionId: session.id as string,
          sessionDeleted: false,
          addedAttachedFiles: [],
          addedTestResults: [],
          deletedAttachedFiles: [],
          deletedTestResults: [],
        };

        const addedAttachedFiles = session.attachedFiles
          .filter((attachedFile) => !!attachedFile.fileUrl)
          .map((attachedFile) => {
            return {
              name: attachedFile.name,
              sourceFilePath: attachedFile.fileUrl as string,
            };
          });
        relatedData.addedAttachedFiles.push(...addedAttachedFiles);

        const addedTestResults =
          session.testResultFiles
            ?.filter((testResultFile) => testResultFile.id !== "")
            .map((testResultFile) => {
              return {
                name: testResultFile.name,
                sourceFilePath: testResultFile.id,
              };
            }) ?? [];
        relatedData.addedTestResults.push(...addedTestResults);

        const deletedAttachedFiles =
          this._deletedAttachedFiles
            .filter((item) => {
              return item.storyId === story.id && item.sessionId && story.id;
            })
            .map((item) => {
              return {
                path: item.attachedFile.path,
                name: item.attachedFile.name,
              };
            }) ?? [];
        relatedData.deletedAttachedFiles.push(...deletedAttachedFiles);

        const deletedTestResults =
          this._deletedTestResultFiles
            .filter((item) => {
              return item.storyId === story.id && item.sessionId && story.id;
            })
            .map((item) => {
              return {
                path: item.testResultFile.path,
                name: item.testResultFile.name,
              };
            }) ?? [];
        relatedData.deletedTestResults.push(...deletedTestResults);

        relatedDatas.push(relatedData);
      }
    }

    return relatedDatas;
  }
}
