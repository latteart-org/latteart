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

import { Story, Session } from "@/lib/testManagement/types";

/**
 * Returns session information with the specified session ID from within the story.
 * @param story  Story information.
 * @param sessionId  Search target session id.
 * @returns session information.
 */
export function getTargetSessions(
  story: Story,
  sessionIds: string[]
): Session[] | null {
  const targetSessions = story.sessions.filter((session: Session) => {
    return sessionIds.includes(session.id);
  });

  if (targetSessions.length === 0) {
    return null;
  }
  return targetSessions;
}
