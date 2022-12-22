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

import { Story, Session, Issue } from "@/lib/testManagement/types";

/**
 * Gets the specified session from within the story.
 * @param tempStory  story.
 * @param sessionId  The id of the session you want to get.
 * @returns Target session.
 */
export function getTargetSession(
  tempStory: Story,
  sessionId: string
): Session | null {
  const story = tempStory;
  const targetSession = story.sessions.find((session: Session) => {
    return session.id === sessionId;
  });
  if (targetSession) {
    return targetSession;
  }
  return null;
}

/**
 * Change the status of an issue.
 * @param issues  Issues that contain changes
 * @param note.sequence  Sequence of the issue to be changed.
 * @param note.index  Index of issue to be changed.
 * @param note.type  Type of issue to be changed.
 * @param status  Status after change.
 * @param ticketId  ticketId
 * @returns Issues after change.
 */
export function changeIssueStatus(
  issues: Issue[],
  note: { sequence: number; index: number; type: string },
  status: string,
  ticketId?: string
): Issue[] {
  return issues.map((issue: Issue) => {
    if (
      issue.source.sequence === note.sequence &&
      issue.source.index === note.index &&
      issue.source.type === note.type
    ) {
      return {
        source: {
          type: issue.source.type,
          sequence: issue.source.sequence,
          index: issue.source.index,
        },
        status: status ? status : issue.status,
        ticketId: ticketId ? ticketId : issue.ticketId,
        value: issue.value,
        details: issue.details,
        imageFilePath: issue.imageFilePath,
      };
    }
    return issue;
  });
}
