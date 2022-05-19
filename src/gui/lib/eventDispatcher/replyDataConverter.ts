import { TestStepOperation } from "../operationHistory/types";
import { Operation } from "../operationHistory/Operation";
import { Note } from "../operationHistory/Note";

export function convertTestStepOperation(
  testStepOperation: TestStepOperation,
  serviceUrl: string
): Operation {
  const operation = Operation.createOperation({
    input: testStepOperation.input,
    type: testStepOperation.type,
    elementInfo: testStepOperation.elementInfo,
    title: testStepOperation.title,
    url: testStepOperation.url,
    imageFilePath: testStepOperation.imageFileUrl
      ? new URL(testStepOperation.imageFileUrl, serviceUrl).toString()
      : testStepOperation.imageFileUrl,
    windowHandle: testStepOperation.windowHandle,
    timestamp: testStepOperation.timestamp,
    inputElements: testStepOperation.inputElements,
    keywordSet: new Set(testStepOperation.keywordTexts),
  });

  return operation;
}

export function convertIntention(
  testStepIntention: {
    id: string;
    type: string;
    value: string;
    details: string;
    imageFileUrl: string;
    tags: string[];
  },
  sequence?: number
): Note {
  const intention = new Note({
    id: testStepIntention.id,
    sequence: sequence,
    value: testStepIntention.value,
    details: testStepIntention.details,
    tags: testStepIntention.tags,
  });

  return intention;
}

export function convertNote(
  item: {
    id: string;
    type: string;
    value: string;
    details: string;
    imageFileUrl?: string;
    tags?: string[];
  },
  serviceUrl: string
): Note {
  const data = new Note({
    id: item.id,
    value: item.value,
    details: item.details,
    tags: item.tags,
    imageFilePath: item.imageFileUrl
      ? new URL(item.imageFileUrl, serviceUrl).toString()
      : "",
  });

  return data;
}

export function convertNoteWithoutId(
  item: {
    id: string;
    type: string;
    value: string;
    details: string;
    imageFileUrl?: string;
    tags?: string[];
  },
  serviceUrl: string
): Note {
  const data = new Note({
    value: item.value,
    details: item.details,
    tags: item.tags,
    imageFilePath: item.imageFileUrl
      ? new URL(item.imageFileUrl, serviceUrl).toString()
      : "",
  });

  return data;
}
