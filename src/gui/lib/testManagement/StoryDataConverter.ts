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

import { Session, Issue, Story } from "./types";
import {
  ManagedStory,
  ManagedSession,
} from "@/lib/testManagement/TestManagementData";
import { OperationWithNotes } from "../operationHistory/types";
import { calculateElapsedEpochMillis } from "../common/util";
import { Note } from "../operationHistory/Note";
import { StoryConvertable } from "./actions/WriteDataFileAction";
import { GetTestResultAction } from "../operationHistory/actions/testResult/GetTestResultAction";
import { RepositoryContainer } from "../eventDispatcher/RepositoryContainer";

/**
 * Convert story information.
 */
export default class StoryDataConverter implements StoryConvertable {
  /**
   * Get the actual test result from the test result ID.
   * @param testResultFiles  test results. Use only the beginning of the array.
   * @param repositoryContainer  Callback function to get the test result.
   * @returns Test results testSteps.
   */
  private static async buildHistory(
    repositoryContainer: Pick<
      RepositoryContainer,
      "testResultRepository" | "projectRepository"
    >,
    testResultFiles?: {
      name: string;
      id: string;
    }[]
  ): Promise<{
    intentions?: Note[];
    initialUrl?: string;
    testingTime?: number;
    issues?: Issue[];
  }> {
    if (!testResultFiles) {
      return {};
    }

    if (testResultFiles.length === 0) {
      return { intentions: [], issues: [], initialUrl: "", testingTime: 0 };
    }

    const testResultFile = testResultFiles[0];

    const result = await new GetTestResultAction(
      repositoryContainer
    ).getTestResult(testResultFile.id);

    if (!result.data) {
      return {};
    }
    if (result.error) {
      console.log(result.error);
      return {};
    }

    const {
      testSteps: operationWithNotes,
      initialUrl,
      startTimeStamp,
    } = result.data;
    const testSteps: OperationWithNotes[] = operationWithNotes as any;

    const testingTime = calculateElapsedEpochMillis(startTimeStamp, testSteps);

    const issues: Issue[] = testSteps.flatMap((testStep) => {
      const noteWithTypes = [
        ...(testStep.bugs?.map((bug) => {
          return { type: "bug", note: bug };
        }) ?? []),
        ...(testStep.notices?.map((notice) => {
          return { type: "notice", note: notice };
        }) ?? []),
      ];

      return noteWithTypes.map(({ type, note }, index) => {
        const { status, ticketId } = {
          status: note.tags.includes("reported")
            ? "reported"
            : note.tags.includes("invalid")
            ? "invalid"
            : "",
          ticketId: "",
        };

        return {
          status,
          ticketId,
          source: {
            type,
            sequence: note.sequence,
            index,
          },
          value: note.value,
          details: note.details,
        };
      });
    });

    const intentions = testSteps.flatMap(({ intention }) => {
      if (!intention) {
        return [];
      }

      return [intention];
    });

    return { intentions, initialUrl, testingTime, issues };
  }

  public async convertToSession(
    target: Partial<ManagedSession>,
    repositoryContainer: Pick<
      RepositoryContainer,
      "testResultRepository" | "projectRepository"
    >,
    oldSession?: Session
  ): Promise<Session> {
    const { intentions, initialUrl, testingTime, issues } =
      await StoryDataConverter.buildHistory(
        repositoryContainer,
        target.testResultFiles
      );

    return {
      name: target.id ?? oldSession?.id ?? "",
      id: target.id ?? oldSession?.id ?? "",
      isDone: target.isDone ?? oldSession?.isDone ?? false,
      doneDate: target.doneDate ?? oldSession?.doneDate ?? "",
      testItem: target.testItem ?? oldSession?.testItem ?? "",
      testerName: target.testerName ?? oldSession?.testerName ?? "",
      memo: target.memo ?? oldSession?.memo ?? "",
      attachedFiles: target.attachedFiles ?? oldSession?.attachedFiles ?? [],
      testResultFiles:
        target.testResultFiles ?? oldSession?.testResultFiles ?? [],
      initialUrl: initialUrl ?? oldSession?.initialUrl ?? "",
      intentions: intentions ?? oldSession?.intentions ?? [],
      issues: issues ?? target.issues ?? [],
      testingTime: testingTime ?? 0,
    };
  }

  /**
   * Convert story information for storage to story information.
   * @param target  Story information for storage.
   * @param repositoryContainer  Callback function that associates test results.
   * @returns Story information after conversion.
   */
  public async convertToStory(
    target: ManagedStory,
    repositoryContainer: Pick<
      RepositoryContainer,
      "testResultRepository" | "projectRepository"
    >,
    oldStory?: Story
  ): Promise<Story> {
    return {
      ...target,
      sessions: await Promise.all(
        target.sessions.map(async (session) => {
          const oldSession = oldStory?.sessions.find((s) => {
            return s.id === session.id;
          });

          const newSession = {
            name: session.name,
            id: session.id,
            isDone: session.isDone,
            doneDate: session.doneDate,
            testItem: session.testItem,
            testerName: session.testerName,
            memo: session.memo,
            attachedFiles: session.attachedFiles,
            testResultFiles:
              JSON.stringify(session.testResultFiles ?? "") !==
              JSON.stringify(oldSession?.testResultFiles ?? "")
                ? session.testResultFiles
                : undefined,
            issues: session.issues,
            testingTime: session.testingTime,
          };

          return this.convertToSession(
            newSession,
            repositoryContainer,
            oldSession
          );
        })
      ),
    };
  }

  /**
   * Convert story information to management data.
   * @param story  Story information.
   * @returns Administrative data.
   */
  public convertToDataFormat(story: Story): {
    storyData: ManagedStory;
  } {
    return {
      storyData: {
        ...story,
        sessions: story.sessions.map((session) => {
          return {
            name: session.name,
            id: session.id,
            isDone: session.isDone,
            doneDate: session.doneDate,
            testItem: session.testItem,
            testerName: session.testerName,
            memo: session.memo,
            attachedFiles: session.attachedFiles,
            testResultFiles: session.testResultFiles,
            issues: session.issues.map((issue) => {
              return {
                type: issue.source.type,
                value: issue.value,
                details: issue.details,
                status: issue.status,
                ticketId: issue.ticketId,
                source: {
                  type: issue.source.type,
                  sequence: issue.source.sequence,
                  index: issue.source.index,
                },
              };
            }),
            testingTime: session.testingTime,
          };
        }),
      },
    };
  }
}
