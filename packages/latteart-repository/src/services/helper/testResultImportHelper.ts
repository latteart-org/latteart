/**
 * Copyright 2025 NTT Corporation.
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

import {
  DeserializedTestResult,
  DeserializedTestStep,
  HistoryItemExportDataV0,
  HistoryItemExportDataV1,
  HistoryItemExportDataV2,
  HistoryItemExportDataV3,
  TestResultExportDataV0,
  TestResultExportDataV1,
  TestResultExportDataV2,
  TestResultExportDataV3,
} from "@/interfaces/exportData";

export const deserializeTestResult = (
  testResultData: string
): DeserializedTestResult => {
  const data = JSON.parse(testResultData);

  const version: number = data.version ?? 0;

  if (version === 1) {
    const v1FormatData = validateV1Format(data);
    return deserializeTestResultV1(v1FormatData);
  }

  if (version === 2) {
    const v2FormatData = validateV2Format(data);
    return deserializeTestResultV2(v2FormatData);
  }

  if (version === 3) {
    const v3FormatData = validateV3Format(data);
    return deserializeTestResultV3(v3FormatData);
  }

  return deserializeTestResultV0(data);
};

const validateV1Format = (data: any): TestResultExportDataV1 => {
  if (
    Object.values(data.history).every((historyItem: any) => {
      return historyItem.testPurpose !== undefined && historyItem.notes;
    })
  ) {
    return data;
  }

  throw new Error("ImportData is invalid format.");
};

const validateV2Format = (data: any): TestResultExportDataV2 => {
  if (
    Object.values(data.history).every((historyItem: any) => {
      return historyItem.testPurpose !== undefined && historyItem.notes;
    })
  ) {
    return data;
  }

  throw new Error("ImportData is invalid format.");
};

const validateV3Format = (data: any): TestResultExportDataV3 => {
  if (
    Object.values(data.history).every((historyItem: any) => {
      return historyItem.testPurpose !== undefined && historyItem.notes;
    })
  ) {
    return data;
  }

  throw new Error("ImportData is invalid format.");
};

const deserializeTestResultV0 = (
  formattedData: TestResultExportDataV0
): DeserializedTestResult => {
  const entries: [string, HistoryItemExportDataV0][] = Object.entries(
    formattedData.history
  );

  let lastTimestamp: string;
  const testSteps = entries.map(([_, item]) => {
    const testPurpose = (() => {
      const intention = formattedData.notes.find(
        (note) => note.id === item.intention
      );

      return intention ? intention : null;
    })();

    const notes = [...item.notices, ...item.bugs].flatMap((noteId) => {
      const note = formattedData.notes.find((note) => note.id === noteId);

      return note ? [{ ...note, timestamp: note.timestamp * 1000 }] : [];
    });

    let epochMilliseconds = Number(item.testStep.timestamp) * 1000;

    if (lastTimestamp === item.testStep.timestamp) {
      epochMilliseconds = epochMilliseconds + 1;
    } else {
      lastTimestamp = item.testStep.timestamp;
    }

    return {
      id: "",
      operation: {
        input: item.testStep.operation.input,
        type: item.testStep.operation.type,
        elementInfo: item.testStep.operation.elementInfo,
        title: item.testStep.pageInfo.title,
        url: item.testStep.pageInfo.url,
        imageFileUrl: item.testStep.imageFileUrl,
        timestamp: epochMilliseconds.toString(),
        windowHandle: item.testStep.windowInfo.windowHandle,
        inputElements: item.testStep.inputElements,
        keywordTexts: item.testStep.pageInfo.keywordTexts,
        isAutomatic: false,
      },
      testPurpose,
      notes,
    };
  });

  const testingTime = calculateTestingTime(
    testSteps,
    formattedData.startTimeStamp
  );

  const testResult = {
    id: formattedData.sessionId,
    name: formattedData.name,
    startTimeStamp: formattedData.startTimeStamp,
    lastUpdateTimeStamp: Number(
      testSteps[testSteps.length - 1].operation.timestamp
    ),
    initialUrl: formattedData.initialUrl,
    testingTime,
    testSteps,
    coverageSources: formattedData.coverageSources,
    creationTimestamp: 0,
  };
  return testResult;
};

const deserializeTestResultV1 = (
  formattedData: TestResultExportDataV1
): DeserializedTestResult => {
  const entries: [string, HistoryItemExportDataV1][] = Object.entries(
    formattedData.history
  );
  const testSteps = entries.map(([_, item]) => {
    const testPurpose = (() => {
      const testPurpose = formattedData.notes.find(
        (note) => note.id === item.testPurpose
      );

      return testPurpose ? testPurpose : null;
    })();

    const notes = item.notes.flatMap((noteId) => {
      const note = formattedData.notes.find((note) => note.id === noteId);

      return note ? [{ ...note, timestamp: note.timestamp * 1000 }] : [];
    });

    return {
      id: "",
      operation: {
        input: item.testStep.operation.input,
        type: item.testStep.operation.type,
        elementInfo: item.testStep.operation.elementInfo,
        title: item.testStep.pageInfo.title,
        url: item.testStep.pageInfo.url,
        imageFileUrl: item.testStep.imageFileUrl,
        timestamp: item.testStep.timestamp,
        windowHandle: item.testStep.windowInfo.windowHandle,
        inputElements: item.testStep.inputElements,
        keywordTexts: item.testStep.pageInfo.keywordTexts,
        isAutomatic: item.testStep.operation.isAutomatic ?? false,
      },
      testPurpose,
      notes,
    };
  });

  const testingTime = calculateTestingTime(
    testSteps,
    formattedData.startTimeStamp
  );

  const testResult = {
    id: formattedData.sessionId,
    name: formattedData.name,
    startTimeStamp: formattedData.startTimeStamp,
    lastUpdateTimeStamp: Number(
      testSteps[testSteps.length - 1].operation.timestamp
    ),
    initialUrl: formattedData.initialUrl,
    testingTime,
    testSteps,
    coverageSources: formattedData.coverageSources,
    creationTimestamp: 0,
  };
  return testResult;
};

const deserializeTestResultV2 = (
  formattedData: TestResultExportDataV2
): DeserializedTestResult => {
  const entries: [string, HistoryItemExportDataV2][] = Object.entries(
    formattedData.history
  );
  const testSteps = entries.map(([_, item]) => {
    const testPurpose = (() => {
      const testPurpose = formattedData.notes.find(
        (note) => note.id === item.testPurpose
      );

      return testPurpose ? testPurpose : null;
    })();

    const notes = item.notes.flatMap((noteId) => {
      const note = formattedData.notes.find((note) => note.id === noteId);

      return note ? [{ ...note, timestamp: note.timestamp * 1000 }] : [];
    });

    return {
      id: "",
      operation: {
        input: item.testStep.operation.input,
        type: item.testStep.operation.type,
        elementInfo: item.testStep.operation.elementInfo,
        title: item.testStep.pageInfo.title,
        url: item.testStep.pageInfo.url,
        imageFileUrl: item.testStep.imageFileUrl,
        timestamp: item.testStep.timestamp,
        windowHandle: item.testStep.windowInfo.windowHandle,
        inputElements: item.testStep.inputElements,
        keywordTexts: item.testStep.pageInfo.keywordTexts,
        isAutomatic: item.testStep.operation.isAutomatic ?? false,
        scrollPosition: item.testStep.operation.scrollPosition,
        clientSize: item.testStep.operation.clientSize,
      },
      testPurpose,
      notes,
    };
  });

  const testResult = {
    id: formattedData.sessionId,
    name: formattedData.name,
    startTimeStamp: formattedData.startTimeStamp,
    lastUpdateTimeStamp: formattedData.lastUpdateTimeStamp,
    initialUrl: formattedData.initialUrl,
    testingTime: formattedData.testingTime,
    testSteps,
    coverageSources: formattedData.coverageSources,
    creationTimestamp: 0,
  };
  return testResult;
};

const deserializeTestResultV3 = (
  formattedData: TestResultExportDataV3
): DeserializedTestResult => {
  const entries: [string, HistoryItemExportDataV3][] = Object.entries(
    formattedData.history
  );
  const testSteps = entries.map(([_, item]) => {
    const testPurpose = (() => {
      const testPurpose = formattedData.notes.find(
        (note) => note.id === item.testPurpose
      );

      return testPurpose ? testPurpose : null;
    })();

    const notes = item.notes.flatMap((noteId) => {
      const note = formattedData.notes.find((note) => note.id === noteId);

      return note ? [note] : [];
    });

    return {
      id: "",
      operation: {
        input: item.testStep.operation.input,
        type: item.testStep.operation.type,
        elementInfo: item.testStep.operation.elementInfo,
        title: item.testStep.pageInfo.title,
        url: item.testStep.pageInfo.url,
        imageFileUrl: item.testStep.imageFileUrl,
        timestamp: item.testStep.timestamp,
        windowHandle: item.testStep.windowInfo.windowHandle,
        inputElements: item.testStep.inputElements,
        keywordTexts: item.testStep.pageInfo.keywordTexts,
        isAutomatic: item.testStep.operation.isAutomatic ?? false,
        scrollPosition: item.testStep.operation.scrollPosition,
        clientSize: item.testStep.operation.clientSize,
        videoFrame: item.testStep.operation.videoFrame,
      },
      testPurpose,
      notes,
    };
  });

  return {
    id: formattedData.sessionId,
    name: formattedData.name,
    startTimeStamp: formattedData.startTimeStamp,
    lastUpdateTimeStamp: formattedData.lastUpdateTimeStamp,
    initialUrl: formattedData.initialUrl,
    testingTime: formattedData.testingTime,
    testSteps,
    coverageSources: formattedData.coverageSources,
    creationTimestamp: formattedData.creationTimestamp,
  };
};

const calculateTestingTime = (
  testSteps: DeserializedTestStep[],
  startTimeStamp: number
): number => {
  const lastTestStartTime =
    Number(
      testSteps.find((testStep) => {
        return Number(testStep.operation.timestamp) > startTimeStamp;
      })?.operation.timestamp
    ) ?? startTimeStamp;

  const lastTestingTime = (() => {
    const lastOperationTimestamp =
      Number(
        testSteps
          .slice()
          .reverse()
          .find((testStep) => {
            return testStep.operation.timestamp;
          })?.operation.timestamp
      ) ?? lastTestStartTime;

    return lastOperationTimestamp - lastTestStartTime;
  })();

  const otherTestingTime = (() => {
    const otherTestStep = testSteps.filter((testStep) => {
      return Number(testStep.operation.timestamp) < lastTestStartTime;
    });
    if (otherTestStep.length > 0) {
      const otherStartTime = Number(otherTestStep[0].operation.timestamp);
      const otherEndTime = Number(
        otherTestStep[otherTestStep.length - 1].operation.timestamp
      );
      return otherEndTime - otherStartTime;
    } else {
      return 0;
    }
  })();

  return lastTestingTime + otherTestingTime;
};
