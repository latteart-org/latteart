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

import path from "path";

export function extractProjectData(
  files: {
    filePath: string;
    data: string | Buffer;
  }[]
): ProjectData {
  const projectData: ProjectData = {
    projectId: "",
    projectFile: { fileName: "", data: "" },
    stories: [],
  };
  for (const file of files) {
    const fileName = path.basename(file.filePath);
    const divs = file.filePath.split("/");
    const projectsDirIndex = divs.findIndex((div) => {
      return div === "projects";
    });
    if (fileName === "project.json") {
      projectData.projectId = divs[projectsDirIndex + 1];
      projectData.projectFile.fileName = "project.json";
      projectData.projectFile.data = file.data as string;
      continue;
    }
    if (fileName === "progress.json") {
      projectData.progressesFile = {
        fileName: "progress.json",
        data: file.data as string,
      };
      continue;
    }
    const storyId = divs[projectsDirIndex + 2];
    const sessionId = divs[projectsDirIndex + 3];

    let targetStory = projectData.stories.find((story) => {
      return story.storyId === storyId;
    });
    if (!targetStory) {
      targetStory = {
        storyId,
        sessions: [],
      };
      projectData.stories.push(targetStory);
    }

    let targetSession = targetStory.sessions.find((session) => {
      return session.sessionId === sessionId;
    });
    if (!targetSession) {
      targetSession = {
        sessionId,
        attachedFiles: [],
      };
      targetStory.sessions.push(targetSession);
    }
    const dataBuffer =
      typeof file.data === "string" ? Buffer.from(file.data) : file.data;
    targetSession.attachedFiles.push({
      filePath: file.filePath,
      data: dataBuffer.toString("base64"),
    });
  }

  return projectData;
}

export function extractTestResultsData(
  testResultFiles: {
    filePath: string;
    data: string | Buffer;
  }[]
): TestResultData[] {
  const testResultMap: Map<string, TestResultData> = new Map();
  for (const testResultFile of testResultFiles) {
    const divs = testResultFile.filePath.split("/");
    const testResultPosition = divs.findIndex((div) => {
      return div === "test-results";
    });
    const testResultId = divs[testResultPosition + 1];

    const testResultObj: TestResultData = testResultMap.get(testResultId) ?? {
      testResultId,
      testResultFile: { fileName: "", data: "" },
      screenshots: [],
    };

    if (path.basename(testResultFile.filePath) === "log.json") {
      testResultObj.testResultFile = {
        fileName: testResultFile.filePath,
        data: testResultFile.data as string,
      };
    } else if (
      [".png", ".webp"].includes(path.extname(testResultFile.filePath)) &&
      typeof testResultFile.data !== "string"
    ) {
      testResultObj.screenshots.push({
        filePath: path.basename(testResultFile.filePath),
        data: testResultFile.data,
      });
    }
    testResultMap.set(testResultId, testResultObj);
  }

  const result = Array.from(testResultMap).map((testResult) => {
    return testResult[1];
  });

  return result;
}

export type TestResultData = {
  testResultId: string;
  testResultFile: { fileName: string; data: string };
  screenshots: { filePath: string; data: Buffer }[];
};

export type ProjectData = {
  projectId: string;
  projectFile: { fileName: string; data: string };
  stories: {
    storyId: string;
    sessions: {
      sessionId: string;
      attachedFiles: {
        filePath: string;
        data: string;
      }[];
    }[];
  }[];
  progressesFile?: { fileName: string; data: string };
};
