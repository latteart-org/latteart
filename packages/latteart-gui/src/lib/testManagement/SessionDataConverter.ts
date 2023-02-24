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

import { Session, Issue } from "./types";
import { ManagedSession } from "@/lib/testManagement/TestManagementData";
import { OperationWithNotes, TestResult } from "../operationHistory/types";
import { NoteForGUI } from "../operationHistory/NoteForGUI";
import {
  convertTestStepOperation,
  convertIntention,
  convertNote,
} from "../common/replyDataConverter";

export default class SessionDataConverter {
  public async convertToSession(
    target: Partial<ManagedSession & { testResult: TestResult }>,
    oldSession?: Session
  ): Promise<Session> {
    const { intentions, issues } = target.testResult
      ? await this.convertToSessionWithTestResult(target.testResult)
      : { intentions: [], issues: [] };

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
      initialUrl: target.testResult?.initialUrl ?? oldSession?.initialUrl ?? "",
      intentions: intentions ?? oldSession?.intentions ?? [],
      issues: issues ?? target.issues ?? [],
      testingTime: target.testingTime ?? 0,
    };
  }

  public getOldAndNewSession(
    target: {
      session: ManagedSession;
      testResult?: TestResult;
    },
    oldSessions?: Session[]
  ): {
    oldSession: Session | undefined;
    newSession: ManagedSession & { testResult?: TestResult };
  } {
    const oldSession = oldSessions?.find((s) => {
      return s.id === target.session.id;
    });

    const newSession = {
      name: target.session.name,
      id: target.session.id,
      isDone: target.session.isDone,
      doneDate: target.session.doneDate,
      testItem: target.session.testItem,
      testerName: target.session.testerName,
      memo: target.session.memo,
      attachedFiles: target.session.attachedFiles,
      testResultFiles:
        JSON.stringify(target.session.testResultFiles ?? "") !==
        JSON.stringify(oldSession?.testResultFiles ?? "")
          ? target.session.testResultFiles
          : undefined,
      issues: target.session.issues,
      testingTime: target.session.testingTime,
      testResult: target.testResult ?? undefined,
    };
    return { oldSession, newSession };
  }

  private async convertToSessionWithTestResult(
    testResult: TestResult
  ): Promise<{
    intentions?: NoteForGUI[];
    issues?: Issue[];
  }> {
    const testSteps: OperationWithNotes[] = testResult.testSteps.map(
      (testStep) => {
        const operation = testStep.operation
          ? convertTestStepOperation(testStep.operation)
          : testStep.operation;

        return {
          testStepId: testStep.id,
          operation,
          intention: testStep.intention
            ? convertIntention(testStep.intention)
            : null,
          notices:
            testStep.notices?.map((notice) => {
              return convertNote(notice);
            }) ?? null,
          bugs: [],
        };
      }
    );

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
          imageFilePath: note.imageFilePath || testStep.operation.imageFilePath,
          tags: note.tags,
        };
      });
    });

    const intentions = testSteps.flatMap(({ intention }) => {
      if (!intention) {
        return [];
      }

      return [intention];
    });

    return { intentions, issues };
  }
}
